<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Services\AuditLogService;
use App\Services\UnitConverterService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = InventoryItem::with(['category', 'movements' => function ($q) {
            $q->orderByDesc('created_at')->limit(5);
        }]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->boolean('low_stock_only')) {
            $query->whereColumn('current_stock', '<=', 'min_stock_threshold');
        }

        $items = $query->orderBy('name')->paginate(15)->withQueryString();
        $categories = Category::where('type', 'inventory')->orderBy('name')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');

        return Inertia::render('admin/inventory/index', [
            'items' => $items,
            'categories' => $categories,
            'currency' => $currency,
            'filters' => $request->only(['search', 'category_id', 'low_stock_only']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'category_id' => 'required|exists:categories,id',
            'unit' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'min_stock_threshold' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $item = InventoryItem::create($validated);

        if ($validated['current_stock'] > 0) {
            InventoryMovement::create([
                'inventory_item_id' => $item->id,
                'type' => 'in',
                'quantity' => $validated['current_stock'],
                'unit' => $validated['unit'],
                'cost_per_unit' => $validated['cost_per_unit'],
                'notes' => 'Initial stock entry',
            ]);
        }

        AuditLogService::log("Created inventory item: {$item->name}", "inventory");

        return redirect()->back()->with('success', 'Inventory item created successfully.');
    }

    public function update(Request $request, InventoryItem $item)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'category_id' => 'required|exists:categories,id',
            'unit' => 'required|string|max:50',
            'min_stock_threshold' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $item->update($validated);

        AuditLogService::log("Updated inventory item: {$item->name}", "inventory");

        return redirect()->back()->with('success', 'Inventory item updated successfully.');
    }

    public function adjustStock(Request $request, InventoryItem $item)
    {
        $validated = $request->validate([
            'type' => 'required|in:in,out,wastage,return,adjustment',
            'quantity' => 'required|numeric|gt:0',
            'unit' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        // Convert quantity to item base unit if different
        $convertedQty = UnitConverterService::convert($validated['quantity'], $validated['unit'], $item->unit);

        if (in_array($validated['type'], ['in', 'return'])) {
            $item->increment('current_stock', $convertedQty);
        } else {
            $item->decrement('current_stock', $convertedQty);
        }

        InventoryMovement::create([
            'inventory_item_id' => $item->id,
            'type' => $validated['type'],
            'quantity' => $convertedQty,
            'unit' => $item->unit,
            'cost_per_unit' => $item->cost_per_unit,
            'notes' => $validated['notes'] ?? ("Manual " . strtoupper($validated['type']) . " adjustment"),
        ]);

        AuditLogService::log("Adjusted stock for {$item->name}: {$validated['type']} {$convertedQty} {$item->unit}", "inventory");

        return redirect()->back()->with('success', 'Stock level adjusted successfully.');
    }

    public function destroy(InventoryItem $item)
    {
        $name = $item->name;
        $item->delete();

        AuditLogService::log("Deleted inventory item: {$name}", "inventory");

        return redirect()->back()->with('success', 'Inventory item deleted.');
    }

    public function exportCsv(): StreamedResponse
    {
        $items = InventoryItem::with('category')->orderBy('name')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="inventory_stock_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($items) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Item Name', 'SKU', 'Category', 'Current Stock', 'Unit', 'Min Threshold', 'Cost Per Unit', 'Expiry Date']);

            foreach ($items as $item) {
                fputcsv($file, [
                    $item->id,
                    $item->name,
                    $item->sku ?? '',
                    $item->category?->name ?? '',
                    $item->current_stock,
                    $item->unit,
                    $item->min_stock_threshold,
                    $item->cost_per_unit,
                    $item->expiry_date ? $item->expiry_date->format('Y-m-d') : '',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
