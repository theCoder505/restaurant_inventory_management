<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Purchase;
use App\Models\Salary;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $currency = AppSetting::getByKey('default_currency', '৳');
        
        $period = $request->get('period', 'month');
        $startDateParam = $request->get('start_date');
        $endDateParam = $request->get('end_date');

        $weekRange = AppSetting::getWeekRange();

        if ($period === 'today') {
            $startDate = now()->startOfDay();
            $endDate = now()->endOfDay();
        } elseif ($period === 'week') {
            $startDate = $weekRange[0];
            $endDate = $weekRange[1];
        } elseif ($period === 'year') {
            $startDate = now()->startOfYear();
            $endDate = now()->endOfYear();
        } elseif ($period === 'all') {
            $startDate = null;
            $endDate = null;
        } elseif ($period === 'custom' && $startDateParam && $endDateParam) {
            $startDate = Carbon::parse($startDateParam)->startOfDay();
            $endDate = Carbon::parse($endDateParam)->endOfDay();
        } else {
            $period = 'month';
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
        }

        // Metrics for active selected period
        $salesSelected = ReportController::getSalesForRange($startDate, $endDate);

        $purchasesSelected = ReportController::calculatePurchaseForRange($startDate, $endDate);
        $expensesSelected = ReportController::calculateExpenseForRange($startDate, $endDate);
        $salariesSelected = ReportController::calculateSalaryForRange($startDate, $endDate);

        $grossProfitSelected = $salesSelected - $purchasesSelected;
        $netProfitSelected = $salesSelected - ($purchasesSelected + $expensesSelected + $salariesSelected);
        $grossMarginPercentSelected = $salesSelected > 0 ? round(($grossProfitSelected / $salesSelected) * 100, 1) : 0;
        $netMarginPercentSelected = $salesSelected > 0 ? round(($netProfitSelected / $salesSelected) * 100, 1) : 0;

        // Profit Breakdown across 5 standard timeframes (with configurable week starts day)
        $profitBreakdown = [
            'daily' => $this->calculateProfitForRange(now()->startOfDay(), now()->endOfDay()),
            'weekly' => $this->calculateProfitForRange($weekRange[0], $weekRange[1]),
            'monthly' => $this->calculateProfitForRange(now()->startOfMonth(), now()->endOfMonth()),
            'yearly' => $this->calculateProfitForRange(now()->startOfYear(), now()->endOfYear()),
            'all_time' => $this->calculateProfitForRange(null, null),
        ];

        // Dynamic Sales & Purchases Trend Chart Data based on selected period
        $salesTrend = [];
        if ($period === 'year' || $period === 'all') {
            $year = now()->year;
            for ($m = 1; $m <= 12; $m++) {
                $monthDate = Carbon::createFromDate($year, $m, 1);
                $monthStart = $monthDate->copy()->startOfMonth();
                $monthEnd = $monthDate->copy()->endOfMonth();

                $daySales = Order::whereBetween('created_at', [$monthStart, $monthEnd])->where('payment_status', 'paid')->sum('total_amount');
                $dayPurchases = Purchase::whereBetween('purchase_date', [$monthStart->format('Y-m-d'), $monthEnd->format('Y-m-d')])->sum('total_amount');

                $salesTrend[] = [
                    'day' => $monthDate->format('M'),
                    'sales' => (float)$daySales,
                    'purchases' => (float)$dayPurchases,
                ];
            }
        } elseif ($period === 'week') {
            $weekStart = $weekRange[0];
            for ($i = 0; $i < 7; $i++) {
                $dateObj = $weekStart->copy()->addDays($i);
                $dateStr = $dateObj->format('Y-m-d');
                $dayLabel = $dateObj->format('D, M j');

                $daySales = Order::whereDate('created_at', $dateStr)->where('payment_status', 'paid')->sum('total_amount');
                $dayPurchases = Purchase::whereDate('purchase_date', $dateStr)->sum('total_amount');

                $salesTrend[] = [
                    'day' => $dayLabel,
                    'sales' => (float)$daySales,
                    'purchases' => (float)$dayPurchases,
                ];
            }
        } elseif ($period === 'today') {
            for ($i = 6; $i >= 0; $i--) {
                $dateObj = now()->subDays($i);
                $dateStr = $dateObj->format('Y-m-d');
                $dayLabel = $dateObj->format('D, M j');

                $daySales = Order::whereDate('created_at', $dateStr)->where('payment_status', 'paid')->sum('total_amount');
                $dayPurchases = Purchase::whereDate('purchase_date', $dateStr)->sum('total_amount');

                $salesTrend[] = [
                    'day' => $dayLabel,
                    'sales' => (float)$daySales,
                    'purchases' => (float)$dayPurchases,
                ];
            }
        } else { // default 'month'
            $daysInMonth = now()->daysInMonth;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dateStr = now()->format('Y-m-') . str_pad((string)$d, 2, '0', STR_PAD_LEFT);
                $daySales = Order::whereDate('created_at', $dateStr)->where('payment_status', 'paid')->sum('total_amount');
                $dayPurchases = Purchase::whereDate('purchase_date', $dateStr)->sum('total_amount');

                $salesTrend[] = [
                    'day' => (string)$d,
                    'sales' => (float)$daySales,
                    'purchases' => (float)$dayPurchases,
                ];
            }
        }

        // Top Selling Dishes in selected range
        $topDishesFormatted = collect();
        try {
            $topSellingDishes = OrderItem::select('item_name', DB::raw('SUM(quantity) as qty'), DB::raw('SUM(total_price) as revenue'))
                ->whereHas('order', function ($q) use ($startDate, $endDate) {
                    if ($startDate && $endDate) {
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                    }
                    $q->where('payment_status', 'paid');
                })
                ->groupBy('item_name')
                ->orderByDesc('qty')
                ->take(5)
                ->get();

            $topDishesFormatted = $topSellingDishes->map(function ($item) {
                return [
                    'dish' => $item->item_name,
                    'sold_qty' => (int)$item->qty,
                    'revenue' => (float)$item->revenue,
                ];
            });
        } catch (\Throwable $e) {
            $topDishesFormatted = collect();
        }

        // Expiry & High usage warnings
        $thresholdPercent = (float) AppSetting::getByKey('expiry_warning_threshold', '80');
        $thresholdRatio = $thresholdPercent / 100;

        $expiryAlerts = collect();
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('purchase_items')) {
                $expiryAlerts = \App\Models\PurchaseItem::with(['purchase.supplier'])
                    ->where('quantity', '>', 0)
                    ->whereRaw('(used_amount / quantity) >= ?', [$thresholdRatio])
                    ->orderByDesc('id')
                    ->take(10)
                    ->get();
            }
        } catch (\Throwable $e) {
            $expiryAlerts = collect();
        }

        // System Expiry Notifications & Low Stock Alerts
        $notifications = [];
        try {
            $notifications = NotificationService::getAllNotifications();
        } catch (\Throwable $e) {
            $notifications = [];
        }

        return Inertia::render('admin/dashboard/index', [
            'period' => $period,
            'startDate' => $startDate ? $startDate->format('Y-m-d') : '',
            'endDate' => $endDate ? $endDate->format('Y-m-d') : '',
            'currency' => $currency,
            'expiryThreshold' => $thresholdPercent,
            'expiryAlerts' => $expiryAlerts,
            'metrics' => [
                'salesSelected' => (float)$salesSelected,
                'purchasesSelected' => (float)$purchasesSelected,
                'expensesSelected' => (float)$expensesSelected,
                'salariesSelected' => (float)$salariesSelected,
                'grossProfitSelected' => (float)$grossProfitSelected,
                'netProfitSelected' => (float)$netProfitSelected,
                'grossMarginPercentSelected' => (float)$grossMarginPercentSelected,
                'netMarginPercentSelected' => (float)$netMarginPercentSelected,
                'expiredCount' => count($expiryAlerts),
            ],
            'profitBreakdown' => $profitBreakdown,
            'salesTrend' => $salesTrend,
            'topDishes' => $topDishesFormatted,
            'topSellingDishes' => $topDishesFormatted,
            'notifications' => $notifications,
        ]);
    }

    private function calculateProfitForRange(?Carbon $startDate, ?Carbon $endDate): array
    {
        try {
            $sales = ReportController::getSalesForRange($startDate, $endDate);
            $purchases = ReportController::calculatePurchaseForRange($startDate, $endDate);
            $expenses = ReportController::calculateExpenseForRange($startDate, $endDate);
            $salaries = ReportController::calculateSalaryForRange($startDate, $endDate);

            $totalCost = $purchases + $expenses + $salaries;
            $netProfit = $sales - $totalCost;
            $netMarginPercent = $sales > 0 ? round(($netProfit / $sales) * 100, 1) : 0;

            return [
                'sales' => (float)$sales,
                'purchases' => (float)$purchases,
                'expenses' => (float)$expenses,
                'salaries' => (float)$salaries,
                'totalCosts' => (float)$totalCost,
                'netProfit' => (float)$netProfit,
                'isProfit' => $netProfit >= 0,
                'netMarginPercent' => $netMarginPercent,
            ];
        } catch (\Throwable $e) {
            return [
                'sales' => 0.0,
                'purchases' => 0.0,
                'expenses' => 0.0,
                'salaries' => 0.0,
                'totalCosts' => 0.0,
                'netProfit' => 0.0,
                'isProfit' => true,
                'netMarginPercent' => 0.0,
            ];
        }
    }
}
