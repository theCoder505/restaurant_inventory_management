<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Supplier;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
}
