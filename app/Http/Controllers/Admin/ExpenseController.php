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
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    public function exportExcel(Request $request): StreamedResponse
    {
        $query = Expense::with('category');

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

        $expenses = $query->orderByDesc('expense_date')->orderByDesc('id')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Bills & Expenses');

        $sheet->setCellValue('A1', 'BILLS & OPERATIONAL EXPENSES');
        $sheet->mergeCells('A1:F1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $filters = [];
        if ($request->filled('from_date')) $filters[] = 'From: ' . $request->from_date;
        if ($request->filled('to_date'))   $filters[] = 'To: ' . $request->to_date;
        if ($request->filled('search'))    $filters[] = 'Search: ' . $request->search;
        $sheet->setCellValue('A2', ($filters ? implode(' | ', $filters) : 'All Expenses') . ' | Exported: ' . now()->format('Y-m-d H:i'));
        $sheet->mergeCells('A2:F2');

        $cols = ['Date', 'Description', 'Category', 'Payment Method', 'Reference #', 'Amount'];
        foreach ($cols as $i => $col) {
            $letter = chr(65 + $i);
            $sheet->setCellValue($letter . '4', $col);
            $sheet->getStyle($letter . '4')->getFont()->setBold(true);
        }

        $row   = 5;
        $total = 0;
        foreach ($expenses as $expense) {
            $sheet->setCellValue('A' . $row, $expense->expense_date);
            $sheet->setCellValue('B' . $row, $expense->title);
            $sheet->setCellValue('C' . $row, $expense->category->name ?? 'General');
            $sheet->setCellValue('D' . $row, strtoupper($expense->payment_method));
            $sheet->setCellValue('E' . $row, $expense->reference_no ?? '-');
            $sheet->setCellValue('F' . $row, (float)$expense->amount);
            $sheet->getStyle('F' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            $total += (float)$expense->amount;
            $row++;
        }

        $row++;
        $sheet->setCellValue('E' . $row, 'TOTAL:');
        $sheet->getStyle('E' . $row)->getFont()->setBold(true);
        $sheet->setCellValue('F' . $row, $total);
        $sheet->getStyle('F' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->getStyle('F' . $row)->getFont()->setBold(true);

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'Bills_Expenses_' . date('Y-m-d') . '.xlsx';
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
