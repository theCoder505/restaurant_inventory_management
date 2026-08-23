import AppLayout from '@/layouts/app-layout';
import { formatCurrency, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Bike,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    DollarSign,
    Download,
    Loader2,
    Mail,
    PieChart as PieChartIcon,
    Receipt,
    Search,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    Utensils,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface SummaryData {
    salesRevenue: number;
    purchasesCost: number;
    expensesTotal: number;
    salariesTotal: number;
    totalCosts: number;
    netProfit: number;
    netMarginPercent: number;
    orderCount: number;
}

interface ProfitPeriod {
    sales: number;
    purchases: number;
    expenses: number;
    salaries: number;
    totalCosts: number;
    netProfit: number;
    isProfit: boolean;
}

interface ProfitBreakdown {
    daily: ProfitPeriod;
    weekly: ProfitPeriod;
    monthly: ProfitPeriod;
    yearly: ProfitPeriod;
    all_time: ProfitPeriod;
}

interface FinancialPieItem {
    name: string;
    value: number;
    color?: string;
}

interface ExpensePieItem {
    name: string;
    value: number;
}

interface DishInsight {
    name: string;
    qty: number;
    revenue: number;
    cost: number;
    profit: number;
}

interface SalesByOrderTypeItem {
    type: string;
    label: string;
    count: number;
    total: number;
}

interface SalesByPaymentMethodItem {
    method: string;
    label: string;
    count: number;
    total: number;
}

interface Props {
    currency: string;
    period: string;
    startDate: string;
    endDate: string;
    summary: SummaryData;
    profitBreakdown?: ProfitBreakdown;
    financialDistribution?: FinancialPieItem[];
    expenseDistribution: ExpensePieItem[];
    dishInsights: DishInsight[];
    salesByOrderType?: SalesByOrderTypeItem[];
    salesByPaymentMethod?: SalesByPaymentMethodItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'Financial P&L Reports', href: '/administration-control/reports' },
];

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export default function ReportsIndex({
    currency = '৳',
    period = 'month',
    startDate = '',
    endDate = '',
    summary = {
        salesRevenue: 0,
        purchasesCost: 0,
        expensesTotal: 0,
        salariesTotal: 0,
        totalCosts: 0,
        netProfit: 0,
        netMarginPercent: 0,
        orderCount: 0,
    },
    profitBreakdown,
    financialDistribution = [],
    expenseDistribution = [],
    dishInsights = [],
    salesByOrderType = [],
    salesByPaymentMethod = [],
}: Props) {
    const filterForm = useForm({
        period: period || 'month',
        start_date: startDate || '',
        end_date: endDate || '',
    });

    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    // Frontend Dish Insights Pagination & Search
    const [dishSearch, setDishSearch] = useState('');
    const [dishPage, setDishPage] = useState(1);
    const [dishPerPage, setDishPerPage] = useState(10);

    const filteredDishes = useMemo(() => {
        if (!dishSearch.trim()) return dishInsights;
        const term = dishSearch.toLowerCase();
        return dishInsights.filter((d) => d.name.toLowerCase().includes(term));
    }, [dishInsights, dishSearch]);

    // Calculate totals across ALL filtered dish insights
    const dishTotals = useMemo(() => {
        return filteredDishes.reduce(
            (acc, curr) => {
                acc.totalQty += curr.qty;
                acc.totalRevenue += curr.revenue;
                acc.totalCost += curr.cost;
                acc.totalProfit += curr.profit;
                return acc;
            },
            { totalQty: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0 },
        );
    }, [filteredDishes]);

    const totalDishPages = Math.max(1, Math.ceil(filteredDishes.length / dishPerPage));

    const paginatedDishes = useMemo(() => {
        const start = (dishPage - 1) * dishPerPage;
        return filteredDishes.slice(start, start + dishPerPage);
    }, [filteredDishes, dishPage, dishPerPage]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsFiltering(true);
        router.get('/administration-control/reports', filterForm.data, {
            preserveState: true,
            onFinish: () => setIsFiltering(false),
        });
    };

    const handleSendDailyEmail = () => {
        if (isSendingEmail) return;
        setIsSendingEmail(true);
        router.post(
            '/administration-control/reports/send-daily-summary',
            {},
            {
                onSuccess: () => {
                    showToast('Daily Closing P&L Summary email sent to admin successfully!', 'success');
                },
                onError: (errors) => {
                    showToast('Failed to send daily summary email. Please check mail settings.', 'error');
                },
                onFinish: () => {
                    setIsSendingEmail(false);
                },
            },
        );
    };

    const handleExportExcel = () => {
        window.location.href = `/administration-control/reports/export-excel?period=${filterForm.data.period}&start_date=${filterForm.data.start_date}&end_date=${filterForm.data.end_date}`;
    };

    const profitCards = [
        { key: 'daily', title: 'Daily Profit / Loss', subtitle: 'Today (Daily Salary: Monthly / Days in Month)', data: profitBreakdown?.daily },
        { key: 'weekly', title: 'Weekly Profit / Loss', subtitle: 'This Week (Weekly Salary: Monthly / Weeks in Month)', data: profitBreakdown?.weekly },
        { key: 'monthly', title: 'Monthly Profit / Loss', subtitle: 'This Month', data: profitBreakdown?.monthly },
        { key: 'yearly', title: 'Yearly Profit / Loss', subtitle: 'This Year (Jan-Dec Current Year)', data: profitBreakdown?.yearly },
        { key: 'all_time', title: 'All Time Profit / Loss', subtitle: 'Cumulative', data: profitBreakdown?.all_time },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial P&L Analytics & Audit Reports" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <TrendingUp className="h-6 w-6 text-amber-500" /> Financial Profit & Loss Analytics
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Sales revenue rollups, procurement Cost of Goods Sold (COGS), operational overhead, net profit margins, and daily email summaries
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSendDailyEmail}
                            disabled={isSendingEmail}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSendingEmail ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Sending Daily Email...</span>
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4" />
                                    <span>Trigger Daily Closing Email</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition-all hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                            <Download className="h-4 w-4" /> Export Excel (.xlsx)
                        </button>
                    </div>
                </div>


                {/* Profit & Loss Calculation Overview Grid (Formula: Sales - (Purchases + Salaries + Bills)) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                            <TrendingUp className="h-4 w-4 text-amber-500" /> Profit & Loss Breakdown [Formula: Sales &minus; (Purchases + Apportioned Salaries + Bills)]
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {profitCards.map((card) => {
                            const p = card.data;
                            if (!p) return null;
                            const isProfit = p.isProfit;

                            return (
                                <div
                                    key={card.key}
                                    className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all ${
                                        isProfit
                                            ? 'border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/20'
                                            : 'border-rose-500/30 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-950/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{card.title}</span>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                                                isProfit
                                                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                            }`}
                                        >
                                            {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            {isProfit ? 'Profit' : 'Loss'}
                                        </span>
                                    </div>

                                    <div className="mt-2.5">
                                        <div
                                            className={`text-xl font-black ${
                                                isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                            }`}
                                        >
                                            {isProfit ? '+' : '-'}{formatCurrency(Math.abs(p.netProfit), currency)}
                                        </div>

                                        <div className="mt-2 space-y-0.5 border-t border-slate-200/60 pt-2 text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                            <div className="flex justify-between">
                                                <span>Sales:</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(p.sales, currency)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Costs (Pur+Sal+Exp):</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(p.totalCosts, currency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Date & Period Filter Bar */}
                <form
                    onSubmit={handleFilterSubmit}
                    className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900"
                >
                    <div className="flex w-full flex-1 items-center gap-3">
                        <select
                            value={filterForm.data.period}
                            onChange={(e) => filterForm.setData('period', e.target.value)}
                            className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="custom">Custom Date Range</option>
                        </select>

                        {filterForm.data.period === 'custom' && (
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Calendar className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        value={filterForm.data.start_date}
                                        onChange={(e) => filterForm.setData('start_date', e.target.value)}
                                        className="rounded-xl border border-slate-300 bg-slate-100 py-2 pr-2 pl-8 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>
                                <span className="text-slate-500">to</span>
                                <div className="relative">
                                    <Calendar className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        value={filterForm.data.end_date}
                                        onChange={(e) => filterForm.setData('end_date', e.target.value)}
                                        className="rounded-xl border border-slate-300 bg-slate-100 py-2 pr-2 pl-8 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isFiltering}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 transition-all hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed md:w-auto cursor-pointer"
                    >
                        {isFiltering ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Applying Filters...</span>
                            </>
                        ) : (
                            <span>Apply Report Filters</span>
                        )}
                    </button>
                </form>

                {/* 4 Financial Rollup Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sales Revenue</span>
                        <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                            {formatCurrency(summary.salesRevenue, currency)}
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">Total Orders Placed: {summary.orderCount}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Operational Costs</span>
                        <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
                            {formatCurrency(summary.totalCosts, currency)}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            COGS: {formatCurrency(summary.purchasesCost, currency)} | Bills: {formatCurrency(summary.expensesTotal, currency)} | Salaries: {formatCurrency(summary.salariesTotal, currency)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Profit / Loss</span>
                        <div
                            className={`mt-2 flex items-center gap-1 text-2xl font-black ${
                                summary.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                        >
                            {summary.netProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(summary.netProfit), currency)}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Formula: Sales Revenue &minus; Total Costs
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Profit Margin %</span>
                        <div
                            className={`mt-2 flex items-center gap-1 text-2xl font-black ${
                                summary.netMarginPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                        >
                            {summary.netMarginPercent >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                            {summary.netMarginPercent}%
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Formula: (Net Profit ÷ Sales Revenue) &times; 100
                        </p>
                    </div>
                </div>

                {/* Sales Channels (Dine-in, Takeaway, Delivery) & Payment Methods (Cash, Card, bKash, Nagad) Breakdowns */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Sales by Order Channel */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <Utensils className="h-4 w-4 text-amber-500" /> Sales by Order Channel
                            </h3>
                            <span className="text-[11px] text-slate-500">Dine-In • Takeaway • Delivery</span>
                        </div>

                        <div className="space-y-2.5">
                            {(!salesByOrderType || salesByOrderType.length === 0) ? (
                                <p className="py-4 text-center text-xs text-slate-500">No completed orders for selected range.</p>
                            ) : (
                                salesByOrderType.map((channel, idx) => {
                                    const percent = summary.salesRevenue > 0 ? ((channel.total / summary.salesRevenue) * 100).toFixed(1) : '0';
                                    const channelIcon =
                                        channel.type === 'delivery' ? (
                                            <Bike className="h-4 w-4 text-amber-500" />
                                        ) : channel.type === 'takeaway' ? (
                                            <ShoppingBag className="h-4 w-4 text-blue-500" />
                                        ) : (
                                            <Utensils className="h-4 w-4 text-emerald-500" />
                                        );

                                    return (
                                        <div key={idx} className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                                                    {channelIcon}
                                                    <span>{channel.label}</span>
                                                    <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                                        {channel.count} Orders
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                                                        {formatCurrency(channel.total, currency)}
                                                    </span>
                                                    <span className="ml-1.5 text-[10px] text-slate-500">({percent}%)</span>
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className="h-full bg-amber-500 transition-all duration-500"
                                                    style={{ width: `${Math.min(100, Math.max(0, Number(percent)))}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Sales by Payment Method */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <CreditCard className="h-4 w-4 text-emerald-500" /> Sales by Payment Method
                            </h3>
                            <span className="text-[11px] text-slate-500">Cash • Card • bKash • Nagad</span>
                        </div>

                        <div className="space-y-2.5">
                            {(!salesByPaymentMethod || salesByPaymentMethod.length === 0) ? (
                                <p className="py-4 text-center text-xs text-slate-500">No payment transaction records for selected range.</p>
                            ) : (
                                salesByPaymentMethod.map((pm, idx) => {
                                    const percent = summary.salesRevenue > 0 ? ((pm.total / summary.salesRevenue) * 100).toFixed(1) : '0';
                                    const pmIcon =
                                        pm.method === 'card' ? (
                                            <CreditCard className="h-4 w-4 text-blue-500" />
                                        ) : pm.method === 'bkash' ? (
                                            <Receipt className="h-4 w-4 text-pink-500" />
                                        ) : pm.method === 'nagad' ? (
                                            <Receipt className="h-4 w-4 text-orange-500" />
                                        ) : (
                                            <DollarSign className="h-4 w-4 text-emerald-500" />
                                        );

                                    return (
                                        <div key={idx} className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                                                    {pmIcon}
                                                    <span>{pm.label}</span>
                                                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        {pm.count} Bills
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                                                        {formatCurrency(pm.total, currency)}
                                                    </span>
                                                    <span className="ml-1.5 text-[10px] text-slate-500">({percent}%)</span>
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-500"
                                                    style={{ width: `${Math.min(100, Math.max(0, Number(percent)))}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Financial Distribution Chart & Dish Profitability */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Operational Financial Distribution Chart */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                    <PieChartIcon className="h-4 w-4 text-amber-500" /> Operational Expense & Revenue Distribution
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Sales, Purchases, Salaries & Bills for active searched filter
                                </p>
                            </div>
                        </div>

                        <div className="h-56 w-full">
                            {!financialDistribution || financialDistribution.length === 0 ? (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                    No distribution data found for selected date range.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={financialDistribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={70}
                                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {financialDistribution.map((item, index) => (
                                                <Cell key={`cell-${index}`} fill={item.color || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(val: any) => formatCurrency(Number(val || 0), currency)}
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderColor: '#1e293b',
                                                borderRadius: '0.75rem',
                                                color: '#f8fafc',
                                                fontSize: '12px',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Chart Legend Summary List */}
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3 text-[11px] dark:border-slate-800">
                            {financialDistribution.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }} />
                                    <span className="truncate text-slate-600 dark:text-slate-400">{item.name}:</span>
                                    <span className="ml-auto font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.value, currency)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dish Profitability Breakdown */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Dish Profitability & Recipe COGS Insights</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Individual menu item selling price vs raw ingredient cost price
                                </p>
                            </div>

                            {/* Search Filter for Dish Insights */}
                            <div className="relative w-full sm:w-56">
                                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter dishes..."
                                    value={dishSearch}
                                    onChange={(e) => {
                                        setDishSearch(e.target.value);
                                        setDishPage(1);
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-1.5 pr-3 pl-8 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-left text-xs text-slate-700 dark:text-slate-300">
                                <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                    <tr>
                                        <th className="p-3">Dish Name</th>
                                        <th className="p-3 text-right">Sold Qty</th>
                                        <th className="p-3 text-right">Revenue</th>
                                        <th className="p-3 text-right">Recipe COGS</th>
                                        <th className="p-3 text-right">Net Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {paginatedDishes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-slate-500">
                                                No dish sales insights available for selected period.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedDishes.map((dish, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{dish.name}</td>
                                                <td className="p-3 text-right text-slate-500 dark:text-slate-400">{dish.qty}</td>
                                                <td className="p-3 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(dish.revenue, currency)}
                                                </td>
                                                <td className="p-3 text-right font-semibold text-rose-500">{formatCurrency(dish.cost, currency)}</td>
                                                <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(dish.profit, currency)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-200 bg-amber-50/50 text-xs font-bold dark:border-slate-800 dark:bg-amber-950/20">
                                    <tr>
                                        <td className="p-3 text-slate-900 dark:text-slate-100">Total ({filteredDishes.length} Items):</td>
                                        <td className="p-3 text-right text-slate-700 dark:text-slate-300">{dishTotals.totalQty}</td>
                                        <td className="p-3 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(dishTotals.totalRevenue, currency)}
                                        </td>
                                        <td className="p-3 text-right font-extrabold text-rose-600 dark:text-rose-400">
                                            {formatCurrency(dishTotals.totalCost, currency)}
                                        </td>
                                        <td
                                            className={`p-3 text-right font-black ${
                                                dishTotals.totalProfit >= 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-600 dark:text-rose-400'
                                            }`}
                                        >
                                            {formatCurrency(dishTotals.totalProfit, currency)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Dish Insights Frontend Pagination Controls */}
                        {filteredDishes.length > 0 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-3 sm:flex-row dark:border-slate-800">
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span>
                                        Showing{' '}
                                        <strong className="text-slate-900 dark:text-slate-100">
                                            {(dishPage - 1) * dishPerPage + 1}
                                        </strong>{' '}
                                        to{' '}
                                        <strong className="text-slate-900 dark:text-slate-100">
                                            {Math.min(dishPage * dishPerPage, filteredDishes.length)}
                                        </strong>{' '}
                                        of <strong className="text-slate-900 dark:text-slate-100">{filteredDishes.length}</strong> items
                                    </span>
                                    <span className="mx-1 text-slate-300 dark:text-slate-700">|</span>
                                    <label className="flex items-center gap-1">
                                        <span>Per page:</span>
                                        <select
                                            value={dishPerPage}
                                            onChange={(e) => {
                                                setDishPerPage(Number(e.target.value));
                                                setDishPage(1);
                                            }}
                                            className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </label>
                                </div>

                                {totalDishPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setDishPage((p) => Math.max(1, p - 1))}
                                            disabled={dishPage === 1}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" /> Prev
                                        </button>

                                        {Array.from({ length: totalDishPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setDishPage(page)}
                                                className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                                                    dishPage === page
                                                        ? 'bg-amber-500 text-slate-950'
                                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setDishPage((p) => Math.min(totalDishPages, p + 1))}
                                            disabled={dishPage === totalDishPages}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Next <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Financial Calculation Process & Methodology Guide */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 col-span-3">
                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800">
                            <TrendingUp className="h-5 w-5 text-amber-500" />
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    How Profit & Loss Calculations Work (Calculation Methodology)
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Easy step-by-step breakdown of how Purchases, Bills, Salaries, and Net Profits are apportioned across daily, weekly, monthly, yearly, and custom date filters.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Daily Math Card */}
                            <div className="rounded-xl border border-amber-500/20 bg-amber-50/40 p-4 dark:bg-amber-950/20">
                                <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400">1. Daily Calculation (Today / Single Day)</h3>
                                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    <p>
                                        <strong>Formula:</strong> Total Monthly Amount ÷ Days in Month
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        Example (August - 31 Days): If Monthly Salary is ৳31,000, <strong>Daily Salary</strong> = ৳31,000 ÷ 31 = ৳1,000/day. Same daily apportionment applies to Purchases and Bills.
                                    </p>
                                    <p className="pt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        Daily Profit = Today's Sales &minus; (Daily Purchases + Daily Bills + Daily Salaries)
                                    </p>
                                </div>
                            </div>

                            {/* Weekly Math Card */}
                            <div className="rounded-xl border border-blue-500/20 bg-blue-50/40 p-4 dark:bg-blue-950/20">
                                <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400">2. Weekly Calculation (This Week / 7 Days)</h3>
                                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    <p>
                                        <strong>Formula:</strong> Total Monthly Amount ÷ Weeks in Month
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        Total Weeks in Month = Days in Month ÷ 7 (e.g., 31 ÷ 7 = 4.43 weeks).
                                        <strong>Weekly Rate</strong> = Monthly Amount ÷ 4.43 (equivalent to 7 days of daily rates).
                                    </p>
                                    <p className="pt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        Weekly Profit = Week Sales &minus; (Weekly Purchases + Weekly Bills + Weekly Salaries)
                                    </p>
                                </div>
                            </div>

                            {/* Monthly Math Card */}
                            <div className="rounded-xl border border-purple-500/20 bg-purple-50/40 p-4 dark:bg-purple-950/20">
                                <h3 className="text-xs font-bold text-purple-700 dark:text-purple-400">3. Monthly Calculation (Full Month)</h3>
                                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    <p>
                                        <strong>Formula:</strong> Sum of all transactions for the entire month
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        Aggregates all paid sales, total ingredient purchases, monthly operational bills, and paid staff salaries for that month.
                                    </p>
                                    <p className="pt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        Monthly Profit = Monthly Sales &minus; (Monthly Purchases + Monthly Bills + Monthly Salaries)
                                    </p>
                                </div>
                            </div>

                            {/* Yearly & Custom Date Math Card */}
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/40 p-4 dark:bg-emerald-950/20">
                                <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">4. Yearly & Custom Date Ranges</h3>
                                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    <p>
                                        <strong>Yearly:</strong> Sum of all 12 months (Jan 1 to Dec 31) for current year.
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        <strong>Custom Range (e.g. Aug 5–15 = 11 days):</strong> Sum of 11 individual daily rates for Purchases, Bills, and Salaries.
                                    </p>
                                    <p className="pt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        Custom Range Profit = Range Sales &minus; Apportioned Costs for Selected Days
                                    </p>
                                </div>
                            </div>

                            {/* Net Margin % Math Card */}
                            <div className="rounded-xl border border-rose-500/20 bg-rose-50/40 p-4 dark:bg-rose-950/20 sm:col-span-2 lg:col-span-1">
                                <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400">5. Net Profit Margin %</h3>
                                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    <p>
                                        <strong>Net Margin %:</strong> (Net Profit ÷ Sales Revenue) × 100
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        Sales Revenue = Direct sum of order total amounts. Net Profit = Sales Revenue &minus; Total Costs.
                                    </p>
                                    <p className="pt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                        Straightforward Math: Pulls total amounts directly for simple calculation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
