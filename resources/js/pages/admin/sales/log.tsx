import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateTime } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, Eye, Printer, Receipt } from 'lucide-react';
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
        total: number;
    };
    currency: string;
    filters: {
        date?: string;
        payment_method?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Sales Log', href: '/admin/sales/log' },
];

export default function SalesLog({ orders, currency, filters }: Props) {
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [selectedPayment, setSelectedPayment] = useState(filters.payment_method || '');
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const handleFilter = () => {
        router.get('/admin/sales/log', { date: selectedDate, payment_method: selectedPayment }, { preserveState: true });
    };

    const printReceipt = () => window.print();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Orders Log" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <Receipt className="h-6 w-6 text-amber-500" /> Sales Orders Audit Log
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            History of all completed POS transactions, receipts, and order billing logs
                        </p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex w-full flex-1 items-center gap-3">
                        <div className="relative flex-1">
                            <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        <select
                            value={selectedPayment}
                            onChange={(e) => setSelectedPayment(e.target.value)}
                            className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        >
                            <option value="">All Payment Methods</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                        </select>
                    </div>

                    <button
                        onClick={handleFilter}
                        className="w-full rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-300 md:w-auto dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        Apply Filters
                    </button>
                </div>

                {/* Sales Log Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Order Number</th>
                                    <th className="p-3.5">Type & Table</th>
                                    <th className="p-3.5">Date & Time</th>
                                    <th className="p-3.5">Payment Method</th>
                                    <th className="p-3.5 text-right">Total Paid</th>
                                    <th className="p-3.5 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            No sales order records found.
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
                                            <td className="p-3.5 font-bold text-slate-800 uppercase dark:text-slate-200">{order.payment_method}</td>
                                            <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                                {formatCurrency(order.total_amount, currency)}
                                            </td>
                                            <td className="p-3.5 text-right">
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
                        </table>
                    </div>
                </div>

                {/* Receipt Preview Modal */}
                {viewingOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl print:p-0">
                            <div className="space-y-1 border-b border-dashed border-slate-300 pb-4 text-center">
                                <h2 className="text-lg font-black">LE GOURMET BISTRO</h2>
                                <p className="text-[10px] text-slate-500">Order #{viewingOrder.order_number}</p>
                                <p className="text-[10px] text-slate-400">{formatDateTime(viewingOrder.created_at)}</p>
                            </div>

                            <div className="space-y-2 divide-y divide-slate-100 text-xs">
                                {viewingOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between pt-1.5">
                                        <span>
                                            {item.item_name} x {item.quantity}
                                        </span>
                                        <span className="font-bold">{formatCurrency(item.total_price, currency)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1 border-t border-dashed border-slate-300 pt-3 text-xs">
                                <div className="flex justify-between pt-2 text-sm font-black">
                                    <span>Total Paid</span>
                                    <span>{formatCurrency(viewingOrder.total_amount, currency)}</span>
                                </div>
                                <div className="pt-1 text-center text-[10px] text-slate-500">
                                    Payment Method: {viewingOrder.payment_method.toUpperCase()}
                                </div>
                                {viewingOrder.notes && (
                                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2 text-center text-[10px] text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                        <span className="font-bold">Note:</span> {viewingOrder.notes}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between gap-3 pt-2 text-center print:hidden">
                                <button
                                    onClick={() => setViewingOrder(null)}
                                    className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={printReceipt}
                                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950"
                                >
                                    <Printer className="h-4 w-4" /> Print Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
