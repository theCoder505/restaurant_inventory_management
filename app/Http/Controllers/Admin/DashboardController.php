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

        if ($period === 'today') {
            $startDate = now()->startOfDay();
            $endDate = now()->endOfDay();
        } elseif ($period === 'week') {
            $startDate = now()->startOfWeek();
            $endDate = now()->endOfWeek();
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

        // Profit Breakdown across 5 standard timeframes
        $profitBreakdown = [
            'daily' => $this->calculateProfitForRange(now()->startOfDay(), now()->endOfDay()),
            'weekly' => $this->calculateProfitForRange(now()->startOfWeek(), now()->endOfWeek()),
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
            for ($i = 0; $i < 7; $i++) {
                $dateObj = now()->startOfWeek()->addDays($i);
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
        } else {
            $start = $startDate ? $startDate->copy() : now()->startOfMonth();
            $end = $endDate ? $endDate->copy() : now()->endOfMonth();
            $diffInDays = $start->diffInDays($end);

            if ($diffInDays > 60) {
                $curr = $start->copy()->startOfMonth();
                while ($curr->lte($end)) {
                    $mStart = $curr->copy()->startOfMonth();
                    $mEnd = $curr->copy()->endOfMonth();
                    $daySales = Order::whereBetween('created_at', [$mStart, $mEnd])->where('payment_status', 'paid')->sum('total_amount');
                    $dayPurchases = Purchase::whereBetween('purchase_date', [$mStart->format('Y-m-d'), $mEnd->format('Y-m-d')])->sum('total_amount');

                    $salesTrend[] = [
                        'day' => $curr->format('M Y'),
                        'sales' => (float)$daySales,
                        'purchases' => (float)$dayPurchases,
                    ];
                    $curr->addMonth();
                }
            } else {
                $curr = $start->copy();
                while ($curr->lte($end)) {
                    $dateStr = $curr->format('Y-m-d');
                    $dayLabel = $curr->format('M j');

                    $daySales = Order::whereDate('created_at', $dateStr)->where('payment_status', 'paid')->sum('total_amount');
                    $dayPurchases = Purchase::whereDate('purchase_date', $dateStr)->sum('total_amount');

                    $salesTrend[] = [
                        'day' => $dayLabel,
                        'sales' => (float)$daySales,
                        'purchases' => (float)$dayPurchases,
                    ];
                    $curr->addDay();
                }
            }
        }

        // Top Selling Dishes for selected timeframe
        $topDishes = OrderItem::select('item_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total_price) as total_revenue'))
            ->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->where('payment_status', 'paid');
                if ($startDate && $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                }
            })
            ->groupBy('item_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'dish' => $item->item_name,
                    'sold_qty' => (int) $item->total_qty,
                    'revenue' => (float) $item->total_revenue,
                ];
            })
            ->values();

        // Expiry / Usage Alerts based on threshold %
        $alerts = NotificationService::checkAlerts();
        $expiryAlerts = $alerts['expiring'] ?? [];
        $expiryThreshold = $alerts['threshold_percentage'] ?? 80;

        return Inertia::render('admin/dashboard', [
            'currency' => $currency,
            'period' => $period,
            'startDate' => $startDate ? $startDate->format('Y-m-d') : '',
            'endDate' => $endDate ? $endDate->format('Y-m-d') : '',
            'metrics' => [
                'salesSelected' => $salesSelected,
                'purchasesSelected' => $purchasesSelected,
                'expensesSelected' => $expensesSelected,
                'salariesSelected' => $salariesSelected,
                'grossProfitSelected' => $grossProfitSelected,
                'netProfitSelected' => $netProfitSelected,
                'expiredCount' => count($expiryAlerts),
            ],
            'profitBreakdown' => $profitBreakdown,
            'salesTrend' => $salesTrend,
            'topDishes' => $topDishes,
            'expiryAlerts' => $expiryAlerts,
            'expiryThreshold' => $expiryThreshold,
        ]);
    }

    private function calculateProfitForRange($startDate = null, $endDate = null): array
    {
        $salesQuery = Order::where('payment_status', 'paid');
        if ($startDate && $endDate) {
            $salesQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        $sales = (float)$salesQuery->sum('total_amount');
        $purchases = ReportController::calculatePurchaseForRange($startDate, $endDate);
        $expenses = ReportController::calculateExpenseForRange($startDate, $endDate);
        $salaries = ReportController::calculateSalaryForRange($startDate, $endDate);

        $totalCosts = $purchases + $expenses + $salaries;
        $netProfit = $sales - $totalCosts;

        return [
            'sales' => $sales,
            'purchases' => $purchases,
            'expenses' => $expenses,
            'salaries' => $salaries,
            'totalCosts' => $totalCosts,
            'netProfit' => $netProfit,
            'isProfit' => $netProfit >= 0,
        ];
    }
}
