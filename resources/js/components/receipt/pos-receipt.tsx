import React from 'react';
import Barcode from './barcode';
import { Printer, X } from 'lucide-react';
import { printReceipt, ReceiptBranding, ReceiptOrder } from '@/lib/print-receipt';

interface PosReceiptProps {
    order: ReceiptOrder;
    branding?: ReceiptBranding;
    currency?: string;
    onClose?: () => void;
    autoPrint?: boolean;
}

export default function PosReceipt({
    order,
    branding = {},
    currency = '৳',
    onClose,
}: PosReceiptProps) {
    const brandName = (branding.brand_name || 'RESTAURANT').toUpperCase();
    const brandLogo = branding.brand_logo || '/uploads/branding/logo.svg';
    const address = branding.address || '123 Culinary Avenue, Downtown District';
    const phone = branding.phone || '(555) 123-4567';
    const emailOrWebsite = branding.email ? branding.email.toUpperCase() : 'WWW.RESTAURANT.COM';

    // Format date and time in AM/PM format
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

    const formattedDate = `${d}/${m}/${y} ${hr}:${min} ${ampm}`;
    const formattedTime = `${hr}:${min}:${sec} ${ampm}`;

    const receiptNum = order.order_number.replace(/^INV-/, '#R-');
    const tableNum = order.table_number
        ? order.table_number.replace(/^Table\s*/i, '')
        : (order.order_type === 'dine_in' ? '12' : (order.order_type?.toUpperCase() || 'TAKEAWAY'));
    const serverName = (order.creator?.name || 'MARIA G.').toUpperCase();
    const guestsCount = order.customer_name ? order.customer_name.toUpperCase() : '2';

    const items = order.items && order.items.length > 0 ? order.items : [];
    const subtotal = order.subtotal || items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const tax = order.tax_amount || 0;
    const discount = order.discount_amount || 0;
    const total = order.total_amount || Math.max(0, subtotal + tax - discount);

    const paymentMethod = (order.payment_method || 'CASH').toUpperCase();
    const transactionId = order.transaction_id || `REF: ${String(order.id || '').padStart(8, '0')}`;
    const cardMask = paymentMethod === 'CARD' ? '•••• 9981' : (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD' ? 'MOBILE WALLET' : 'CASH');

    const barcodeValue = String(order.order_number || '254720250930').replace(/[^0-9A-Z]/g, '');

    const formatPrice = (val: number) => {
        return `${currency}${Number(val || 0).toFixed(2)}`;
    };

    const handlePrint = () => {
        printReceipt(order, branding, currency);
    };

    return (
        <div className="relative mx-auto flex w-full max-w-[340px] flex-col rounded-xl border border-slate-200 bg-[#fafafa] p-5 font-mono text-[12px] leading-tight text-black shadow-2xl dark:border-slate-800 dark:bg-white dark:text-black">
            {/* Modal Close Icon if onClose provided */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-800 print:hidden cursor-pointer"
                    title="Close Receipt"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            {/* Receipt Content Container */}
            <div id="pos-money-receipt" className="space-y-2.5">
                {/* Brand Logo from AppSettings */}
                {brandLogo && (
                    <div className="flex justify-center pb-1">
                        <img
                            src={brandLogo}
                            alt={brandName}
                            className="max-h-12 w-auto object-contain filter grayscale contrast-125"
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Restaurant Header */}
                <div className="text-center space-y-0.5">
                    <h2 className="text-[15px] font-black tracking-wider uppercase leading-snug">
                        {brandName}
                    </h2>
                    {branding.tagline && (
                        <p className="text-[9.5px] font-bold text-amber-600 uppercase tracking-wider">
                            {branding.tagline}
                        </p>
                    )}
                    <p className="text-[10.5px] uppercase text-slate-800 leading-tight">
                        {address}
                    </p>
                    <p className="text-[10.5px] uppercase text-slate-800 leading-tight">
                        PHONE: {phone}
                    </p>
                    <p className="text-[10.5px] uppercase text-slate-800 leading-tight">
                        {emailOrWebsite}
                    </p>
                </div>

                {/* Separator 1 */}
                <div className="border-t border-black/80 my-2" />

                {/* Meta Header (Date, Receipt #, Table, Server, Guests) */}
                <div className="space-y-1 text-[11px]">
                    <div className="text-center font-bold tracking-wide">
                        {formattedDate}
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-bold">RECEIPT:</span> {receiptNum}
                        </div>
                        <div>
                            <span className="font-bold">TABLE:</span> {tableNum}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-bold">SERVER:</span> {serverName}
                        </div>
                        <div>
                            <span className="font-bold">GUESTS:</span> {guestsCount}
                        </div>
                    </div>
                </div>

                {/* Separator 2 */}
                <div className="border-t border-black/80 my-2" />

                {/* Items List */}
                <div className="space-y-1.5 py-0.5">
                    {items.map((item, idx) => {
                        const name = (item.item_name || item.name || 'Item').toUpperCase();
                        const qtyPrefix = item.quantity > 1 ? `${item.quantity}X ` : '';
                        return (
                            <div key={idx} className="flex justify-between items-baseline text-[11.5px]">
                                <span className="font-medium pr-2 break-words">
                                    {qtyPrefix}{name}
                                </span>
                                <span className="font-bold shrink-0">
                                    {formatPrice(item.total_price)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Separator 3 */}
                <div className="border-t border-black/80 my-2" />

                {/* Totals Breakdown */}
                <div className="space-y-1 text-[11.5px]">
                    <div className="flex justify-between">
                        <span>SUBTOTAL:</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>TAX:</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-rose-700">
                            <span>DISCOUNT:</span>
                            <span>-{formatPrice(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[14px] font-black pt-1">
                        <span>TOTAL:</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                {/* Separator 4 */}
                <div className="border-t border-black/80 my-2" />

                {/* Payment & Transaction Info */}
                <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                        <span>{paymentMethod === 'CARD' ? 'CARD:' : 'METHOD:'}</span>
                        <span className="font-bold">{cardMask}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>TYPE:</span>
                        <span>{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>ENTRY:</span>
                        <span>{paymentMethod === 'CARD' ? 'CONTACTLESS' : 'POS TERMINAL'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>TIME:</span>
                        <span>{formattedTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>REF:</span>
                        <span>{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>STATUS:</span>
                        <span className="font-bold">APPROVED</span>
                    </div>
                </div>

                {/* Footer Greeting */}
                <div className="space-y-1 pt-2 text-center text-[10.5px]">
                    <div>TIP IS NOT INCLUDED.</div>
                    <div>PLEASE COME AGAIN!</div>
                    <div className="pt-1.5 font-bold tracking-wider text-[11px]">
                        THANK YOU FOR DINING WITH US!
                    </div>
                </div>

                {/* Vector Barcode */}
                <div className="pt-2">
                    <Barcode value={barcodeValue} height={42} />
                </div>
            </div>

            {/* Print & Action Buttons (Hidden on Print) */}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 print:hidden">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-300 dark:text-slate-800 cursor-pointer"
                    >
                        Close
                    </button>
                )}
                <button
                    type="button"
                    onClick={handlePrint}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 px-3 text-xs font-black text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-95 cursor-pointer"
                >
                    <Printer className="h-4 w-4" /> Print Receipt
                </button>
            </div>
        </div>
    );
}
