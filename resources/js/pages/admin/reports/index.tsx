import AppLayout from '@/layouts/app-layout';
import { formatCurrency, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Calendar, Download, Mail, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface SummaryData {
    salesRevenue: number;
    purchasesCost: number;
    expensesTotal: number;
    salariesTotal: number;
    totalCosts: number;
    grossProfit: number;
    grossMarginPercent: number;
    netProfit: number;
    netMarginPercent: number;
    orderCount: number;
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

interface Props {
    currency: string;
    period: string;
    startDate: string;
    endDate: string;
    summary: SummaryData;
    expenseDistribution: ExpensePieItem[];
    dishInsights: DishInsight[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Financial P&L Reports', href: '/admin/reports' },
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
        grossProfit: 0,
        grossMarginPercent: 0,
        netProfit: 0,
        netMarginPercent: 0,
        orderCount: 0,
    },
    expenseDistribution = [],
    dishInsights = [],
}: Props) {
    const filterForm = useForm({
        period: period || 'month',
        start_date: startDate || '',
        end_date: endDate || '',
    });

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/reports', filterForm.data, { preserveState: true });
    };

    const handleSendDailyEmail = () => {
        router.post(
            '/admin/reports/send-daily-summary',
            {},
            {
                onSuccess: () => showToast('Daily Closing P&L Summary email sent to admin!', 'success'),
            },
        );
    };

    const handleExportCSV = () => {
        window.location.href = `/admin/reports/export-csv?period=${filterForm.data.period}&start_date=${filterForm.data.start_date}&end_date=${filterForm.data.end_date}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial P&L Analytics & Audit Reports" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <TrendingUp className="h-6 w-6 text-amber-500" /> Financial Profit & Loss Analytics
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Sales revenue rollups, procurement COGS, operational overhead, net profit margins, and daily email summaries
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSendDailyEmail}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-500"
                        >
                            <Mail className="h-4 w-4" /> Trigger Daily Closing Email
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition-all hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Download className="h-4 w-4" /> Export CSV Report
                        </button>
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
                        className="w-full rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 transition-all hover:bg-amber-400 md:w-auto"
                    >
                        Apply Report Filters
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
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Procurement & Expenses</span>
                        <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
                            {formatCurrency(summary.totalCosts, currency)}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            COGS: {formatCurrency(summary.purchasesCost, currency)} | Overhead: {formatCurrency(summary.expensesTotal, currency)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Gross Profit Margin %</span>
                        <div className="mt-2 flex items-center gap-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            <ArrowUpRight className="h-5 w-5" /> {summary.grossMarginPercent}%
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Gross Profit: {formatCurrency(summary.grossProfit, currency)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Profit Margin %</span>
                        <div
                            className={`mt-2 flex items-center gap-1 text-2xl font-black ${
                                summary.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                        >
                            {summary.netProfit >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                            {summary.netMarginPercent}%
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Net Profit: {formatCurrency(summary.netProfit, currency)}
                        </p>
                    </div>
                </div>

                {/* Expense Pie Chart & Dish Profitability */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Expense Pie Chart */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <PieChartIcon className="h-4 w-4 text-amber-500" /> Operational Expense Distribution
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown by category tagging</p>
                        </div>

                        <div className="h-56 w-full">
                            {!expenseDistribution || expenseDistribution.length === 0 ? (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                    No operational expense breakdown found for selected period.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={expenseDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                            {(expenseDistribution || []).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
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
                    </div>

                    {/* Dish Profitability Breakdown */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Dish Profitability & Recipe COGS Insights</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Individual menu item selling price vs raw ingredient cost price
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
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
                                    {dishInsights.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-slate-500">
                                                No dish sales insights available for selected period.
                                            </td>
                                        </tr>
                                    ) : (
                                        dishInsights.map((dish, idx) => (
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
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
