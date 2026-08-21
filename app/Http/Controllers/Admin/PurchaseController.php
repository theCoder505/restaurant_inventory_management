<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Purchase::with(['supplier', 'items', 'creator']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('purchase_number', 'like', "%{$search}%")
                  ->orWhere('supplier_name_text', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('items', function ($iq) use ($search) {
                      $iq->where('ingredient_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('purchase_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('purchase_date', '<=', $request->to_date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Calculate total cost sum across all matching records before pagination
        $totalCost = (float) (clone $query)->sum('total_amount');

        // Latest entry first
        $purchases = $query->orderByDesc('purchase_date')->orderByDesc('id')->paginate(15)->withQueryString();
        $suppliers = Supplier::orderBy('name')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');
        $expiryThreshold = (float) AppSetting::getByKey('expiry_warning_threshold', '80');

        return Inertia::render('admin/purchases/index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'currency' => $currency,
            'totalCost' => $totalCost,
            'expiryThreshold' => $expiryThreshold,
            'filters' => $request->only(['search', 'from_date', 'to_date', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'supplier_name_text' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'status' => 'required|in:draft,pending,approved,received',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.ingredient_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|gt:0',
            'items.*.used_amount' => 'nullable|numeric|min:0',
            'items.*.unit' => 'required|string',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.expiry_date' => 'nullable|date',
        ]);

        DB::transaction(function () use ($validated) {
            $purchaseNumber = 'PO-' . date('Ymd') . '-' . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
            $totalAmount = 0;

            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $purchase = Purchase::create([
                'purchase_number' => $purchaseNumber,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'supplier_name_text' => $validated['supplier_name_text'] ?? null,
                'purchase_date' => $validated['purchase_date'],
                'status' => $validated['status'],
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
                'created_by' => Auth::id(),
            ]);

            foreach ($validated['items'] as $itemData) {
                $lineTotal = $itemData['quantity'] * $itemData['unit_price'];

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'ingredient_name' => $itemData['ingredient_name'],
                    'quantity' => $itemData['quantity'],
                    'used_amount' => $itemData['used_amount'] ?? 0,
                    'unit' => $itemData['unit'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $lineTotal,
                    'expiry_date' => $itemData['expiry_date'] ?? null,
                ]);
            }

            AuditLogService::log("Created Purchase Order {$purchaseNumber} total {$totalAmount}", "purchases");
        });

        return redirect()->back()->with('success', 'Purchase Order created successfully.');
    }

    public function update(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'supplier_name_text' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'status' => 'required|in:draft,pending,approved,received',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.ingredient_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|gt:0',
            'items.*.used_amount' => 'nullable|numeric|min:0',
            'items.*.unit' => 'required|string',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.expiry_date' => 'nullable|date',
        ]);

        DB::transaction(function () use ($validated, $purchase) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $purchase->update([
                'supplier_id' => $validated['supplier_id'] ?? null,
                'supplier_name_text' => $validated['supplier_name_text'] ?? null,
                'purchase_date' => $validated['purchase_date'],
                'status' => $validated['status'],
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Recreate line items
            $purchase->items()->delete();

            foreach ($validated['items'] as $itemData) {
                $lineTotal = $itemData['quantity'] * $itemData['unit_price'];

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'ingredient_name' => $itemData['ingredient_name'],
                    'quantity' => $itemData['quantity'],
                    'used_amount' => $itemData['used_amount'] ?? 0,
                    'unit' => $itemData['unit'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $lineTotal,
                    'expiry_date' => $itemData['expiry_date'] ?? null,
                ]);
            }

            AuditLogService::log("Updated Purchase Order {$purchase->purchase_number}", "purchases");
        });

        return redirect()->back()->with('success', 'Purchase Order updated successfully.');
    }

    public function destroy(Purchase $purchase)
    {
        $number = $purchase->purchase_number;
        $purchase->delete();

        AuditLogService::log("Deleted Purchase Order {$number}", "purchases");

        return redirect()->back()->with('success', 'Purchase Order deleted.');
    }

    public function expiryWarnings(Request $request): Response
    {
        $thresholdPercent = (float) AppSetting::getByKey('expiry_warning_threshold', '80');
        $thresholdRatio = $thresholdPercent / 100;

        $query = PurchaseItem::with(['purchase.supplier'])
            ->where('quantity', '>', 0)
            ->whereRaw('(used_amount / quantity) >= ?', [$thresholdRatio]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ingredient_name', 'like', "%{$search}%")
                  ->orWhereHas('purchase', function ($pq) use ($search) {
                      $pq->where('purchase_number', 'like', "%{$search}%")
                        ->orWhere('supplier_name_text', 'like', "%{$search}%");
                  });
            });
        }

        $items = $query->orderByDesc('id')->paginate(15)->withQueryString();
        $currency = AppSetting::getByKey('default_currency', '৳');

        return Inertia::render('admin/purchases/expiry-warnings', [
            'warningItems' => $items,
            'thresholdPercent' => $thresholdPercent,
            'currency' => $currency,
            'filters' => $request->only(['search']),
        ]);
    }

    public function updateUsedAmount(Request $request, PurchaseItem $item)
    {
        $validated = $request->validate([
            'used_amount' => 'required|numeric|min:0',
        ]);

        $item->update(['used_amount' => $validated['used_amount']]);

        AuditLogService::log("Updated used amount for {$item->ingredient_name} to {$validated['used_amount']} {$item->unit}", "purchases");

        return redirect()->back()->with('success', 'Used amount updated.');
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $query = Purchase::with(['supplier', 'items']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('purchase_number', 'like', "%{$search}%")
                  ->orWhere('supplier_name_text', 'like', "%{$search}%")
                  ->orWhereHas('supplier', fn($sq) => $sq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('purchase_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('purchase_date', '<=', $request->to_date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $purchases = $query->orderByDesc('purchase_date')->orderByDesc('id')->get();
        $currency  = AppSetting::getByKey('default_currency', '৳');

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Purchase Orders');

        $sheet->setCellValue('A1', 'PURCHASES & PURCHASE ORDERS (PO) LOG');
        $sheet->mergeCells('A1:G1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $filters = [];
        if ($request->filled('from_date')) $filters[] = 'From: ' . $request->from_date;
        if ($request->filled('to_date'))   $filters[] = 'To: ' . $request->to_date;
        if ($request->filled('status'))    $filters[] = 'Status: ' . strtoupper($request->status);
        if ($request->filled('search'))    $filters[] = 'Search: ' . $request->search;
        $sheet->setCellValue('A2', ($filters ? implode(' | ', $filters) : 'All Purchases') . ' | Exported: ' . now()->format('Y-m-d H:i'));
        $sheet->mergeCells('A2:G2');

        $cols = ['PO #', 'Date', 'Supplier', 'Status', 'Items', 'Notes', 'Total Amount'];
        foreach ($cols as $i => $col) {
            $letter = chr(65 + $i);
            $sheet->setCellValue($letter . '4', $col);
            $sheet->getStyle($letter . '4')->getFont()->setBold(true);
        }

        $row   = 5;
        $total = 0;
        foreach ($purchases as $purchase) {
            $supplierName = $purchase->supplier->name ?? $purchase->supplier_name_text ?? 'Unknown';
            $itemsSummary = $purchase->items->map(fn($i) => $i->ingredient_name . ' (' . $i->quantity . ' ' . $i->unit . ')')->join(', ');

            $sheet->setCellValue('A' . $row, $purchase->purchase_number);
            $sheet->setCellValue('B' . $row, $purchase->purchase_date);
            $sheet->setCellValue('C' . $row, $supplierName);
            $sheet->setCellValue('D' . $row, strtoupper($purchase->status));
            $sheet->setCellValue('E' . $row, $itemsSummary);
            $sheet->setCellValue('F' . $row, $purchase->notes ?? '-');
            $sheet->setCellValue('G' . $row, (float)$purchase->total_amount);
            $sheet->getStyle('G' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            $total += (float)$purchase->total_amount;
            $row++;
        }

        $row++;
        $sheet->setCellValue('F' . $row, 'TOTAL:');
        $sheet->getStyle('F' . $row)->getFont()->setBold(true);
        $sheet->setCellValue('G' . $row, $total);
        $sheet->getStyle('G' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->getStyle('G' . $row)->getFont()->setBold(true);

        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'Purchases_PO_' . date('Y-m-d') . '.xlsx';
        $httpHeaders = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ];

        $callback = function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        };

        return response()->stream($callback, 200, $httpHeaders);
    }
}
