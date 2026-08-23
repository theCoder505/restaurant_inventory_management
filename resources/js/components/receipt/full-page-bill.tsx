import React, { useState } from 'react';
import { Printer, Receipt, X, FileText, CheckCircle2 } from 'lucide-react';
import { printFullPageBill } from '@/lib/print-full-page-bill';
import { printReceipt, ReceiptBranding, ReceiptOrder } from '@/lib/print-receipt';
import Barcode from './barcode';

interface FullPageBillProps {
    order: ReceiptOrder;
    branding?: ReceiptBranding;
    currency?: string;
    onClose?: () => void;
}

export default function FullPageBill({
    order,
    branding = {},
    currency = '৳',
    onClose,
}: FullPageBillProps) {
    const [printMode, setPrintMode] = useState<'full_page' | 'thermal'>('full_page');

    const brandName = (branding.brand_name || 'NOCTURNE RESTAURANT').toUpperCase();
    const brandLogo = branding.brand_logo || '/uploads/branding/logo.svg';
    const tagline = branding.tagline || 'CRAVINGS NEVER SLEEP';
    const address = branding.address || '889 Midnight Ave, Suite B, Downtown District';
    const phone = branding.phone || '+8801700000000';
    const email = branding.email || 'contact@restaurant.com';

    // Format date & time
    const rawDate = order.created_at ? new Date(order.created_at) : new Date();
    const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;

    const d = String(validDate.getDate()).padStart(2, '0');
    const m = String(validDate.getMonth() + 1).padStart(2, '0');
    const y = validDate.getFullYear();

    const rawHours = validDate.getHours();
    const ampm = rawHours >= 12 ? 'PM' : 'AM';
    const hours12 = rawHours % 12 || 12;
    const hr = String(hours12).padStart(2, '0');
    const min = String(validDate.getMinutes()).padStart(2, '0');
    const sec = String(validDate.getSeconds()).padStart(2, '0');

    const formattedDate = `${d}/${m}/${y}`;
    const formattedTime = `${hr}:${min}:${sec} ${ampm}`;

    const invoiceNum = order.order_number;
    const tableNum = order.table_number ? order.table_number : (order.order_type === 'dine_in' ? 'Table 1' : 'Takeaway Counter');
    const orderTypeLabel = order.order_type ? order.order_type.replace('_', ' ').toUpperCase() : 'DINE IN';
    const serverName = order.creator?.name || 'Cashier / Admin';
    const customerName = order.customer_name || 'Walk-in Customer';
    const customerPhone = order.customer_phone || 'N/A';

    const items = order.items && order.items.length > 0 ? order.items : [];
    const subtotal = order.subtotal || items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const tax = order.tax_amount || 0;
    const discount = order.discount_amount || 0;
    const total = order.total_amount || Math.max(0, subtotal + tax - discount);

    const paymentMethod = (order.payment_method || 'CASH').toUpperCase();
    const paymentStatus = (order.payment_status || 'PAID').toUpperCase();
    const transactionId = order.transaction_id || `TXN-${String(order.id || '000001').padStart(6, '0')}`;

    const formatPrice = (val: number) => {
        return `${currency}${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handlePrint = () => {
        if (printMode === 'full_page') {
            printFullPageBill(order, branding, currency);
        } else {
            printReceipt(order, branding, currency);
        }
    };

    return (
        <div className="relative mx-auto flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {/* Modal Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    title="Close Bill Preview"
                >
                    <X className="h-5 w-5" />
                </button>
            )}

            {/* Print Mode Switcher & Top Action */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Billing Completed Successfully
                        </h3>
                        <p className="text-xs text-slate-500">
                            Print official invoice for customer
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold dark:border-slate-800 dark:bg-slate-950">
                        <button
                            type="button"
                            onClick={() => setPrintMode('full_page')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                                printMode === 'full_page'
                                    ? 'bg-amber-500 text-slate-950 shadow'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                            }`}
                        >
                            <FileText className="h-3.5 w-3.5" /> Full Page (A4)
                        </button>
                        <button
                            type="button"
                            onClick={() => setPrintMode('thermal')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                                printMode === 'thermal'
                                    ? 'bg-amber-500 text-slate-950 shadow'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                            }`}
                        >
                            <Receipt className="h-3.5 w-3.5" /> Thermal (80mm)
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer"
                    >
                        <Printer className="h-4 w-4" /> Print Bill
                    </button>
                </div>
            </div>

            {/* Bill Paper Preview */}
            <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                {/* Header info */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start dark:border-slate-800">
                    <div className="space-y-1">
                        {brandLogo && (
                            <img
                                src={brandLogo}
                                alt={brandName}
                                className="max-h-10 w-auto object-contain"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                        )}
                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                            {brandName}
                        </h2>
                        <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                            {tagline}
                        </p>
                        <p className="text-xs text-slate-500 leading-snug">
                            {address}<br />
                            Phone: <strong className="text-slate-700 dark:text-slate-300">{phone}</strong> | Email: <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
                        </p>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                        <span className="inline-block rounded-lg bg-slate-900 px-3 py-1 text-xs font-black tracking-wide text-white uppercase dark:bg-amber-500 dark:text-slate-950">
                            Official Tax Bill
                        </span>
                        <div className="font-mono text-sm font-black text-slate-900 dark:text-slate-100">
                            {invoiceNum}
                        </div>
                        <div className="text-xs text-slate-500">
                            Date: <strong className="text-slate-700 dark:text-slate-300">{formattedDate}</strong> | Time: <strong className="text-slate-700 dark:text-slate-300">{formattedTime}</strong>
                        </div>
                        <div className="text-xs text-slate-500">
                            Cashier: <strong className="text-slate-700 dark:text-slate-300">{serverName}</strong>
                        </div>
                    </div>
                </div>

                {/* Meta details banner */}
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900 text-xs">
                    <div>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Order Type</span>
                        <span className="font-bold text-amber-500">{orderTypeLabel}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Table / Counter</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{tableNum}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Customer</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{customerName}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Phone</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{customerPhone}</span>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white dark:bg-slate-800">
                            <tr>
                                <th className="py-2.5 px-3 text-center">#</th>
                                <th className="py-2.5 px-3 font-bold">Dish Item</th>
                                <th className="py-2.5 px-3 text-center font-bold">Qty</th>
                                <th className="py-2.5 px-3 text-right font-bold">Rate</th>
                                <th className="py-2.5 px-3 text-right font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                            {items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                                        {item.item_name || item.name}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-slate-100">
                                        {item.quantity}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-slate-500">
                                        {formatPrice(item.unit_price)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                        {formatPrice(item.total_price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Table */}
                <div className="mt-4 flex justify-end">
                    <div className="w-64 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>VAT / Tax:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{formatPrice(tax)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-rose-500">
                                <span>Discount:</span>
                                <span className="font-semibold">-{formatPrice(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-900 dark:border-slate-800 dark:text-slate-100">
                            <span>Grand Total:</span>
                            <span className="text-amber-500">{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Badge */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <div>
                        <span>Payment Method: </span>
                        <strong className="uppercase">{paymentMethod}</strong>
                        {transactionId && <span className="ml-2 text-slate-400">({transactionId})</span>}
                    </div>
                    <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                        {paymentStatus}
                    </span>
                </div>

                {/* Barcode & Footer note */}
                <div className="mt-4 border-t border-slate-200 pt-3 text-center dark:border-slate-800">
                    <div className="flex justify-center pb-2">
                        <Barcode value={invoiceNum} height={32} />
                    </div>
                    <p className="text-[11px] text-slate-400">
                        Thank you for dining with us! Please keep this bill for your reference.
                    </p>
                </div>
            </div>
        </div>
    );
}
