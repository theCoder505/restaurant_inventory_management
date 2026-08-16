<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\Recipe;
use App\Services\AuditLogService;
use App\Services\UnitConverterService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MenuItem::with(['category', 'recipes.inventoryItem']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $menuItems = $query->orderBy('name')->get();
        $categories = Category::where('type', 'menu')->orderBy('name')->get();
        $inventoryItems = InventoryItem::orderBy('name')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');

        return Inertia::render('admin/menu/index', [
            'menuItems' => $menuItems,
            'categories' => $categories,
            'inventoryItems' => $inventoryItems,
            'currency' => $currency,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image_path' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'dish_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dishes'), $fileName);
            $validated['image_path'] = '/uploads/dishes/' . $fileName;
        }

        unset($validated['image']);

        $menuItem = MenuItem::create($validated);

        AuditLogService::log("Created menu item: {$menuItem->name}", "menu");

        return redirect()->back()->with('success', 'Menu dish created successfully.');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image_path' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'dish_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dishes'), $fileName);
            $validated['image_path'] = '/uploads/dishes/' . $fileName;
        }

        unset($validated['image']);

        $menuItem->update($validated);

        $this->recalculateDishCost($menuItem);

        AuditLogService::log("Updated menu item: {$menuItem->name}", "menu");

        return redirect()->back()->with('success', 'Menu dish updated successfully.');
    }

    public function toggleAvailability(MenuItem $menuItem)
    {
        $menuItem->is_available = !$menuItem->is_available;
        $menuItem->save();

        AuditLogService::log("Toggled availability for {$menuItem->name} to " . ($menuItem->is_available ? 'In Stock' : 'Out of Stock'), "menu");

        return redirect()->back()->with('success', 'Availability updated.');
    }

    public function saveRecipe(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'ingredients' => 'array',
            'ingredients.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'ingredients.*.quantity' => 'required|numeric|gt:0',
            'ingredients.*.unit' => 'required|string',
        ]);

        // Delete existing recipes and recreate
        $menuItem->recipes()->delete();

        if (!empty($validated['ingredients'])) {
            foreach ($validated['ingredients'] as $ing) {
                Recipe::create([
                    'menu_item_id' => $menuItem->id,
                    'inventory_item_id' => $ing['inventory_item_id'],
                    'quantity' => $ing['quantity'],
                    'unit' => $ing['unit'],
                ]);
            }
        }

        $this->recalculateDishCost($menuItem);

        AuditLogService::log("Updated recipe ingredients for {$menuItem->name}", "menu");

        return redirect()->back()->with('success', 'Recipe updated and dish cost recalculated.');
    }

    public function destroy(MenuItem $menuItem)
    {
        $name = $menuItem->name;
        $menuItem->delete();

        AuditLogService::log("Deleted menu item: {$name}", "menu");

        return redirect()->back()->with('success', 'Menu dish deleted.');
    }

    /**
     * Recalculate dish cost based on linked raw ingredients & current ingredient cost_per_unit
     */
    private function recalculateDishCost(MenuItem $menuItem): void
    {
        $totalCost = 0;
        $recipes = $menuItem->recipes()->with('inventoryItem')->get();

        foreach ($recipes as $recipe) {
            if ($recipe->inventoryItem) {
                $convertedQty = UnitConverterService::convert($recipe->quantity, $recipe->unit, $recipe->inventoryItem->unit);
                $ingredientCost = $convertedQty * $recipe->inventoryItem->cost_per_unit;
                $totalCost += $ingredientCost;
            }
        }

        $menuItem->cost_price = round($totalCost, 2);
        $menuItem->save();
    }
}
