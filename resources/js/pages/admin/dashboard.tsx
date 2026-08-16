import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatHumanDate, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Boxes,
    Clock,
    DollarSign,
    Layers,
    LayoutDashboard,
    ShoppingBag,
    TrendingUp,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MetricCards {
    salesToday: number;
    salesMonth: number;
    purchaseToday: number;
    expensesMonth: number;
    cogsMonth: number;
    grossProfitMonth: number;
    lowStockCount: number;
    expiredCount: number;
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

interface LowStockItem {
    id: number;
    name: string;
    current_stock: number;
    min_stock_threshold: number;
    unit: string;
}

interface ExpiryItem {
    id: number;
    name: string;
    current_stock: number;
    unit: string;
    expiry_date: string;
}

interface Props {
    metrics: MetricCards;
    salesTrend: TrendPoint[];
    topDishes: TopDish[];
    lowStockItems: LowStockItem[];
    expiryAlerts: ExpiryItem[];
    currency: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Overview',
        href: '/admin/dashboard',
    },
];

export default function Dashboard({
    metrics = {
        salesToday: 0,
        salesMonth: 0,
        purchaseToday: 0,
        expensesMonth: 0,
        cogsMonth: 0,
        grossProfitMonth: 0,
        lowStockCount: 0,
        expiredCount: 0,
    },
    salesTrend = [],
    topDishes = [],
    lowStockItems = [],
    expiryAlerts = [],
    currency = '৳',
}: Props) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash?.success) {
            showToast(flash.success, 'success');
        }
        if (flash?.error) {
            showToast(flash.error, 'error');
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Operations Dashboard" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <LayoutDashboard className="h-6 w-6 text-amber-500" /> Admin Command Center
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Real-time metrics for inventory, POS sales, daily procurement, and stock alert summaries
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ● System Status: Synchronized
                        </span>
                    </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Sales Today */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sales Revenue (Today)</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                {formatCurrency(metrics.salesToday, currency)}
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <ArrowUpRight className="h-3.5 w-3.5" /> Month Total: {formatCurrency(metrics.salesMonth, currency)}
                            </p>
                        </div>
                    </div>

                    {/* Procurement Purchases */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Purchases / Bazar (Today)</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                {formatCurrency(metrics.purchaseToday, currency)}
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <Layers className="h-3.5 w-3.5" /> Raw Stock Restock
                            </p>
                        </div>
                    </div>

                    {/* Gross Profit Month */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Gross Profit (Month)</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div
                                className={`text-2xl font-black ${metrics.grossProfitMonth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}
                            >
                                {formatCurrency(metrics.grossProfitMonth, currency)}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">COGS: {formatCurrency(metrics.cogsMonth, currency)}</p>
                        </div>
                    </div>

                    {/* Operational Expenses */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Operational Expenses (Month)</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                                <ArrowDownRight className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                                {formatCurrency(metrics.expensesMonth, currency)}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Rent, Utilities, Salaries</p>
                        </div>
                    </div>
                </div>

                {/* 7-Day Trend Chart & Top Dishes */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Sales & Purchase Trend Chart */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">7-Day Sales vs Procurements Trend</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Daily revenue comparison against ingredient purchases</p>
                            </div>
                            <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                Live Analytics
                            </span>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesTrend}>
                                    <defs>
                                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#1e293b',
                                            borderRadius: '0.75rem',
                                            color: '#f8fafc',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        name="Sales"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#salesGrad)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="purchases"
                                        name="Purchases"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#purchaseGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Selling Dishes */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <UtensilsCrossed className="h-4 w-4 text-amber-500" /> Top Performing Menu Dishes
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Highest quantity ordered this month</p>
                        </div>

                        <div className="space-y-3">
                            {(topDishes || []).length === 0 ? (
                                <p className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">No order data recorded yet.</p>
                            ) : (
                                (topDishes || []).map((dish, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-[10px] font-bold text-amber-500">
                                                #{idx + 1}
                                            </span>
                                            <div>
                                                <span className="block font-semibold text-slate-800 dark:text-slate-200">{dish.dish}</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{dish.sold_qty} orders placed</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(dish.revenue, currency)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Stock Alerts Widget */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Low Stock Threshold Alerts */}
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Ingredient Stock Alerts ({(lowStockItems || []).length})
                            </h3>
                        </div>

                        {(lowStockItems || []).length === 0 ? (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                ✓ All raw ingredients are sufficiently stocked above minimum thresholds.
                            </div>
                        ) : (
                            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                {(lowStockItems || []).map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Boxes className="h-4 w-4 text-amber-500" />
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                                                <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                                                    Min Threshold: {item.min_stock_threshold} {item.unit}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-extrabold text-amber-700 dark:text-amber-400">
                                            {item.current_stock} {item.unit} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Expiry Alerts */}
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <Clock className="h-4 w-4 text-rose-500" /> Ingredient Expiry Warnings ({(expiryAlerts || []).length})
                            </h3>
                        </div>

                        {(expiryAlerts || []).length === 0 ? (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                ✓ No stock items nearing expiration within the next 7 days.
                            </div>
                        ) : (
                            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                {(expiryAlerts || []).map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs"
                                    >
                                        <div>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                                            <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                                                Quantity: {item.current_stock} {item.unit}
                                            </span>
                                        </div>
                                        <span className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-extrabold text-rose-700 dark:text-rose-400">
                                            Expires: {formatHumanDate(item.expiry_date)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
