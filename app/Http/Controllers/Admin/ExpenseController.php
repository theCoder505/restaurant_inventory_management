<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Category;
use App\Models\Expense;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Expense::with(['category', 'creator']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('reference_no', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('expense_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('expense_date', '<=', $request->to_date);
        }

        // Calculate total cost sum across all matching records before pagination
        $totalCost = (float) (clone $query)->sum('amount');

        // Latest entry first
        $expenses = $query->orderByDesc('expense_date')->orderByDesc('id')->paginate(15)->withQueryString();
        $categories = Category::where('type', 'expense')->orderBy('name')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');

        $totalExpensesThisMonth = Expense::whereDate('expense_date', '>=', now()->startOfMonth())->sum('amount');

        return Inertia::render('admin/expenses/index', [
            'expenses' => $expenses,
            'categories' => $categories,
            'currency' => $currency,
            'totalCost' => $totalCost,
            'totalExpensesThisMonth' => (float) $totalExpensesThisMonth,
            'filters' => $request->only(['search', 'category_id', 'from_date', 'to_date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|gt:0',
            'expense_date' => 'required|date',
            'payment_method' => 'required|string',
            'reference_no' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = Auth::id();

        $expense = Expense::create($validated);

        AuditLogService::log("Recorded expense: {$expense->title} ({$expense->amount})", "expenses");

        return redirect()->back()->with('success', 'Expense recorded successfully.');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|gt:0',
            'expense_date' => 'required|date',
            'payment_method' => 'required|string',
            'reference_no' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $expense->update($validated);

        AuditLogService::log("Updated expense: {$expense->title}", "expenses");

        return redirect()->back()->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense)
    {
        $title = $expense->title;
        $expense->delete();

        AuditLogService::log("Deleted expense: {$title}", "expenses");

        return redirect()->back()->with('success', 'Expense deleted.');
    }
}
