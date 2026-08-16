<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Services\AuditLogService;
use App\Services\UnitConverterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Purchase::with(['supplier', 'items.inventoryItem', 'creator']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('purchase_number', 'like', "%{$search}%")
                  ->orWhere('supplier_name_text', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('purchase_date', $request->date);
        }

        $purchases = $query->orderByDesc('purchase_date')->orderByDesc('id')->paginate(15)->withQueryString();
        $suppliers = Supplier::orderBy('name')->get();
        $inventoryItems = InventoryItem::orderBy('name')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');

        return Inertia::render('admin/purchases/index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'inventoryItems' => $inventoryItems,
            'currency' => $currency,
            'filters' => $request->only(['search', 'date']),
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
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|numeric|gt:0',
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
                    'inventory_item_id' => $itemData['inventory_item_id'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $lineTotal,
                    'expiry_date' => $itemData['expiry_date'] ?? null,
                ]);

                // If purchase status is 'received', immediately adjust stock & cost
                if ($validated['status'] === 'received') {
                    $invItem = InventoryItem::find($itemData['inventory_item_id']);
                    if ($invItem) {
                        $convertedQty = UnitConverterService::convert($itemData['quantity'], $itemData['unit'], $invItem->unit);
                        $invItem->increment('current_stock', $convertedQty);

                        // Update latest unit cost and optional expiry date
                        $invItem->cost_per_unit = $itemData['unit_price'];
                        if (!empty($itemData['expiry_date'])) {
                            $invItem->expiry_date = $itemData['expiry_date'];
                        }
                        $invItem->save();

                        InventoryMovement::create([
                            'inventory_item_id' => $invItem->id,
                            'type' => 'in',
                            'quantity' => $convertedQty,
                            'unit' => $invItem->unit,
                            'cost_per_unit' => $itemData['unit_price'],
                            'reference_type' => 'Purchase',
                            'reference_id' => $purchase->id,
                            'notes' => "Purchase {$purchase->purchase_number}",
                        ]);
                    }
                }
            }

            AuditLogService::log("Recorded purchase order {$purchaseNumber} for total {$totalAmount}", "purchases");
        });

        return redirect()->back()->with('success', 'Purchase record created successfully.');
    }

    public function updateStatus(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,pending,approved,received',
        ]);

        $oldStatus = $purchase->status;
        $newStatus = $validated['status'];

        if ($oldStatus !== 'received' && $newStatus === 'received') {
            DB::transaction(function () use ($purchase, $newStatus) {
                $purchase->update(['status' => $newStatus]);

                foreach ($purchase->items as $itemData) {
                    $invItem = InventoryItem::find($itemData->inventory_item_id);
                    if ($invItem) {
                        $convertedQty = UnitConverterService::convert($itemData->quantity, $itemData->unit, $invItem->unit);
                        $invItem->increment('current_stock', $convertedQty);
                        $invItem->cost_per_unit = $itemData->unit_price;
                        if ($itemData->expiry_date) {
                            $invItem->expiry_date = $itemData->expiry_date;
                        }
                        $invItem->save();

                        InventoryMovement::create([
                            'inventory_item_id' => $invItem->id,
                            'type' => 'in',
                            'quantity' => $convertedQty,
                            'unit' => $invItem->unit,
                            'cost_per_unit' => $itemData->unit_price,
                            'reference_type' => 'Purchase',
                            'reference_id' => $purchase->id,
                            'notes' => "Purchase {$purchase->purchase_number} marked Received",
                        ]);
                    }
                }
            });
        } else {
            $purchase->update(['status' => $newStatus]);
        }

        AuditLogService::log("Updated purchase {$purchase->purchase_number} status to {$newStatus}", "purchases");

        return redirect()->back()->with('success', 'Purchase status updated.');
    }

    public function destroy(Purchase $purchase)
    {
        $number = $purchase->purchase_number;
        $purchase->delete();

        AuditLogService::log("Deleted purchase {$number}", "purchases");

        return redirect()->back()->with('success', 'Purchase deleted.');
    }
}
