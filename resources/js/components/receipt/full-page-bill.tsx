import React, { useState } from 'react';
import { Printer, Receipt, X, CheckCircle2, ChefHat, Copy, Loader2, Scissors } from 'lucide-react';
import { printReceipt, printKitchenKot, printBothReceipts, ReceiptBranding, ReceiptOrder } from '@/lib/print-receipt';
import Barcode from './barcode';

interface FullPageBillProps {
    order: ReceiptOrder;
    branding?: ReceiptBranding;
    currency?: string;
    onClose?: () => void;
    initialMode?: 'thermal' | 'full_page';
    initialTab?: 'both' | 'customer' | 'kitchen';
}

export default function FullPageBill({
    order,
    branding = {},
    currency = '৳',
    onClose,
    initialTab = 'both',
}: FullPageBillProps) {
    const [billTab, setBillTab] = useState<'both' | 'customer' | 'kitchen'>(initialTab);
    const [isPrinting, setIsPrinting] = useState(false);

    const brandName = (branding.brand_name || 'NOCTURNE RESTAURANT').toUpperCase();
    const brandLogo = branding.brand_logo || '/uploads/branding/logo.svg';
    const tagline = branding.tagline || 'CRAVINGS NEVER SLEEP';
    const address = branding.address || '889 Midnight Ave, Suite B, Downtown District';
    const phone = branding.phone || '+8801700000000';

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
    const tableNum = order.table_number
        ? (order.table_number.toLowerCase().startsWith('table') ? order.table_number.toUpperCase() : `TABLE ${order.table_number}`)
        : (order.order_type === 'dine_in' ? 'TABLE 1' : (order.order_type?.replace('_', ' ').toUpperCase() || 'TAKEAWAY'));
    const orderTypeLabel = order.order_type ? order.order_type.replace('_', ' ').toUpperCase() : 'DINE IN';
    const serverName = order.creator?.name || 'Cashier / Admin';
    const customerName = order.customer_name || 'Walk-in Customer';
    const customerPhone = order.customer_phone || 'N/A';

    const items = order.items && order.items.length > 0 ? order.items : [];
    const subtotal = order.subtotal || items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const tax = order.tax_amount || 0;
    const discount = order.discount_amount || 0;
    const discountNote = order.discount_note || '';
    const total = order.total_amount || Math.max(0, subtotal + tax - discount);
    const totalKitchenItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

    const paymentMethod = (order.payment_method || 'CASH').toUpperCase();
    const paymentStatus = (order.payment_status || 'PAID').toUpperCase();
    const transactionId = order.transaction_id || `TXN-${String(order.id || '000001').padStart(6, '0')}`;

    const formatPrice = (val: number) => {
        return `${currency}${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handlePrintCurrent = () => {
        if (isPrinting) return;
        setIsPrinting(true);
        if (billTab === 'kitchen') {
            printKitchenKot(order, branding);
        } else if (billTab === 'customer') {
            printReceipt(order, branding, currency);
        } else {
            printBothReceipts(order, branding, currency);
        }
        setTimeout(() => setIsPrinting(false), 2000);
    };

    const handlePrintBoth = () => {
        if (isPrinting) return;
        setIsPrinting(true);
        printBothReceipts(order, branding, currency);
        setTimeout(() => setIsPrinting(false), 4500);
    };

    /* ========================================================================= */
    /* Kitchen Order Ticket (KOT) Card JSX (Centered, Fixed 80mm format)         */
    /* ========================================================================= */
    const renderKitchenSlip = () => (
        <div className="w-full max-w-[340px] mx-auto bg-white p-4 text-slate-900 rounded-xl border border-slate-200 shadow-md font-sans leading-tight text-left">
            <div className="text-center text-[11px] font-extrabold tracking-wider text-slate-700 uppercase mb-1">
                {brandName}
            </div>

            {/* Title Badge */}
            <div className="text-center rounded-lg bg-slate-950 text-white p-2 mb-2">
                <span className="block text-xs font-black tracking-widest uppercase">
                    KITCHEN ORDER TICKET (KOT)
                </span>
            </div>

            {/* Large Table & Type Display */}
            <div className="rounded-xl border-2 border-slate-950 bg-slate-50 p-2.5 text-center mb-2.5">
                <span className="block text-lg font-black tracking-tight text-slate-950 uppercase">
                    {tableNum}
                </span>
                <span className="block text-[11px] font-bold text-slate-600 uppercase mt-0.5">
                    [{orderTypeLabel}]
                </span>
            </div>

            {/* KOT Meta Info */}
            <div className="text-[11px] space-y-1 text-slate-800">
                <div className="flex justify-between">
                    <span><strong>KOT:</strong> #{invoiceNum}</span>
                    <span><strong>SERVER:</strong> {serverName}</span>
                </div>
                <div className="flex justify-between">
                    <span><strong>TIME:</strong> {formattedTime}</span>
                    <span><strong>DATE:</strong> {formattedDate}</span>
                </div>
            </div>

            {/* Special Chef Instructions */}
            {order.notes && (
                <div className="mt-2.5 rounded-lg border-2 border-slate-950 bg-amber-50/50 p-2 text-slate-900">
                    <span className="block text-[10px] font-black text-amber-800 uppercase tracking-wide">
                        *** CHEF INSTRUCTIONS / NOTES ***
                    </span>
                    <span className="block text-xs font-black mt-0.5 uppercase">
                        {order.notes}
                    </span>
                </div>
            )}

            {/* Dashed Separator */}
            <div className="border-t-2 border-dashed border-slate-900 my-2.5" />

            {/* Kitchen Items with Kitchen Codes */}
            <div className="space-y-2 py-0.5">
                <div className="flex justify-between text-[10.5px] font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-slate-200">
                    <span className="w-12">Qty</span>
                    <span className="flex-1">Item & Kitchen Code</span>
                </div>
                {items.map((item, idx) => {
                    const itemName = item.item_name || item.name || (item as any).menu_item?.name || 'Item';
                    const kitchenCode = item.kitchen_code || (item as any).menu_item?.kitchen_code;
                    return (
                        <div key={idx} className="flex items-start gap-2 py-1 border-b border-dashed border-slate-200 last:border-0">
                            <span className="inline-block shrink-0 rounded bg-slate-950 px-1.5 py-0.5 text-xs font-mono font-black text-white">
                                [{item.quantity}x]
                            </span>
                            <div className="flex-1">
                                <span className="block text-xs font-black text-slate-950 leading-tight">
                                    {itemName}
                                </span>
                                {kitchenCode && (
                                    <div className="mt-1">
                                        <span className="inline-block rounded border border-slate-900 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-950 uppercase tracking-wider">
                                            CODE: {kitchenCode}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dashed Separator */}
            <div className="border-t-2 border-dashed border-slate-900 my-2.5" />

            {/* Total Count */}
            <div className="flex justify-between items-center text-xs font-black text-slate-950">
                <span>TOTAL KITCHEN ITEMS:</span>
                <span className="text-sm">{totalKitchenItems}</span>
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-slate-400 my-2.5" />

            <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                *** KITCHEN PRODUCTION COPY ***
            </div>
        </div>
    );

    /* ========================================================================= */
    /* Customer Money Receipt Card JSX (Centered, Fixed 80mm format)             */
    /* ========================================================================= */
    const renderCustomerSlip = () => (
        <div className="w-full max-w-[340px] mx-auto bg-white p-4 text-slate-900 rounded-xl border border-slate-200 shadow-md font-sans leading-tight text-left">
            {/* Brand Logo */}
            {brandLogo && (
                <div className="flex justify-center pb-1">
                    <img
                        src={brandLogo}
                        alt={brandName}
                        className="max-h-11 w-auto object-contain filter grayscale contrast-125"
                        onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                        }}
                    />
                </div>
            )}

            {/* Restaurant Header */}
            <div className="text-center space-y-0.5">
                <h2 className="text-[15px] font-black tracking-wider uppercase leading-snug text-slate-950">
                    {brandName}
                </h2>
                {tagline && (
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        {tagline}
                    </p>
                )}
                <p className="text-[10px] uppercase text-slate-600 leading-tight">
                    {address}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-700 leading-tight">
                    PHONE: {phone}
                </p>
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-slate-300 my-2.5" />

            {/* Official Tax Bill Badge & Meta Info */}
            <div className="space-y-1 text-center">
                <span className="inline-block rounded-md bg-slate-900 px-2 py-0.5 text-[9.5px] font-black tracking-wider text-white uppercase">
                    Official Tax Bill
                </span>
                <div className="text-[11px] font-bold text-slate-800 pt-0.5">
                    {formattedDate} • {formattedTime}
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 text-slate-700">
                    <span><strong className="text-slate-900">RECEIPT:</strong> #{invoiceNum}</span>
                    <span><strong className="text-slate-900">TABLE:</strong> {tableNum}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-700">
                    <span><strong className="text-slate-900">TYPE:</strong> {orderTypeLabel}</span>
                    <span><strong className="text-slate-900">CASHIER:</strong> {serverName}</span>
                </div>
                {customerName && customerName !== 'Walk-in Customer' && (
                    <div className="text-left text-[11px] text-slate-700 pt-0.5">
                        <strong className="text-slate-900">CUSTOMER:</strong> {customerName} {customerPhone !== 'N/A' ? `(${customerPhone})` : ''}
                    </div>
                )}
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-slate-300 my-2.5" />

            {/* Items List */}
            <div className="space-y-1.5 py-0.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-0.5 border-b border-slate-100">
                    <span>Qty & Item</span>
                    <span>Total</span>
                </div>
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[11.5px] leading-tight">
                        <div className="pr-2 break-words">
                            <span className="font-bold text-slate-950 mr-1">{item.quantity}x</span>
                            <span className="font-medium text-slate-800">{item.item_name || item.name}</span>
                            {item.quantity > 1 && (
                                <div className="text-[10px] text-slate-500">
                                    @ {formatPrice(item.unit_price)} each
                                </div>
                            )}
                        </div>
                        <span className="font-bold text-slate-950 shrink-0 pt-0.5">
                            {formatPrice(item.total_price)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-slate-300 my-2.5" />

            {/* Totals Breakdown */}
            <div className="space-y-1 text-[11.5px]">
                <div className="flex justify-between text-slate-700">
                    <span>SUBTOTAL:</span>
                    <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                    <span>TAX / VAT:</span>
                    <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-rose-700 font-semibold">
                        <span>DISCOUNT{discountNote ? ` (${discountNote})` : ''}:</span>
                        <span>-{formatPrice(discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-[14px] font-black text-slate-950 pt-1 border-t border-slate-300">
                    <span>TOTAL:</span>
                    <span className="text-amber-600">{formatPrice(total)}</span>
                </div>
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-slate-300 my-2.5" />

            {/* Payment & Transaction Info */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-[11px] border border-slate-200">
                <div>
                    <span className="text-slate-500 text-[10px]">PAYMENT: </span>
                    <strong className="uppercase font-bold text-slate-900">{paymentMethod}</strong>
                    {transactionId && <span className="block text-[9.5px] text-slate-500">{transactionId}</span>}
                </div>
                <span className="rounded bg-emerald-600 px-2 py-0.5 text-[9.5px] font-black uppercase text-white">
                    {paymentStatus}
                </span>
            </div>

            {/* Footer Greeting */}
            <div className="pt-3 text-center text-[10.5px] text-slate-600 space-y-0.5">
                <div className="font-bold tracking-wide">THANK YOU FOR DINING WITH US!</div>
                <div className="text-[9.5px] text-slate-400">PLEASE COME AGAIN</div>
            </div>

            {/* Barcode */}
            <div className="pt-2 flex justify-center">
                <Barcode value={invoiceNum} height={34} />
            </div>
        </div>
    );

    return (
        <div
            className="relative mx-auto my-auto flex w-full max-w-[460px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
        >
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

            {/* Bill Selector Tabs (Both Slips vs Customer Bill vs Kitchen KOT) */}
            <div className="mb-3 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold dark:border-slate-800 dark:bg-slate-950">
                <button
                    type="button"
                    onClick={() => setBillTab('both')}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 transition-all cursor-pointer ${
                        billTab === 'both'
                            ? 'bg-amber-500 text-slate-950 shadow font-black'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Both (2 Slips)</span>
                </button>

                <button
                    type="button"
                    onClick={() => setBillTab('kitchen')}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 transition-all cursor-pointer ${
                        billTab === 'kitchen'
                            ? 'bg-amber-500 text-slate-950 shadow font-black'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                >
                    <ChefHat className="h-3.5 w-3.5" />
                    <span>Kitchen KOT</span>
                </button>

                <button
                    type="button"
                    onClick={() => setBillTab('customer')}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 transition-all cursor-pointer ${
                        billTab === 'customer'
                            ? 'bg-amber-500 text-slate-950 shadow font-black'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Customer Bill</span>
                </button>
            </div>

            {/* Top Action Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                            {billTab === 'both' ? 'Both 80mm Slips Ready' : billTab === 'kitchen' ? 'Kitchen KOT Ready' : 'Customer Bill Ready'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            {billTab === 'both' ? 'Prints 2 separate slips: 1 for KOT & 1 for Customer' : billTab === 'kitchen' ? 'Includes Dish Kitchen Codes' : 'POS Thermal Slip (80mm)'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={handlePrintCurrent}
                        disabled={isPrinting}
                        className="flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title={billTab === 'both' ? 'Print both slips (2 separate print jobs)' : billTab === 'kitchen' ? 'Print Kitchen KOT slip' : 'Print Customer Bill slip'}
                    >
                        {isPrinting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                        <span>Print {billTab === 'both' ? 'Both (2 Slips)' : billTab === 'kitchen' ? 'KOT' : 'Bill'}</span>
                    </button>

                    {billTab !== 'both' && (
                        <button
                            type="button"
                            onClick={handlePrintBoth}
                            disabled={isPrinting}
                            className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Print both slips (2 separate slips: KOT + Customer)"
                        >
                            {isPrinting ? <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" /> : <Copy className="h-3.5 w-3.5 text-amber-500" />}
                            <span>Print Both (2 Slips)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bill Paper Preview Container Centered in Modal */}
            <div className="w-full min-h-[420px] max-h-[72vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-100/80 p-4 dark:border-slate-800 dark:bg-slate-950/90 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-center my-auto py-2 gap-4">
                    {billTab === 'both' ? (
                        <>
                            {/* 1. Kitchen KOT Slip */}
                            <div className="w-full flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full mb-2 border border-amber-500/20">
                                    Slip 1: Kitchen Order Ticket (KOT)
                                </span>
                                {renderKitchenSlip()}
                            </div>

                            {/* Middle Perforation / Cut Separator */}
                            <div className="w-full max-w-[340px] mx-auto flex items-center justify-center gap-2 py-1 text-slate-400">
                                <div className="flex-1 border-t-2 border-dashed border-slate-300 dark:border-slate-700" />
                                <div className="flex items-center gap-1 rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300 shadow-sm">
                                    <Scissors className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Cut / Separator (2 Separate Slips)</span>
                                </div>
                                <div className="flex-1 border-t-2 border-dashed border-slate-300 dark:border-slate-700" />
                            </div>

                            {/* 2. Customer Receipt Slip */}
                            <div className="w-full flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mb-2 border border-emerald-500/20">
                                    Slip 2: Customer Money Receipt
                                </span>
                                {renderCustomerSlip()}
                            </div>
                        </>
                    ) : billTab === 'kitchen' ? (
                        renderKitchenSlip()
                    ) : (
                        renderCustomerSlip()
                    )}
                </div>
            </div>
        </div>
    );
}
