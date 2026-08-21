import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/pagination';
import PosReceipt from '@/components/receipt/pos-receipt';
import { printReceipt } from '@/lib/print-receipt';
import { formatCurrency, formatDateTime } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Eye, Filter, Printer, Receipt, Search } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface Order {
    id: number;
    order_number: string;
    order_type: string;
    table_number?: string;
    customer_name?: string;
    customer_phone?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    notes?: string;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    orders: {
        data: Order[];
        links: any[];
        from?: number;
        to?: number;
        total: number;
    };
    totalSalesAmount: number;
    totalSubtotal?: number;
    totalDiscount?: number;
    totalTax?: number;
    currency: string;
    filters: {
        search?: string;
        order_type?: string;
        payment_method?: string;
        from_date?: string;
        to_date?: string;
        date?: string;
        all_time?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'Sales Log', href: '/administration-control/sales/log' },
];

export default function SalesLog({ orders, totalSalesAmount = 0, totalSubtotal = 0, totalDiscount = 0, totalTax = 0, currency, filters }: Props) {
    const { branding } = usePage<{ branding?: { brand_name?: string } }>().props;
    const brandName = branding?.brand_name || 'Restaurant';
    const todayStr = new Date().toISOString().split('T')[0];

    const [search, setSearch] = useState(filters.search || '');
    const [fromDate, setFromDate] = useState(filters.from_date ?? todayStr);
    const [toDate, setToDate] = useState(filters.to_date ?? todayStr);
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');
    const [orderType, setOrderType] = useState(filters.order_type || '');
    const [activePreset, setActivePreset] = useState<'today' | 'week' | 'month' | 'year' | 'custom' | 'all'>(
        filters.all_time ? 'all' : 'today'
    );

    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    // Date range preset helpers
    const setPresetRange = (preset: 'today' | 'week' | 'month' | 'year' | 'all') => {
        setActivePreset(preset);

        if (preset === 'today') {
            setFromDate(todayStr);
            setToDate(todayStr);
            applyFilters({ from_date: todayStr, to_date: todayStr, all_time: undefined });
        } else if (preset === 'week') {
            const now = new Date();
            const day = now.getDay();
            const diffToSat = (day + 1) % 7;
            const saturdayDate = new Date(now);
            saturdayDate.setDate(now.getDate() - diffToSat);
            const startOfWeek = saturdayDate.toISOString().split('T')[0];
            setFromDate(startOfWeek);
            setToDate(todayStr);
            applyFilters({ from_date: startOfWeek, to_date: todayStr, all_time: undefined });
        } else if (preset === 'month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            setFromDate(startOfMonth);
            setToDate(todayStr);
            applyFilters({ from_date: startOfMonth, to_date: todayStr, all_time: undefined });
        } else if (preset === 'year') {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            setFromDate(startOfYear);
            setToDate(todayStr);
            applyFilters({ from_date: startOfYear, to_date: todayStr, all_time: undefined });
        } else if (preset === 'all') {
            setFromDate('');
            setToDate('');
            applyFilters({ from_date: '', to_date: '', all_time: '1' });
        }
    };

    const applyFilters = (overrideParams?: any) => {
        const params = {
            search,
            from_date: fromDate,
            to_date: toDate,
            payment_method: paymentMethod,
            order_type: orderType,
            ...overrideParams,
        };
        router.get('/administration-control/sales/log', params, { preserveState: true });
    };

    const resetFilters = () => {
        setSearch('');
        setFromDate(todayStr);
        setToDate(todayStr);
        setPaymentMethod('');
        setOrderType('');
        setActivePreset('today');
        router.get('/administration-control/sales/log', { from_date: todayStr, to_date: todayStr }, { preserveState: true });
    };

    const printReceipt = () => window.print();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Orders Log" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden dark:bg-slate-950 dark:text-slate-100 print:hidden">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <Receipt className="h-6 w-6 text-amber-500" /> Sales Orders Audit Log
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            History of all completed POS transactions, receipts, and order billing logs
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (search) params.set('search', search);
                                if (fromDate) params.set('from_date', fromDate);
                                if (toDate) params.set('to_date', toDate);
                                if (paymentMethod) params.set('payment_method', paymentMethod);
                                if (orderType) params.set('order_type', orderType);
                                if (activePreset === 'all') params.set('all_time', '1');
                                window.location.href = `/administration-control/sales/export-excel?${params.toString()}`;
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition-all hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Download className="h-4 w-4" /> Export Excel (.xlsx)
                        </button>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
                    {/* Date Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Quick Range:</span>
                        <button
                            onClick={() => setPresetRange('today')}
                            className={`rounded-xl px-3 py-1.5 font-bold transition-all ${activePreset === 'today'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setPresetRange('week')}
                            className={`rounded-xl px-3 py-1.5 font-bold transition-all ${activePreset === 'week'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setPresetRange('month')}
                            className={`rounded-xl px-3 py-1.5 font-bold transition-all ${activePreset === 'month'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setPresetRange('year')}
                            className={`rounded-xl px-3 py-1.5 font-bold transition-all ${activePreset === 'year'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                        >
                            This Year
                        </button>
                        <button
                            onClick={() => setPresetRange('all')}
                            className={`rounded-xl px-3 py-1.5 font-bold transition-all ${activePreset === 'all'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                        >
                            All Time
                        </button>
                    </div>

                    {/* Inputs Grid Row */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div>
                            <label className="mb-0.5 block text-[10px] text-slate-500">Search</label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search with order"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-1.5 pr-3 pl-10 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-0.5 block text-[10px] text-slate-500">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setActivePreset('custom');
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        <div>
                            <label className="mb-0.5 block text-[10px] text-slate-500">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setActivePreset('custom');
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        <div>
                            <label className="mb-0.5 block text-[10px] text-slate-500">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            >
                                <option value="">All Payment Methods</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="bkash">bKash</option>
                                <option value="nagad">Nagad</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-0.5 block text-[10px] text-slate-500">Order Type</label>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            >
                                <option value="">All Order Types</option>
                                <option value="dine_in">Dine In</option>
                                <option value="takeaway">Takeaway</option>
                                <option value="delivery">Delivery</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            onClick={resetFilters}
                            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={() => applyFilters()}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400"
                        >
                            <Filter className="h-3.5 w-3.5" /> Search
                        </button>
                    </div>
                </div>

                {/* Sales Log Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-none print:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Order Number</th>
                                    <th className="p-3.5">Type & Table</th>
                                    <th className="p-3.5">Date & Time</th>
                                    <th className="p-3.5">Payment Method</th>
                                    <th className="p-3.5 text-right">Subtotal</th>
                                    <th className="p-3.5 text-right">Discount</th>
                                    <th className="p-3.5 text-right">Tax</th>
                                    <th className="p-3.5 text-right">Total Paid</th>
                                    <th className="p-3.5 text-right print:hidden">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-slate-500">
                                            No sales order records found matching your date range or filters.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">#{order.order_number}</td>
                                            <td className="p-3.5 capitalize">
                                                {order.order_type.replace('_', ' ')}
                                                {order.table_number ? ` (${order.table_number})` : ''}
                                            </td>
                                            <td className="p-3.5 text-slate-500 dark:text-slate-400">{formatDateTime(order.created_at)}</td>
                                            <td className="p-3.5 font-bold uppercase text-slate-800 dark:text-slate-200">{order.payment_method}</td>
                                            <td className="p-3.5 text-right font-medium text-slate-600 dark:text-slate-400">
                                                {formatCurrency(order.subtotal ?? 0, currency)}
                                            </td>
                                            <td className="p-3.5 text-right font-medium text-rose-600 dark:text-rose-400">
                                                {order.discount_amount > 0 ? `-${formatCurrency(order.discount_amount, currency)}` : formatCurrency(0, currency)}
                                            </td>
                                            <td className="p-3.5 text-right font-medium text-slate-600 dark:text-slate-400">
                                                {formatCurrency(order.tax_amount ?? 0, currency)}
                                            </td>
                                            <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                                {formatCurrency(order.total_amount, currency)}
                                            </td>
                                            <td className="p-3.5 text-right print:hidden">
                                                <button
                                                    onClick={() => setViewingOrder(order)}
                                                    className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-200 bg-amber-50/50 dark:border-slate-800 dark:bg-amber-950/20">
                                <tr>
                                    <td colSpan={4} className="p-3.5 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Total Sales (Filtered Search Range):
                                    </td>
                                    <td className="p-3.5 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {formatCurrency(totalSubtotal, currency)}
                                    </td>
                                    <td className="p-3.5 text-right text-xs font-bold text-rose-600 dark:text-rose-400">
                                        -{formatCurrency(totalDiscount, currency)}
                                    </td>
                                    <td className="p-3.5 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {formatCurrency(totalTax, currency)}
                                    </td>
                                    <td className="p-3.5 text-right text-sm font-black text-amber-600 dark:text-amber-400">
                                        {formatCurrency(totalSalesAmount, currency)}
                                    </td>
                                    <td className="print:hidden"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="print:hidden">
                        <Pagination links={orders.links} from={orders.from} to={orders.to} total={orders.total} />
                    </div>
                </div>
            </div>

            {/* Receipt Preview Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                    <div className="relative max-h-[95vh] overflow-y-auto w-full max-w-[360px]">
                        <PosReceipt
                            order={viewingOrder as any}
                            branding={branding as any}
                            currency={currency}
                            onClose={() => setViewingOrder(null)}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
