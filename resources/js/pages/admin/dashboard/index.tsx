import AppLayout from '@/layouts/app-layout';
import { formatCurrency, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    DollarSign,
    Filter,
    Layers,
    LayoutDashboard,
    Loader2,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MetricCards {
    salesSelected: number;
    purchasesSelected: number;
    expensesSelected: number;
    salariesSelected: number;
    grossProfitSelected: number;
    netProfitSelected: number;
    expiredCount: number;
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

interface TrendPoint {
    day: string;
    sales: number;
    purchases: number;
}

interface TopDish {
    dish: string;
    sold_qty: number;
    revenue: number;
}

interface ExpiryItem {
    id: number;
    ingredient_name: string;
    quantity: number;
    used_amount: number;
    unit: string;
    purchase?: {
        purchase_number: string;
        supplier_name_text?: string;
        supplier?: {
            name: string;
        };
    };
}

interface Props {
    period?: string;
    startDate?: string;
    endDate?: string;
    metrics: MetricCards;
    profitBreakdown?: ProfitBreakdown;
    salesTrend: TrendPoint[];
    topDishes: TopDish[];
    expiryAlerts: ExpiryItem[];
    expiryThreshold: number;
    currency: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Overview',
        href: '/administration-control/dashboard',
    },
];

export default function Dashboard({
    period = 'month',
    startDate = '',
    endDate = '',
    metrics,
    profitBreakdown,
    salesTrend = [],
    topDishes = [],
    expiryAlerts = [],
    expiryThreshold = 80,
    currency = '৳',
}: Props) {
    const { flash } = usePage().props as any;

    const safeMetrics = {
        salesSelected: metrics?.salesSelected ?? 0,
        purchasesSelected: metrics?.purchasesSelected ?? 0,
        expensesSelected: metrics?.expensesSelected ?? 0,
        salariesSelected: metrics?.salariesSelected ?? 0,
        grossProfitSelected: metrics?.grossProfitSelected ?? 0,
        netProfitSelected: metrics?.netProfitSelected ?? 0,
        expiredCount: metrics?.expiredCount ?? 0,
    };

    const filterForm = useForm({
        period: period || 'month',
        start_date: startDate || '',
        end_date: endDate || '',
    });

    useEffect(() => {
        if (flash?.success) {
            showToast(flash.success, 'success');
        } else if (flash?.error) {
            showToast(flash.error, 'error');
        }
    }, [flash]);

    const handlePeriodChange = (selectedPeriod: string) => {
        filterForm.setData('period', selectedPeriod);
        if (selectedPeriod !== 'custom') {
            router.get('/administration-control/dashboard', { period: selectedPeriod }, { preserveState: true });
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/administration-control/dashboard', filterForm.data, { preserveState: true });
    };

    const profitCards = [
        { key: 'daily', title: 'Daily Profit / Loss', subtitle: 'Today', data: profitBreakdown?.daily },
        { key: 'weekly', title: 'Weekly Profit / Loss', subtitle: 'This Week', data: profitBreakdown?.weekly },
        { key: 'monthly', title: 'Monthly Profit / Loss', subtitle: 'This Month', data: profitBreakdown?.monthly },
        { key: 'yearly', title: 'Yearly Profit / Loss', subtitle: 'This Year', data: profitBreakdown?.yearly },
        { key: 'all_time', title: 'All Time Profit / Loss', subtitle: 'Cumulative', data: profitBreakdown?.all_time },
    ];

    const getPeriodLabel = () => {
        switch (period) {
            case 'today':
                return 'Today';
            case 'week':
                return 'This Week';
            case 'month':
                return 'This Month';
            case 'year':
                return 'This Year';
            case 'all':
                return 'All Time';
            case 'custom':
                return `${startDate} to ${endDate}`;
            default:
                return 'This Month';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurant Operations Dashboard" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                {/* Dashboard Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <LayoutDashboard className="h-7 w-7 text-amber-500" /> Operational Control Center
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Real-time sales revenue, profit/loss calculations, expense tracking, and ingredient warnings
                        </p>
                    </div>
                </div>

                {/* Dashboard Timeframe Filter Bar */}
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Dashboard Timeframe:</span>
                            {(
                                [
                                    { id: 'today', label: 'Today' },
                                    { id: 'week', label: 'This Week' },
                                    { id: 'month', label: 'This Month' },
                                    { id: 'year', label: 'This Year' },
                                    { id: 'all', label: 'All Time' },
                                    { id: 'custom', label: 'Custom Range' },
                                ] as const
                            ).map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handlePeriodChange(p.id)}
                                    className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                                        filterForm.data.period === p.id
                                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                            Active Period: {getPeriodLabel()}
                        </span>
                    </div>

                    {filterForm.data.period === 'custom' && (
                        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <Calendar className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    value={filterForm.data.start_date}
                                    onChange={(e) => filterForm.setData('start_date', e.target.value)}
                                    className="rounded-xl border border-slate-300 bg-slate-100 py-1.5 pr-3 pl-9 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                            <span className="text-slate-500">to</span>
                            <div className="relative">
                                <Calendar className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    value={filterForm.data.end_date}
                                    onChange={(e) => filterForm.setData('end_date', e.target.value)}
                                    className="rounded-xl border border-slate-300 bg-slate-100 py-1.5 pr-3 pl-9 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={filterForm.processing}
                                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {filterForm.processing ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Applying...</span>
                                    </>
                                ) : (
                                    <>
                                        <Filter className="h-3.5 w-3.5" />
                                        <span>Apply Custom Range</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Profit & Loss Overview Cards (5 Standard Periods) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                            <TrendingUp className="h-4 w-4 text-amber-500" /> Standard Profit & Loss Rollups [Sales &minus; (Purchases + Salaries + Bills)]
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

                {/* 4 Selected Timeframe Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Sales Revenue for Selected Period */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sales Revenue ({getPeriodLabel()})</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                {formatCurrency(safeMetrics.salesSelected, currency)}
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                Total Completed Orders in {getPeriodLabel()}
                            </p>
                        </div>
                    </div>

                    {/* Procurement Purchases for Selected Period */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Purchases / Bazar ({getPeriodLabel()})</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                {formatCurrency(safeMetrics.purchasesSelected, currency)}
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <Layers className="h-3.5 w-3.5" /> Ingredient Procurement Costs
                            </p>
                        </div>
                    </div>

                    {/* Bills & Expenses for Selected Period */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bills & Expenses ({getPeriodLabel()})</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                {formatCurrency(safeMetrics.expensesSelected, currency)}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Utilities, Rent & Operational Overhead</p>
                        </div>
                    </div>

                    {/* Net Profit / Loss for Selected Period */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Profit / Loss ({getPeriodLabel()})</span>
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                    safeMetrics.netProfitSelected >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}
                            >
                                {safeMetrics.netProfitSelected >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                            </div>
                        </div>
                        <div className="mt-3">
                            <div
                                className={`text-2xl font-black ${
                                    safeMetrics.netProfitSelected >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}
                            >
                                {safeMetrics.netProfitSelected >= 0 ? '+' : '-'}{formatCurrency(Math.abs(safeMetrics.netProfitSelected), currency)}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                Gross Profit: {formatCurrency(safeMetrics.grossProfitSelected, currency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Expiry & High Usage Warnings Section */}
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-4 w-4 text-amber-500" /> Expiry & High Usage Warnings (Items Used &ge; {expiryThreshold}%)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Purchased ingredients reaching or exceeding {expiryThreshold}% of their main quantity
                            </p>
                        </div>
                    </div>

                    {(expiryAlerts || []).length === 0 ? (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            ✓ No ingredients currently reaching or exceeding the {expiryThreshold}% usage warning threshold.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto pr-1">
                            {(expiryAlerts || []).map((item) => {
                                const usedPct = item.quantity > 0 ? (item.used_amount / item.quantity) * 100 : 0;

                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-50/50 p-3.5 text-xs dark:border-amber-500/20 dark:bg-amber-950/20"
                                    >
                                        <div className="flex items-center justify-between font-bold">
                                            <span className="text-slate-900 dark:text-slate-100">{item.ingredient_name}</span>
                                            <span className="font-mono text-amber-600 dark:text-amber-400">#{item.purchase?.purchase_number}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                            <span>Qty: {item.quantity} {item.unit}</span>
                                            <span>Used: {item.used_amount} {item.unit}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className="h-full bg-amber-500 transition-all"
                                                    style={{ width: `${Math.min(100, usedPct)}%` }}
                                                />
                                            </div>
                                            <div className="text-right text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                                                {usedPct.toFixed(1)}% Used (Threshold: {expiryThreshold}%)
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Dynamic Content Grid: Financial Trend Chart & Top Selling Dishes for Selected Timeframe */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Revenue & Procurement Trend Chart */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    Financial Flow Trend ({getPeriodLabel()})
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Sales Revenue vs Raw Material Procurement Costs across {getPeriodLabel()}
                                </p>
                            </div>
                        </div>

                        <div className="h-72 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesTrend}>
                                    <defs>
                                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="purchasesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#1e293b',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: '12px',
                                        }}
                                        formatter={(value: any) => [formatCurrency(Number(value), currency), '']}
                                    />
                                    <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#f59e0b" fillOpacity={1} fill="url(#salesGrad)" />
                                    <Area type="monotone" dataKey="purchases" name="Purchases / Bazar" stroke="#3b82f6" fillOpacity={1} fill="url(#purchasesGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Selling Dishes for Selected Timeframe */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                Top 5 Popular Dishes ({getPeriodLabel()})
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Best-selling menu items by quantity sold</p>
                        </div>

                        <div className="space-y-3">
                            {topDishes.length === 0 ? (
                                <p className="py-8 text-center text-xs text-slate-500">No dish sales recorded for {getPeriodLabel()}.</p>
                            ) : (
                                topDishes.map((dish, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 font-bold text-amber-600 dark:text-amber-400">
                                                #{idx + 1}
                                            </span>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-slate-100">{dish.dish}</div>
                                                <div className="text-[10px] text-slate-500">{dish.sold_qty} orders completed</div>
                                            </div>
                                        </div>
                                        <div className="text-right font-extrabold text-amber-600 dark:text-amber-400">
                                            {formatCurrency(dish.revenue, currency)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
