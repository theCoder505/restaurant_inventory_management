import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/pagination';
import { formatCurrency, formatDateTime } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Download, Eye, Filter, Receipt, Search, X, Tag, Hash, User, Calendar, Clock, Utensils, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    kitchen_code?: string;
}

interface Order {
    id: number;
    order_number: string;
    order_type: string;
    order_status?: 'processing' | 'ready' | 'served' | 'completed' | 'cancelled';
    table_number?: string;
    customer_name?: string;
    customer_phone?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    discount_note?: string;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
    notes?: string;
    created_at: string;
    items: OrderItem[];
    creator?: {
        name?: string;
    };
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
        order_status?: string;
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
    const { branding } = usePage<{ branding?: any }>().props;
    const brandName = branding?.brand_name || 'Restaurant';
    const todayStr = new Date().toISOString().split('T')[0];

    const [search, setSearch] = useState(filters.search || '');
    const [fromDate, setFromDate] = useState(filters.from_date ?? todayStr);
    const [toDate, setToDate] = useState(filters.to_date ?? todayStr);
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');
    const [orderType, setOrderType] = useState(filters.order_type || '');
    const [orderStatus, setOrderStatus] = useState(filters.order_status || '');
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
            order_status: orderStatus,
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
        setOrderStatus('');
        setActivePreset('today');
        router.get('/administration-control/sales/log', { from_date: todayStr, to_date: todayStr }, { preserveState: true });
    };

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
                            History of all KOT order lifecycles, payments, and generated full-page billing receipts
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const exportUrl = `/administration-control/sales/export-excel?${new URLSearchParams({
                                    search,
                                    from_date: fromDate,
                                    to_date: toDate,
                                    payment_method: paymentMethod,
                                    order_type: orderType,
                                    order_status: orderStatus,
                                    all_time: activePreset === 'all' ? '1' : '',
                                }).toString()}`;
                                window.location.href = exportUrl;
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            <Download className="h-4 w-4 text-amber-500" /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Filters & Presets Bar */}
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-xs">
                    {/* Presets Row */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-500 mr-2">Quick Date:</span>
                        {['today', 'week', 'month', 'year', 'all'].map((preset) => (
                            <button
                                key={preset}
                                onClick={() => setPresetRange(preset as any)}
                                className={`rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
                                    activePreset === preset
                                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {preset === 'today' ? 'Today' : preset === 'week' ? 'This Week' : preset === 'month' ? 'This Month' : preset === 'year' ? 'This Year' : 'All Time'}
                            </button>
                        ))}
                    </div>

                    {/* Inputs Grid Row */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                        <div>
                            <label className="mb-0.5 block text-[10px] text-slate-500 font-bold">Search</label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search order #, customer..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-1.5 pr-3 pl-8 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-0.5 block text-[10px] text-slate-500 font-bold">From Date</label>
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
                            <label className="mb-0.5 block text-[10px] text-slate-500 font-bold">To Date</label>
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
                            <label className="mb-0.5 block text-[10px] text-slate-500 font-bold">Status</label>
                            <select
                                value={orderStatus}
                                onChange={(e) => setOrderStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            >
                                <option value="">All Statuses</option>
                                <option value="completed">Completed & Billed</option>
                                <option value="processing">Processing in Kitchen</option>
                                <option value="ready">Ready to Serve</option>
                                <option value="served">Served to Table</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-0.5 block text-[10px] text-slate-500 font-bold">Payment Method</label>
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
                            <label className="mb-0.5 block text-[10px] text-slate-500 font-bold">Order Type</label>
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
                            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={() => applyFilters()}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                        >
                            <Filter className="h-3.5 w-3.5" /> Filter Results
                        </button>
                    </div>
                </div>

                {/* Sales Log Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-none print:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Order Number</th>
                                    <th className="p-3.5">Type & Table</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5">Date & Time</th>
                                    <th className="p-3.5">Payment</th>
                                    <th className="p-3.5 text-right">Subtotal</th>
                                    <th className="p-3.5 text-right">Discount</th>
                                    <th className="p-3.5 text-right">Tax</th>
                                    <th className="p-3.5 text-right">Total Paid</th>
                                    <th className="p-3.5 text-right print:hidden">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-slate-500">
                                            No sales order records found matching your date range or filters.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => {
                                        const isCompleted = (order.order_status || 'completed') === 'completed';
                                        const isReady = order.order_status === 'ready';
                                        const isServed = order.order_status === 'served';
                                        const isProcessing = order.order_status === 'processing';

                                        return (
                                            <tr key={order.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                                                    #{order.order_number}
                                                </td>
                                                <td className="p-3.5 capitalize">
                                                    {order.order_type.replace('_', ' ')}
                                                    {order.table_number ? ` (${order.table_number})` : ''}
                                                </td>
                                                <td className="p-3.5">
                                                    <span
                                                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                                            isCompleted
                                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                                : isReady
                                                                ? 'bg-emerald-500 text-white'
                                                                : isServed
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-amber-500 text-slate-950'
                                                        }`}
                                                    >
                                                        {order.order_status || 'completed'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-slate-500 dark:text-slate-400">
                                                    {formatDateTime(order.created_at)}
                                                </td>
                                                <td className="p-3.5 font-bold uppercase text-slate-800 dark:text-slate-200">
                                                    {order.payment_method}
                                                </td>
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
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setViewingOrder(order)}
                                                            className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-600 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer"
                                                            title="View Order Details"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" /> Details
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-200 bg-amber-50/50 dark:border-slate-800 dark:bg-amber-950/20">
                                <tr>
                                    <td colSpan={5} className="p-3.5 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
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

            {/* Clean Order Details Modal (No Thermal Bill, No Print Option) */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                                        Order #{viewingOrder.order_number}
                                    </h3>
                                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 border border-amber-500/20">
                                        {viewingOrder.order_type.replace('_', ' ')}
                                    </span>
                                    <span
                                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                                            viewingOrder.order_status === 'completed'
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                : viewingOrder.order_status === 'ready'
                                                ? 'bg-emerald-500 text-white'
                                                : viewingOrder.order_status === 'served'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-amber-500 text-slate-950'
                                        }`}
                                    >
                                        {viewingOrder.order_status || 'completed'}
                                    </span>
                                    <span
                                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                                            viewingOrder.payment_status === 'paid'
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                        }`}
                                    >
                                        {viewingOrder.payment_status}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-slate-400" />
                                        {formatDateTime(viewingOrder.created_at)}
                                    </span>
                                    {viewingOrder.creator?.name && (
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3 text-slate-400" />
                                            Staff: {viewingOrder.creator.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-sm">
                            {/* Order Attributes Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
                                <div>
                                    <div className="text-[11px] font-bold uppercase text-slate-400">Table</div>
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                                        {viewingOrder.table_number || 'None'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold uppercase text-slate-400">Customer</div>
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                                        {viewingOrder.customer_name || 'Walk-in'}
                                        {viewingOrder.customer_phone && (
                                            <span className="block text-xs text-slate-500">
                                                {viewingOrder.customer_phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold uppercase text-slate-400">Payment</div>
                                    <div className="font-semibold uppercase text-slate-800 dark:text-slate-200">
                                        {viewingOrder.payment_method}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold uppercase text-slate-400">Trx / Ref ID</div>
                                    <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
                                        {viewingOrder.transaction_id || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <div>
                                <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Ordered Dishes ({viewingOrder.items?.length || 0})
                                </h4>
                                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-slate-200 bg-slate-100 font-bold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                            <tr>
                                                <th className="p-2.5">Item</th>
                                                <th className="p-2.5 text-center">Kitchen Code</th>
                                                <th className="p-2.5 text-center">Qty</th>
                                                <th className="p-2.5 text-right">Price</th>
                                                <th className="p-2.5 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {viewingOrder.items?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                    <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">
                                                        {item.item_name}
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        {item.kitchen_code ? (
                                                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-600 border border-amber-500/20">
                                                                {item.kitchen_code}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2.5 text-center font-bold text-slate-800 dark:text-slate-200">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="p-2.5 text-right text-slate-600 dark:text-slate-400">
                                                        {formatCurrency(item.unit_price, currency)}
                                                    </td>
                                                    <td className="p-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                                                        {formatCurrency(item.total_price, currency)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Financial Breakdown Card */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(viewingOrder.subtotal ?? 0, currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Tax / VAT:</span>
                                        <span className="font-medium">{formatCurrency(viewingOrder.tax_amount ?? 0, currency)}</span>
                                    </div>

                                    {/* Discount & Discount Note */}
                                    {viewingOrder.discount_amount > 0 && (
                                        <div className="rounded-lg bg-rose-50 border border-rose-200/60 p-2.5 dark:bg-rose-950/30 dark:border-rose-900/40">
                                            <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400">
                                                <span className="flex items-center gap-1">
                                                    <Tag className="h-3.5 w-3.5" /> Discount:
                                                </span>
                                                <span>-{formatCurrency(viewingOrder.discount_amount, currency)}</span>
                                            </div>
                                            {viewingOrder.discount_note && (
                                                <div className="mt-1 text-[11px] font-medium text-rose-700 dark:text-rose-300">
                                                    <span className="font-bold">Discount Note:</span> {viewingOrder.discount_note}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="border-t border-slate-200 pt-2 dark:border-slate-800">
                                        <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100">
                                            <span>Total Amount:</span>
                                            <span className="text-amber-600 dark:text-amber-400">
                                                {formatCurrency(viewingOrder.total_amount, currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer / Order Notes */}
                            {viewingOrder.notes && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                                    <span className="font-bold">Order / Kitchen Instructions: </span>
                                    {viewingOrder.notes}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer (Strictly Close only - no print, no thermal) */}
                        <div className="border-t border-slate-200 px-5 py-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white shadow hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
