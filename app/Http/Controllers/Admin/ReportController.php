<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Expense;
use App\Models\InventoryMovement;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Purchase;
use App\Models\Salary;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->get('period', 'month');
        $startDateParam = $request->get('start_date');
        $endDateParam = $request->get('end_date');

        if ($period === 'today') {
            $startDate = now()->startOfDay();
            $endDate = now()->endOfDay();
        } elseif ($period === 'week') {
            $startDate = now()->startOfWeek();
            $endDate = now()->endOfWeek();
        } elseif ($period === 'year') {
            $startDate = now()->startOfYear();
            $endDate = now()->endOfYear();
        } elseif ($period === 'custom' && $startDateParam && $endDateParam) {
            $startDate = now()->parse($startDateParam)->startOfDay();
            $endDate = now()->parse($endDateParam)->endOfDay();
        } else { // 'month' default
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
        }

        // Financial Aggregation
        $salesQuery = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid');

        $totalSales = (float)$salesQuery->sum('total_amount');
        $orderCount = $salesQuery->count();

        $totalPurchases = (float)Purchase::whereBetween('purchase_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->sum('total_amount');

        $totalExpenses = (float)Expense::whereBetween('expense_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->sum('amount');

        $totalSalaries = (float)Salary::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('net_pay');

        $totalCost = $totalPurchases + $totalExpenses + $totalSalaries;
        $grossProfit = $totalSales - $totalPurchases;
        $netProfit = $totalSales - $totalCost;
        $grossMarginPercent = $totalSales > 0 ? round(($grossProfit / $totalSales) * 100, 1) : 0;
        $netMarginPercent = $totalSales > 0 ? round(($netProfit / $totalSales) * 100, 1) : 0;

        // Cost Breakdown by Expense Category
        $expenseDistribution = Expense::select('categories.name as name', DB::raw('SUM(expenses.amount) as value'))
            ->leftJoin('categories', 'expenses.category_id', '=', 'categories.id')
            ->whereBetween('expense_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->groupBy('categories.name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name ?? 'Uncategorized',
                    'value' => (float)$item->value,
                ];
            });

        // Top & Bottom Dishes (Dish Performance Insights)
        $dishInsights = OrderItem::select('item_name as name', DB::raw('SUM(quantity) as qty'), DB::raw('SUM(total_price) as revenue'))
            ->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate])->where('payment_status', 'paid');
            })
            ->groupBy('item_name')
            ->orderByDesc('qty')
            ->get()
            ->map(function ($item) {
                $menuItem = MenuItem::where('name', $item->name)->first();
                $unitCost = 0;
                $totalCost = $unitCost * (int)$item->qty;
                $profit = (float)$item->revenue - $totalCost;

                return [
                    'name' => $item->name,
                    'qty' => (int)$item->qty,
                    'revenue' => (float)$item->revenue,
                    'cost' => $totalCost,
                    'profit' => $profit,
                ];
            });

        $currency = AppSetting::getByKey('default_currency', '৳');

        return Inertia::render('admin/reports/index', [
            'currency' => $currency,
            'period' => $period,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
            'summary' => [
                'salesRevenue' => $totalSales,
                'orderCount' => $orderCount,
                'purchasesCost' => $totalPurchases,
                'expensesTotal' => $totalExpenses,
                'salariesTotal' => $totalSalaries,
                'totalCosts' => $totalCost,
                'grossProfit' => $grossProfit,
                'grossMarginPercent' => $grossMarginPercent,
                'netProfit' => $netProfit,
                'netMarginPercent' => $netMarginPercent,
            ],
            'expenseDistribution' => $expenseDistribution,
            'dishInsights' => $dishInsights,
        ]);
    }

    public function triggerDailyEmail(Request $request)
    {
        $today = now()->format('Y-m-d');
        $salesToday = Order::whereDate('created_at', $today)->where('payment_status', 'paid')->sum('total_amount');
        $purchasesToday = Purchase::whereDate('purchase_date', $today)->sum('total_amount');
        $expensesToday = Expense::whereDate('expense_date', $today)->sum('amount');
        $netProfitToday = $salesToday - ($purchasesToday + $expensesToday);

        $alerts = NotificationService::checkAlerts();

        $sent = NotificationService::sendDailySummaryEmail([
            'total_sales' => $salesToday,
            'total_purchases' => $purchasesToday,
            'total_expenses' => $expensesToday,
            'net_profit' => $netProfitToday,
            'low_stock' => $alerts['low_stock'],
        ]);

        if ($sent) {
            return redirect()->back()->with('success', 'Daily closing summary email sent to admin.');
        }

        return redirect()->back()->with('error', 'Could not send email. Please check notification email setting.');
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $period = $request->get('period', 'month');
        $startDateParam = $request->get('start_date');
        $endDateParam = $request->get('end_date');

        if ($period === 'today') {
            $startDate = now()->startOfDay();
            $endDate = now()->endOfDay();
        } elseif ($period === 'week') {
            $startDate = now()->startOfWeek();
            $endDate = now()->endOfWeek();
        } elseif ($period === 'year') {
            $startDate = now()->startOfYear();
            $endDate = now()->endOfYear();
        } elseif ($period === 'custom' && $startDateParam && $endDateParam) {
            $startDate = now()->parse($startDateParam)->startOfDay();
            $endDate = now()->parse($endDateParam)->endOfDay();
        } else {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
        }

        $sales = Order::whereBetween('created_at', [$startDate, $endDate])->where('payment_status', 'paid')->sum('total_amount');
        $purchases = Purchase::whereBetween('purchase_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])->sum('total_amount');
        $expenses = Expense::whereBetween('expense_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])->sum('amount');
        $salaries = Salary::where('payment_status', 'paid')->whereBetween('created_at', [$startDate, $endDate])->sum('net_pay');

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="P_L_Report_' . $period . '_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($startDate, $endDate, $sales, $purchases, $expenses, $salaries) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['PROFIT & LOSS FINANCIAL REPORT']);
            fputcsv($file, ['Period', $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d')]);
            fputcsv($file, []);
            fputcsv($file, ['Metric', 'Amount']);
            fputcsv($file, ['Total Sales Revenue', $sales]);
            fputcsv($file, ['Ingredient Purchases (COGS)', $purchases]);
            fputcsv($file, ['Operational Expenses', $expenses]);
            fputcsv($file, ['Staff Salaries', $salaries]);
            fputcsv($file, ['Total Operational Costs', $purchases + $expenses + $salaries]);
            fputcsv($file, ['Net Profit / Loss', $sales - ($purchases + $expenses + $salaries)]);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
