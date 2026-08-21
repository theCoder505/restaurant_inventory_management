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
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
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
            $startDate = Carbon::parse($startDateParam)->startOfDay();
            $endDate = Carbon::parse($endDateParam)->endOfDay();
        } else { // 'month' default
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
        }

        // Financial Aggregation with Apportionment for Purchases, Expenses/Bills, & Salaries
        $totalSales = self::getSalesForRange($startDate, $endDate);
        $orderCount = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->count();

        $totalPurchases = self::calculatePurchaseForRange($startDate, $endDate);
        $totalExpenses = self::calculateExpenseForRange($startDate, $endDate);
        $totalSalaries = self::calculateSalaryForRange($startDate, $endDate);

        $totalCost = $totalPurchases + $totalExpenses + $totalSalaries;
        $netProfit = $totalSales - $totalCost;
        $netMarginPercent = $totalSales > 0 ? round(($netProfit / $totalSales) * 100, 1) : 0;

        // Profit Breakdown across 5 timeframes: Daily, Weekly, Monthly, Yearly, All Time
        $profitBreakdown = [
            'daily' => $this->calculateProfitForRange(now()->startOfDay(), now()->endOfDay()),
            'weekly' => $this->calculateProfitForRange(now()->startOfWeek(), now()->endOfWeek()),
            'monthly' => $this->calculateProfitForRange(now()->startOfMonth(), now()->endOfMonth()),
            'yearly' => $this->calculateProfitForRange(now()->startOfYear(), now()->endOfYear()),
            'all_time' => $this->calculateProfitForRange(null, null),
        ];

        // Financial Distribution (Sales, Purchases, Salaries, Bills) for searched results
        $financialDistribution = [
            [
                'name' => 'Sales Revenue',
                'value' => $totalSales,
                'color' => '#10b981',
            ],
            [
                'name' => 'Purchases (COGS)',
                'value' => $totalPurchases,
                'color' => '#f59e0b',
            ],
            [
                'name' => 'Staff Salaries',
                'value' => $totalSalaries,
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Operational Bills',
                'value' => $totalExpenses,
                'color' => '#ef4444',
            ],
        ];

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
                'netProfit' => $netProfit,
                'netMarginPercent' => $netMarginPercent,
            ],
            'profitBreakdown' => $profitBreakdown,
            'financialDistribution' => $financialDistribution,
            'expenseDistribution' => $expenseDistribution,
            'dishInsights' => $dishInsights,
        ]);
    }

    public static function getSalesForRange(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $salesQuery = Order::where('payment_status', 'paid');
        if ($startDate && $endDate) {
            $salesQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        return (float)$salesQuery->sum('total_amount');
    }

    public static function calculateSalaryForRange(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        if (!$startDate || !$endDate) {
            return (float)Salary::where('payment_status', 'paid')->sum('net_pay');
        }

        $totalApportionedSalary = 0.0;
        $currentMonth = $startDate->copy()->startOfMonth();
        $endMonth = $endDate->copy()->endOfMonth();

        while ($currentMonth->lte($endMonth)) {
            $monthStr = $currentMonth->format('Y-m');
            $daysInMonth = (int)$currentMonth->daysInMonth;

            $monthlySalary = (float)Salary::where('payment_status', 'paid')
                ->where(function ($q) use ($monthStr, $currentMonth) {
                    $q->where('month_year', $monthStr)
                      ->orWhere(function ($sub) use ($currentMonth) {
                          $sub->whereNull('month_year')
                              ->whereBetween('created_at', [
                                  $currentMonth->copy()->startOfMonth(),
                                  $currentMonth->copy()->endOfMonth()
                              ]);
                      });
                })
                ->sum('net_pay');

            $dailySalaryRate = $daysInMonth > 0 ? ($monthlySalary / $daysInMonth) : 0.0;

            $mStart = $currentMonth->copy()->startOfMonth();
            $mEnd = $currentMonth->copy()->endOfMonth();

            $overlapStart = $startDate->greaterThan($mStart) ? $startDate->copy() : $mStart;
            $overlapEnd = $endDate->lessThan($mEnd) ? $endDate->copy() : $mEnd;

            if ($overlapStart->lte($overlapEnd)) {
                $daysCount = $overlapStart->copy()->startOfDay()->diffInDays($overlapEnd->copy()->startOfDay()) + 1;
                $totalApportionedSalary += ($daysCount * $dailySalaryRate);
            }

            $currentMonth->addMonth();
        }

        return round($totalApportionedSalary, 2);
    }

    public static function calculatePurchaseForRange(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        if (!$startDate || !$endDate) {
            return (float)Purchase::sum('total_amount');
        }

        $totalApportioned = 0.0;
        $currentMonth = $startDate->copy()->startOfMonth();
        $endMonth = $endDate->copy()->endOfMonth();

        while ($currentMonth->lte($endMonth)) {
            $daysInMonth = (int)$currentMonth->daysInMonth;
            $mStart = $currentMonth->copy()->startOfMonth()->format('Y-m-d');
            $mEnd = $currentMonth->copy()->endOfMonth()->format('Y-m-d');

            $monthlyTotal = (float)Purchase::whereBetween('purchase_date', [$mStart, $mEnd])->sum('total_amount');
            $dailyRate = $daysInMonth > 0 ? ($monthlyTotal / $daysInMonth) : 0.0;

            $overlapStart = $startDate->greaterThan($currentMonth->copy()->startOfMonth()) ? $startDate->copy() : $currentMonth->copy()->startOfMonth();
            $overlapEnd = $endDate->lessThan($currentMonth->copy()->endOfMonth()) ? $endDate->copy() : $currentMonth->copy()->endOfMonth();

            if ($overlapStart->lte($overlapEnd)) {
                $daysCount = $overlapStart->copy()->startOfDay()->diffInDays($overlapEnd->copy()->startOfDay()) + 1;
                $totalApportioned += ($daysCount * $dailyRate);
            }

            $currentMonth->addMonth();
        }

        return round($totalApportioned, 2);
    }

    public static function calculateExpenseForRange(?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        if (!$startDate || !$endDate) {
            return (float)Expense::sum('amount');
        }

        $totalApportioned = 0.0;
        $currentMonth = $startDate->copy()->startOfMonth();
        $endMonth = $endDate->copy()->endOfMonth();

        while ($currentMonth->lte($endMonth)) {
            $daysInMonth = (int)$currentMonth->daysInMonth;
            $mStart = $currentMonth->copy()->startOfMonth()->format('Y-m-d');
            $mEnd = $currentMonth->copy()->endOfMonth()->format('Y-m-d');

            $monthlyTotal = (float)Expense::whereBetween('expense_date', [$mStart, $mEnd])->sum('amount');
            $dailyRate = $daysInMonth > 0 ? ($monthlyTotal / $daysInMonth) : 0.0;

            $overlapStart = $startDate->greaterThan($currentMonth->copy()->startOfMonth()) ? $startDate->copy() : $currentMonth->copy()->startOfMonth();
            $overlapEnd = $endDate->lessThan($currentMonth->copy()->endOfMonth()) ? $endDate->copy() : $currentMonth->copy()->endOfMonth();

            if ($overlapStart->lte($overlapEnd)) {
                $daysCount = $overlapStart->copy()->startOfDay()->diffInDays($overlapEnd->copy()->startOfDay()) + 1;
                $totalApportioned += ($daysCount * $dailyRate);
            }

            $currentMonth->addMonth();
        }

        return round($totalApportioned, 2);
    }

    private function calculateProfitForRange(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $sales = self::getSalesForRange($startDate, $endDate);
        $purchases = self::calculatePurchaseForRange($startDate, $endDate);
        $expenses = self::calculateExpenseForRange($startDate, $endDate);
        $salaries = self::calculateSalaryForRange($startDate, $endDate);

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

    public function triggerDailyEmail(Request $request)
    {
        $today = now()->format('Y-m-d');
        $salesToday = Order::whereDate('created_at', $today)->where('payment_status', 'paid')->sum('total_amount');
        $purchasesToday = self::calculatePurchaseForRange(now()->startOfDay(), now()->endOfDay());
        $expensesToday = self::calculateExpenseForRange(now()->startOfDay(), now()->endOfDay());
        $salaryToday = self::calculateSalaryForRange(now()->startOfDay(), now()->endOfDay());
        $netProfitToday = $salesToday - ($purchasesToday + $expensesToday + $salaryToday);

        $alerts = NotificationService::checkAlerts();

        $sent = NotificationService::sendDailySummaryEmail([
            'total_sales' => $salesToday,
            'total_purchases' => $purchasesToday,
            'total_expenses' => $expensesToday,
            'total_salaries' => $salaryToday,
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
        return $this->exportExcel($request);
    }

    public function exportExcel(Request $request): StreamedResponse
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
            $startDate = Carbon::parse($startDateParam)->startOfDay();
            $endDate = Carbon::parse($endDateParam)->endOfDay();
        } else {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
        }

        $sales = self::getSalesForRange($startDate, $endDate);
        $purchases = self::calculatePurchaseForRange($startDate, $endDate);
        $expenses = self::calculateExpenseForRange($startDate, $endDate);
        $salaries = self::calculateSalaryForRange($startDate, $endDate);

        $totalCosts = $purchases + $expenses + $salaries;
        $netProfit = $sales - $totalCosts;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('P&L Report');

        // Main Title Header
        $sheet->setCellValue('A1', 'FINANCIAL PROFIT & LOSS REPORT');
        $sheet->mergeCells('A1:C1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $sheet->setCellValue('A2', 'Report Period:');
        $sheet->setCellValue('B2', $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d') . ' (' . ucfirst($period) . ')');
        $sheet->getStyle('A2')->getFont()->setBold(true);

        // Metric Summary Section
        $sheet->setCellValue('A4', 'Financial Metric');
        $sheet->setCellValue('B4', 'Amount');
        $sheet->getStyle('A4:B4')->getFont()->setBold(true);

        $metrics = [
            ['Total Sales Revenue', $sales],
            ['Ingredient Purchases (Apportioned COGS)', $purchases],
            ['Operational Overhead / Bills (Apportioned)', $expenses],
            ['Staff Salaries (Apportioned)', $salaries],
            ['Total Operational Costs', $totalCosts],
            ['Net Profit / Loss', $netProfit],
        ];

        $row = 5;
        foreach ($metrics as $metric) {
            $sheet->setCellValue('A' . $row, $metric[0]);
            $sheet->setCellValue('B' . $row, $metric[1]);
            $sheet->getStyle('B' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            if ($metric[0] === 'Net Profit / Loss' || $metric[0] === 'Total Operational Costs') {
                $sheet->getStyle('A' . $row . ':B' . $row)->getFont()->setBold(true);
            }
            $row++;
        }

        // Breakdown across timeframes
        $row += 2;
        $sheet->setCellValue('A' . $row, 'PROFIT & LOSS BREAKDOWN ACROSS TIMEFRAMES');
        $sheet->mergeCells('A' . $row . ':F' . $row);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(12);
        $row++;

        $sheet->setCellValue('A' . $row, 'Timeframe');
        $sheet->setCellValue('B' . $row, 'Sales');
        $sheet->setCellValue('C' . $row, 'Purchases');
        $sheet->setCellValue('D' . $row, 'Bills / Expenses');
        $sheet->setCellValue('E' . $row, 'Salaries');
        $sheet->setCellValue('F' . $row, 'Net Profit');
        $sheet->getStyle('A' . $row . ':F' . $row)->getFont()->setBold(true);
        $row++;

        $timeframes = [
            'Daily (Today)' => $this->calculateProfitForRange(now()->startOfDay(), now()->endOfDay()),
            'Weekly (This Week)' => $this->calculateProfitForRange(now()->startOfWeek(), now()->endOfWeek()),
            'Monthly (This Month)' => $this->calculateProfitForRange(now()->startOfMonth(), now()->endOfMonth()),
            'Yearly (Current Year)' => $this->calculateProfitForRange(now()->startOfYear(), now()->endOfYear()),
            'All Time Cumulative' => $this->calculateProfitForRange(null, null),
        ];

        foreach ($timeframes as $title => $data) {
            $sheet->setCellValue('A' . $row, $title);
            $sheet->setCellValue('B' . $row, $data['sales']);
            $sheet->setCellValue('C' . $row, $data['purchases']);
            $sheet->setCellValue('D' . $row, $data['expenses']);
            $sheet->setCellValue('E' . $row, $data['salaries']);
            $sheet->setCellValue('F' . $row, $data['netProfit']);

            foreach (['B', 'C', 'D', 'E', 'F'] as $col) {
                $sheet->getStyle($col . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            }
            $row++;
        }

        // Auto-fit columns A through F
        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'P_L_Report_' . $period . '_' . date('Y-m-d') . '.xlsx';

        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ];

        $callback = function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        };

        return response()->stream($callback, 200, $headers);
    }
}


