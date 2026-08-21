<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Supplier;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Supplier::withCount('purchases')->with(['purchases' => function ($q) {
            $q->orderByDesc('purchase_date')->limit(5);
        }]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')->paginate(15)->withQueryString();
        $currency = AppSetting::getByKey('default_currency', '৳');

        return Inertia::render('admin/suppliers/index', [
            'suppliers' => $suppliers,
            'currency' => $currency,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $supplier = Supplier::create($validated);

        AuditLogService::log("Created vendor supplier: {$supplier->name}", "suppliers");

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $supplier->update($validated);

        AuditLogService::log("Updated supplier: {$supplier->name}", "suppliers");

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        $name = $supplier->name;
        $supplier->delete();

        AuditLogService::log("Deleted supplier: {$name}", "suppliers");

        return redirect()->back()->with('success', 'Supplier deleted.');
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $query = Supplier::withCount('purchases')->withSum('purchases', 'total_amount');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Suppliers & Vendors');

        // Header Title
        $sheet->setCellValue('A1', 'SUPPLIERS & VENDORS DIRECTORY');
        $sheet->mergeCells('A1:H1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $filters = [];
        if ($request->filled('search')) {
            $filters[] = 'Search: ' . $request->search;
        }
        $sheet->setCellValue('A2', ($filters ? implode(' | ', $filters) : 'All Suppliers & Vendors') . ' | Exported: ' . now()->format('Y-m-d H:i'));
        $sheet->mergeCells('A2:H2');

        // Table Column Headers
        $headers = [
            'Vendor Name',
            'Contact Person',
            'Phone',
            'Email',
            'Address',
            'Total POs Count',
            'Total Spend (' . $currency . ')',
            'Notes',
        ];

        foreach ($headers as $i => $header) {
            $col = chr(65 + $i);
            $sheet->setCellValue($col . '4', $header);
            $sheet->getStyle($col . '4')->getFont()->setBold(true);
        }

        $row = 5;
        $totalPOs = 0;
        $totalSpend = 0.0;

        foreach ($suppliers as $s) {
            $poCount = (int) ($s->purchases_count ?? 0);
            $spend = (float) ($s->purchases_sum_total_amount ?? 0.0);

            $sheet->setCellValue('A' . $row, $s->name);
            $sheet->setCellValue('B' . $row, $s->contact_person ?? '-');
            $sheet->setCellValue('C' . $row, $s->phone ?? '-');
            $sheet->setCellValue('D' . $row, $s->email ?? '-');
            $sheet->setCellValue('E' . $row, $s->address ?? '-');
            $sheet->setCellValue('F' . $row, $poCount);
            $sheet->setCellValue('G' . $row, $spend);
            $sheet->getStyle('G' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->setCellValue('H' . $row, $s->notes ?? '-');

            $totalPOs += $poCount;
            $totalSpend += $spend;
            $row++;
        }

        // Summary Row
        $row++;
        $sheet->setCellValue('E' . $row, 'TOTAL:');
        $sheet->getStyle('E' . $row)->getFont()->setBold(true);
        $sheet->setCellValue('F' . $row, $totalPOs);
        $sheet->getStyle('F' . $row)->getFont()->setBold(true);
        $sheet->setCellValue('G' . $row, $totalSpend);
        $sheet->getStyle('G' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->getStyle('G' . $row)->getFont()->setBold(true);

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'Suppliers_Vendors_' . date('Y-m-d') . '.xlsx';
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
