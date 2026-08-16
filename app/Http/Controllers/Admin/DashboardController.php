<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Purchase;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $currency = AppSetting::getByKey('default_currency', '৳');
        $today = now()->format('Y-m-d');
        $startOfMonth = now()->startOfMonth()->format('Y-m-d');

        // Today metrics
        $salesToday = Order::whereDate('created_at', $today)->where('payment_status', 'paid')->sum('total_amount');
        $purchasesToday = Purchase::whereDate('purchase_date', $today)->sum('total_amount');

        // Month metrics
        $salesMonth = Order::whereDate('created_at', '>=', $startOfMonth)->where('payment_status', 'paid')->sum('total_amount');
        $purchasesMonth = Purchase::whereDate('purchase_date', '>=', $startOfMonth)->sum('total_amount');
        $expensesMonth = Expense::whereDate('expense_date', '>=', $startOfMonth)->sum('amount');
        $grossProfitMonth = $salesMonth - $purchasesMonth;

        // Alerts
        $alerts = NotificationService::checkAlerts();
        $lowStockItems = $alerts['low_stock'] ?? [];
        $expiryAlerts = $alerts['expiring'] ?? [];

        // Top Selling Dishes (Month)
        $topDishes = OrderItem::select('item_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total_price) as total_revenue'))
            ->whereHas('order', function ($q) use ($startOfMonth) {
                $q->whereDate('created_at', '>=', $startOfMonth)->where('payment_status', 'paid');
            })
            ->groupBy('item_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'dish' => $item->item_name,
                    'sold_qty' => (int)$item->total_qty,
                    'revenue' => (float)$item->total_revenue,
                ];
            })
            ->values();

        // 7-Day Trend Chart Data
        $salesTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayLabel = now()->subDays($i)->format('D, M j');

            $daySales = Order::whereDate('created_at', $date)->where('payment_status', 'paid')->sum('total_amount');
            $dayPurchases = Purchase::whereDate('purchase_date', $date)->sum('total_amount');

            $salesTrend[] = [
                'day' => $dayLabel,
                'sales' => (float)$daySales,
                'purchases' => (float)$dayPurchases,
            ];
        }

        return Inertia::render('admin/dashboard', [
            'currency' => $currency,
            'metrics' => [
                'salesToday' => (float)$salesToday,
                'salesMonth' => (float)$salesMonth,
                'purchaseToday' => (float)$purchasesToday,
                'expensesMonth' => (float)$expensesMonth,
                'cogsMonth' => (float)$purchasesMonth,
                'grossProfitMonth' => (float)$grossProfitMonth,
                'lowStockCount' => count($lowStockItems),
                'expiredCount' => count($expiryAlerts),
            ],
            'salesTrend' => $salesTrend,
            'topDishes' => $topDishes,
            'lowStockItems' => $lowStockItems,
            'expiryAlerts' => $expiryAlerts,
        ]);
    }
}
