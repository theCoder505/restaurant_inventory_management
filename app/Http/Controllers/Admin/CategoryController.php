<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount(['inventoryItems', 'menuItems', 'expenses'])
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:inventory,menu,expense',
            'description' => 'nullable|string|max:1000',
        ]);

        $category = Category::create($validated);

        AuditLogService::log("Created {$category->type} category: {$category->name}", "categories");

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:inventory,menu,expense',
            'description' => 'nullable|string|max:1000',
        ]);

        $category->update($validated);

        AuditLogService::log("Updated {$category->type} category: {$category->name}", "categories");

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        if ($category->inventoryItems()->exists() || $category->menuItems()->exists() || $category->expenses()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category because active items or expenses are associated with it.');
        }

        $name = $category->name;
        $type = $category->type;
        $category->delete();

        AuditLogService::log("Deleted {$type} category: {$name}", "categories");

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
