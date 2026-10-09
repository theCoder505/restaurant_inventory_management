export interface ReceiptItem {
    item_name?: string;
    name?: string;
    kitchen_code?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface ReceiptOrder {
    id: number | string;
    order_number: string;
    order_type?: string;
    table_number?: string;
    customer_name?: string;
    customer_phone?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount?: number;
    discount_note?: string;
    total_amount: number;
    payment_method: string;
    payment_status?: string;
    transaction_id?: string;
    notes?: string;
    created_at?: string;
    creator?: {
        name?: string;
    };
    items?: ReceiptItem[];
}

export interface ReceiptBranding {
    brand_name?: string;
    brand_logo?: string;
    brand_icon?: string;
    address?: string;
    phone?: string;
    email?: string;
    tagline?: string;
    default_currency?: string;
}

const CODE39_PATTERNS: Record<string, string> = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
    '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
};

function generateBarcodeSvg(value: string): string {
    const raw = (value || '00000000').toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '');
    const cleanValue = raw.length > 0 ? raw : '00000000';
    const encodedString = `*${cleanValue}*`;

    let currentX = 0;
    const narrowWidth = 1.4;
    const wideWidth = 3.2;
    const height = 44;
    let rects = '';

    for (let c = 0; c < encodedString.length; c++) {
        const char = encodedString[c];
        const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['0'];

        for (let i = 0; i < 9; i++) {
            const isBar = i % 2 === 0;
            const isWide = pattern[i] === '1';
            const width = isWide ? wideWidth : narrowWidth;

            if (isBar) {
                rects += `<rect x="${currentX.toFixed(1)}" y="0" width="${width.toFixed(1)}" height="${height}" fill="#000" />`;
            }
            currentX += width;
        }
        currentX += narrowWidth;
    }

    const totalWidth = Math.max(currentX, 100);

    return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 10px;">
            <svg viewBox="0 0 ${totalWidth} ${height}" style="width: 100%; max-width: 230px; height: ${height}px;" shape-rendering="crispEdges">
                ${rects}
            </svg>
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; margin-top: 3px; font-family: 'Courier New', Courier, monospace;">${cleanValue}</div>
        </div>
    `;
}

function formatAmount(amount: number, currency: string = '$'): string {
    return `${currency}${Number(amount || 0).toFixed(2)}`;
}

function formatDate(dateStr?: string): { formattedDate: string; formattedTime: string } {
    const date = dateStr ? new Date(dateStr) : new Date();
    const validDate = isNaN(date.getTime()) ? new Date() : date;

    const d = String(validDate.getDate()).padStart(2, '0');
    const m = String(validDate.getMonth() + 1).padStart(2, '0');
    const y = validDate.getFullYear();

    const rawHours = validDate.getHours();
    const ampm = rawHours >= 12 ? 'PM' : 'AM';
    const hours12 = rawHours % 12 || 12;
    const hr = String(hours12).padStart(2, '0');
    const min = String(validDate.getMinutes()).padStart(2, '0');
    const sec = String(validDate.getSeconds()).padStart(2, '0');

    return {
        formattedDate: `${d}/${m}/${y} ${hr}:${min} ${ampm}`,
        formattedTime: `${hr}:${min}:${sec} ${ampm}`,
    };
}

export function generateReceiptHtml(order: ReceiptOrder, branding: ReceiptBranding = {}, currency: string = '৳'): string {
    const brandName = (branding.brand_name || 'NOCTURNE RESTAURANT').toUpperCase();
    const brandLogo = branding.brand_logo || '/uploads/branding/logo.svg';
    const tagline = (branding.tagline || 'CRAVINGS NEVER SLEEP').toUpperCase();
    const address = (branding.address || '889 Midnight Ave, Suite B, Downtown District').toUpperCase();
    const phone = branding.phone || '+8801700000000';

    const { formattedDate, formattedTime } = formatDate(order.created_at);

    // Formatted receipt number
    const receiptNum = order.order_number;
    const tableNum = order.table_number
        ? order.table_number.replace(/^Table\s*/i, '')
        : (order.order_type === 'dine_in' ? 'Table 1' : (order.order_type?.toUpperCase() || 'TAKEAWAY'));
    const orderTypeLabel = order.order_type ? order.order_type.replace('_', ' ').toUpperCase() : 'DINE IN';
    const serverName = (order.creator?.name || 'Cashier / Admin').toUpperCase();
    const customerName = order.customer_name ? order.customer_name.toUpperCase() : null;
    const customerPhone = order.customer_phone || null;

    const items = order.items && order.items.length > 0 ? order.items : [];
    const subtotal = order.subtotal || items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const tax = order.tax_amount || 0;
    const discount = order.discount_amount || 0;
    const total = order.total_amount || Math.max(0, subtotal + tax - discount);

    const paymentMethod = (order.payment_method || 'CASH').toUpperCase();
    const transactionId = order.transaction_id || `TXN-${String(order.id || '000001').padStart(6, '0')}`;
    const cardMask = paymentMethod === 'CARD' ? '•••• 9981' : (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD' ? 'MOBILE WALLET' : 'CASH');

    const barcodeValue = String(order.order_number || '254720250930').replace(/[^0-9A-Z]/g, '');

    const itemsRowsHtml = items.map((item) => {
        const name = (item.item_name || item.name || 'ITEM').toUpperCase();
        const qtyPrefix = item.quantity > 1 ? `${item.quantity}X ` : '1X ';
        const lineTotal = formatAmount(item.total_price, currency);
        const rateNote = item.quantity > 1 ? `<div style="font-size: 9.5px; color: #555;">@ ${formatAmount(item.unit_price, currency)} each</div>` : '';
        return `
            <tr>
                <td style="padding: 2.5px 0; text-align: left; vertical-align: top;">
                    <div style="font-weight: 600;">${qtyPrefix}${name}</div>
                    ${rateNote}
                </td>
                <td style="padding: 2.5px 0; text-align: right; font-weight: 700; white-space: nowrap; vertical-align: top;">${lineTotal}</td>
            </tr>
        `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt - ${order.order_number}</title>
    <style>
        @page {
            size: auto;
            margin: 0;
        }
        @media print {
            @page {
                size: auto;
                margin: 0;
            }
            html, body {
                width: 100% !important;
                max-width: 72mm !important;
                margin: 0 auto !important;
                padding: 1mm !important;
                background: #fff !important;
                color: #000 !important;
            }
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            margin: 0;
            padding: 12px 14px;
            width: 100%;
            max-width: 320px;
            margin-left: auto;
            margin-right: auto;
            background-color: #ffffff;
            color: #000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif, monospace;
            font-size: 11px;
            line-height: 1.3;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        .uppercase { text-transform: uppercase; }

        .logo-wrap {
            text-align: center;
            margin-bottom: 6px;
        }
        .logo-img {
            max-height: 44px;
            max-width: 120px;
            object-fit: contain;
            filter: grayscale(100%) contrast(150%);
            margin: 0 auto;
            display: block;
        }

        .header-title {
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin: 2px 0;
            line-height: 1.2;
        }
        .header-tagline {
            font-size: 9.5px;
            font-weight: 700;
            color: #333;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .header-subtitle {
            font-size: 9.5px;
            margin: 1px 0;
            color: #222;
        }

        .divider {
            border-top: 1px dashed #333333;
            margin: 7px 0;
            width: 100%;
        }

        .meta-table, .items-table, .totals-table, .payment-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-table td {
            padding: 1.5px 0;
            font-size: 10.5px;
        }

        .items-table td {
            font-size: 11px;
        }

        .totals-table td {
            padding: 2px 0;
            font-size: 11px;
        }

        .totals-table .total-row td {
            padding-top: 3px;
            font-size: 13.5px;
            font-weight: 900;
        }

        .payment-table td {
            padding: 1.5px 0;
            font-size: 10px;
        }

        .footer-notes {
            margin-top: 8px;
            font-size: 10px;
            text-align: center;
            line-height: 1.35;
        }

        .footer-thanks {
            margin-top: 4px;
            font-size: 10.5px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- Top Logo from AppSettings -->
    ${brandLogo ? `
    <div class="logo-wrap">
        <img src="${brandLogo}" class="logo-img" alt="Logo" onerror="this.style.display='none'" />
    </div>` : ''}

    <!-- Restaurant Header -->
    <div class="text-center">
        <div class="header-title">${brandName}</div>
        ${tagline ? `<div class="header-tagline">${tagline}</div>` : ''}
        <div class="header-subtitle">${address.replace(/\n/g, '<br/>')}</div>
        <div class="header-subtitle">PHONE: ${phone}</div>
    </div>

    <!-- Divider 1 -->
    <div class="divider"></div>

    <!-- Official Tax Bill Badge & Meta Details -->
    <div style="text-align: center; margin-bottom: 3px;">
        <span style="display: inline-block; background: #000; color: #fff; font-size: 9px; font-weight: 900; padding: 1.5px 6px; border-radius: 3px; text-transform: uppercase;">Official Tax Bill</span>
    </div>
    <div class="text-center" style="font-size: 10.5px; font-weight: 700; margin-bottom: 3px;">
        ${formattedDate} ${formattedTime}
    </div>
    <table class="meta-table">
        <tr>
            <td class="text-left"><span class="font-bold">RECEIPT:</span> ${receiptNum}</td>
            <td class="text-right"><span class="font-bold">TABLE:</span> ${tableNum}</td>
        </tr>
        <tr>
            <td class="text-left"><span class="font-bold">TYPE:</span> ${orderTypeLabel}</td>
            <td class="text-right"><span class="font-bold">SERVER:</span> ${serverName}</td>
        </tr>
        ${customerName ? `
        <tr>
            <td colspan="2" class="text-left"><span class="font-bold">CUSTOMER:</span> ${customerName} ${customerPhone ? `(${customerPhone})` : ''}</td>
        </tr>` : ''}
    </table>

    <!-- Divider 2 -->
    <div class="divider"></div>

    <!-- Items List -->
    <table class="items-table">
        <thead>
            <tr style="border-bottom: 1px solid #ddd; font-size: 9.5px; color: #555;">
                <th style="text-align: left; padding-bottom: 2px; font-weight: 700;">QTY & DESCRIPTION</th>
                <th style="text-align: right; padding-bottom: 2px; font-weight: 700;">PRICE</th>
            </tr>
        </thead>
        <tbody>
            ${itemsRowsHtml}
        </tbody>
    </table>

    <!-- Divider 3 -->
    <div class="divider"></div>

    <!-- Totals -->
    <table class="totals-table">
        <tr>
            <td class="text-left">SUBTOTAL:</td>
            <td class="text-right">${formatAmount(subtotal, currency)}</td>
        </tr>
        <tr>
            <td class="text-left">TAX / VAT:</td>
            <td class="text-right">${formatAmount(tax, currency)}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
            <td class="text-left">DISCOUNT${order.discount_note ? ` (${order.discount_note.toUpperCase()})` : ''}:</td>
            <td class="text-right">-${formatAmount(discount, currency)}</td>
        </tr>` : ''}
        <tr class="total-row font-black">
            <td class="text-left">TOTAL:</td>
            <td class="text-right">${formatAmount(total, currency)}</td>
        </tr>
    </table>

    <!-- Divider 4 -->
    <div class="divider"></div>

    <!-- Payment & Card Details -->
    <table class="payment-table">
        <tr>
            <td class="text-left">${paymentMethod === 'CARD' ? 'CARD:' : 'METHOD:'}</td>
            <td class="text-right font-bold">${cardMask}</td>
        </tr>
        <tr>
            <td class="text-left">TYPE:</td>
            <td class="text-right">${paymentMethod}</td>
        </tr>
        <tr>
            <td class="text-left">TIME:</td>
            <td class="text-right">${formattedTime}</td>
        </tr>
        <tr>
            <td class="text-left">REF:</td>
            <td class="text-right">${transactionId}</td>
        </tr>
        <tr>
            <td class="text-left">STATUS:</td>
            <td class="text-right font-bold">APPROVED</td>
        </tr>
    </table>

    <!-- Footer Messages -->
    <div class="footer-notes">
        <div>TIP IS NOT INCLUDED.</div>
        <div>PLEASE COME AGAIN!</div>
    </div>

    <div class="footer-thanks">
        THANK YOU FOR DINING WITH US!
    </div>

    <!-- Barcode -->
    ${generateBarcodeSvg(barcodeValue)}
</body>
</html>
    `;
}

/**
 * Generate Kitchen Order Ticket (KOT) HTML for kitchen chefs with Kitchen Codes.
 */
export function generateKitchenKotHtml(order: ReceiptOrder, branding: ReceiptBranding = {}): string {
    const brandName = (branding.brand_name || 'NOCTURNE RESTAURANT').toUpperCase();
    const { formattedDate, formattedTime } = formatDate(order.created_at);

    const tableNum = order.table_number
        ? (order.table_number.toLowerCase().startsWith('table') ? order.table_number.toUpperCase() : `TABLE ${order.table_number}`)
        : (order.order_type === 'dine_in' ? 'TABLE 1' : (order.order_type?.replace('_', ' ').toUpperCase() || 'TAKEAWAY'));
    const orderTypeLabel = order.order_type ? order.order_type.replace('_', ' ').toUpperCase() : 'DINE IN';
    const serverName = (order.creator?.name || 'Cashier / Admin').toUpperCase();

    const items = order.items && order.items.length > 0 ? order.items : [];
    const totalItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const itemsRowsHtml = items.map((item) => {
        const name = (item.item_name || item.name || (item as any).menu_item?.name || 'ITEM').toUpperCase();
        const kitchenCode = (item.kitchen_code || (item as any).menu_item?.kitchen_code || '').toUpperCase();
        return `
            <tr style="border-bottom: 1.5px dashed #000; page-break-inside: avoid; break-inside: avoid;">
                <td style="padding: 6px 0; text-align: left; vertical-align: top; width: 44px; white-space: nowrap;">
                    <span style="display: inline-block; background: #000; color: #fff; font-size: 13px; font-weight: 900; padding: 2px 5px; border-radius: 3px; font-family: monospace;">
                        ${item.quantity}X
                    </span>
                </td>
                <td style="padding: 6px 0 6px 6px; text-align: left; vertical-align: top; word-break: break-word;">
                    <div style="font-size: 14px; font-weight: 900; line-height: 1.25; color: #000;">${name}</div>
                    ${kitchenCode ? `
                    <div style="margin-top: 3px;">
                        <span style="font-size: 11px; font-weight: 900; font-family: monospace; border: 1.5px solid #000; background: #fff; padding: 1px 5px; border-radius: 2px; display: inline-block; letter-spacing: 0.5px;">
                            CODE: ${kitchenCode}
                        </span>
                    </div>` : ''}
                </td>
            </tr>
        `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kitchen KOT - ${order.order_number}</title>
    <style>
        @page {
            size: auto;
            margin: 0;
        }
        @media print {
            @page {
                size: auto;
                margin: 0;
            }
            html, body {
                width: 100% !important;
                max-width: 72mm !important;
                margin: 0 auto !important;
                padding: 1mm !important;
                background: #fff !important;
                color: #000 !important;
            }
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            margin: 0 auto;
            padding: 8px 10px;
            width: 100%;
            max-width: 300px;
            background-color: #ffffff;
            color: #000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif, monospace;
            font-size: 11px;
            line-height: 1.3;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
    </style>
</head>
<body>
    <div class="text-center" style="font-size: 11px; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 2px;">
        ${brandName}
    </div>

    <!-- KOT Title Banner -->
    <div style="text-align: center; background: #000; color: #fff; padding: 4px; border-radius: 3px; margin: 3px 0 6px 0; page-break-inside: avoid; break-inside: avoid;">
        <div style="font-size: 13px; font-weight: 900; letter-spacing: 1px;">KITCHEN ORDER TICKET (KOT)</div>
    </div>

    <!-- Prominent Table & Type Header -->
    <div style="border: 2px solid #000; padding: 6px 4px; border-radius: 4px; margin-bottom: 6px; text-align: center; background: #fff; page-break-inside: avoid; break-inside: avoid;">
        <div style="font-size: 20px; font-weight: 900; line-height: 1.1; letter-spacing: 0.5px;">${tableNum.toUpperCase()}</div>
        <div style="font-size: 11.5px; font-weight: 900; margin-top: 2px;">[${orderTypeLabel}]</div>
    </div>

    <!-- Meta Details Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 11px; line-height: 1.4; page-break-inside: avoid; break-inside: avoid;">
        <tr>
            <td style="text-align: left; font-weight: 700; padding: 1px 0;">KOT ORDER: #${order.order_number}</td>
            <td style="text-align: right; font-weight: 700; padding: 1px 0;">SERVER: ${serverName}</td>
        </tr>
        <tr>
            <td style="text-align: left; padding: 1px 0;">TIME: ${formattedTime}</td>
            <td style="text-align: right; padding: 1px 0;">DATE: ${formattedDate.split(' ')[0]}</td>
        </tr>
    </table>

    <!-- Chef Instructions / Notes -->
    ${order.notes ? `
    <div style="margin: 6px 0; border: 2px solid #000; background: #fff; padding: 6px; border-radius: 3px; text-align: left; page-break-inside: avoid; break-inside: avoid;">
        <div style="font-size: 10px; font-weight: 900; letter-spacing: 0.5px;">*** CHEF INSTRUCTIONS / NOTES ***</div>
        <div style="font-size: 12px; font-weight: 900; margin-top: 2px;">${order.notes.toUpperCase()}</div>
    </div>` : ''}

    <div style="border-top: 1.5px dashed #000; margin: 6px 0;"></div>

    <!-- Kitchen Items Table -->
    <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        <thead>
            <tr style="border-bottom: 2px solid #000; font-size: 11px; font-weight: 900;">
                <th style="text-align: left; padding: 4px 0; width: 44px;">QTY</th>
                <th style="text-align: left; padding: 4px 0 4px 6px;">ITEM & KITCHEN CODE</th>
            </tr>
        </thead>
        <tbody>
            ${itemsRowsHtml}
        </tbody>
    </table>

    <div style="border-top: 1.5px dashed #000; margin: 6px 0;"></div>

    <!-- Total Item Count Table -->
    <table style="width: 100%; border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 6px 0; font-size: 12px; font-weight: 900; page-break-inside: avoid; break-inside: avoid;">
        <tr>
            <td style="text-align: left; padding: 5px 0;">TOTAL KITCHEN ITEMS:</td>
            <td style="text-align: right; padding: 5px 0; font-size: 15px; font-weight: 900;">${totalItemCount}</td>
        </tr>
    </table>

    <div style="text-align: center; font-size: 9.5px; font-weight: 800; letter-spacing: 0.5px; margin-top: 8px;">
        *** KITCHEN PRODUCTION COPY ***
    </div>
</body>
</html>
    `;
}

/**
 * Generate 80mm Dual Receipt HTML containing both Kitchen KOT and Customer Receipt
 * with an auto-cutter page break and perforation cut line between them.
 */
export function generateBothReceiptsHtml(order: ReceiptOrder, branding: ReceiptBranding = {}, currency: string = '৳'): string {
    const brandName = (branding.brand_name || 'NOCTURNE RESTAURANT').toUpperCase();
    const brandLogo = branding.brand_logo || '/uploads/branding/logo.svg';
    const tagline = (branding.tagline || 'CRAVINGS NEVER SLEEP').toUpperCase();
    const address = (branding.address || '889 Midnight Ave, Suite B, Downtown District').toUpperCase();
    const phone = branding.phone || '+8801700000000';

    const { formattedDate, formattedTime } = formatDate(order.created_at);

    // Common Order Details
    const receiptNum = order.order_number;
    const tableNum = order.table_number
        ? (order.table_number.toLowerCase().startsWith('table') ? order.table_number.toUpperCase() : `TABLE ${order.table_number}`)
        : (order.order_type === 'dine_in' ? 'TABLE 1' : (order.order_type?.replace('_', ' ').toUpperCase() || 'TAKEAWAY'));
    const orderTypeLabel = order.order_type ? order.order_type.replace('_', ' ').toUpperCase() : 'DINE IN';
    const serverName = (order.creator?.name || 'Cashier / Admin').toUpperCase();
    const customerName = order.customer_name ? order.customer_name.toUpperCase() : null;
    const customerPhone = order.customer_phone || null;

    const items = order.items && order.items.length > 0 ? order.items : [];
    const totalItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const subtotal = Number(order.subtotal || items.reduce((sum, item) => sum + (item.total_price || 0), 0));
    const taxAmount = Number(order.tax_amount || 0);
    const discountAmount = Number(order.discount_amount || 0);
    const discountNote = order.discount_note || '';
    const grandTotal = Number(order.total_amount || Math.max(0, subtotal + taxAmount - discountAmount));

    const paymentMethod = (order.payment_method || 'CASH').toUpperCase();
    const transactionId = order.transaction_id || `REF-${String(order.id || '').padStart(8, '0')}`;
    const cardMask = paymentMethod === 'CARD' ? '•••• 9981' : (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD' ? 'MOBILE WALLET' : 'CASH');
    const barcodeValue = String(order.order_number || '254720250930').replace(/[^0-9A-Z]/g, '');

    // Kitchen KOT Rows - Unbroken, fixed-width table with high-visibility badges
    const kitchenRowsHtml = items.map((item) => {
        const name = (item.item_name || item.name || (item as any).menu_item?.name || 'ITEM').toUpperCase();
        const kitchenCode = (item.kitchen_code || (item as any).menu_item?.kitchen_code || '').toUpperCase();
        return `
            <tr style="border-bottom: 1.5px dashed #000; page-break-inside: avoid; break-inside: avoid;">
                <td style="padding: 6px 0; text-align: left; vertical-align: top; width: 44px; white-space: nowrap;">
                    <span style="display: inline-block; background: #000; color: #fff; font-size: 13px; font-weight: 900; padding: 2px 5px; border-radius: 3px; font-family: monospace;">
                        ${item.quantity}X
                    </span>
                </td>
                <td style="padding: 6px 0 6px 6px; text-align: left; vertical-align: top; word-break: break-word;">
                    <div style="font-size: 14px; font-weight: 900; line-height: 1.25; color: #000;">${name}</div>
                    ${kitchenCode ? `
                    <div style="margin-top: 3px;">
                        <span style="font-size: 11px; font-weight: 900; font-family: monospace; border: 1.5px solid #000; background: #fff; padding: 1px 5px; border-radius: 2px; display: inline-block; letter-spacing: 0.5px;">
                            CODE: ${kitchenCode}
                        </span>
                    </div>` : ''}
                </td>
            </tr>
        `;
    }).join('');

    // Customer Items Rows
    const customerRowsHtml = items.map((item) => {
        const name = (item.item_name || item.name || (item as any).menu_item?.name || 'ITEM').toUpperCase();
        return `
            <tr style="border-bottom: 1px dashed #000; page-break-inside: avoid; break-inside: avoid;">
                <td style="padding: 4px 0; text-align: left; vertical-align: top; word-break: break-word;">
                    <div class="font-bold">${name}</div>
                    <div style="font-size: 9.5px; color: #333;">${item.quantity} x ${formatAmount(item.unit_price, currency)}</div>
                </td>
                <td style="padding: 4px 0; text-align: right; vertical-align: top; font-weight: 800; white-space: nowrap;">
                    ${formatAmount(item.total_price, currency)}
                </td>
            </tr>
        `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>POS 80mm Dual Slips - #${receiptNum}</title>
    <style>
        @page {
            size: auto;
            margin: 0;
        }

        @media print {
            @page {
                size: auto;
                margin: 0;
            }
            html, body {
                width: 100% !important;
                max-width: 72mm !important;
                margin: 0 auto !important;
                padding: 0 !important;
                background: #fff !important;
                color: #000 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, monospace !important;
            }
            .slip-page {
                width: 72mm !important;
                max-width: 72mm !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
            }
            .slip-page.kitchen-slip {
                page-break-after: always !important;
                break-after: page !important;
                margin-bottom: 0 !important;
                padding-bottom: 3mm !important;
            }
            .slip-page.customer-slip {
                page-break-before: always !important;
                break-before: page !important;
                page-break-after: avoid !important;
                break-after: avoid !important;
                padding-top: 2mm !important;
            }
            .tear-separator {
                display: none !important;
            }
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        body {
            margin: 0 auto;
            padding: 8px 10px;
            width: 100%;
            max-width: 300px;
            background-color: #ffffff;
            color: #000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif, monospace;
            font-size: 11px;
            line-height: 1.3;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        .uppercase { text-transform: uppercase; }

        .logo-wrap {
            text-align: center;
            margin-bottom: 6px;
        }

        .logo-img {
            max-height: 44px;
            max-width: 120px;
            object-fit: contain;
            filter: grayscale(100%) contrast(150%);
            margin: 0 auto;
            display: block;
        }

        .header-title {
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin: 2px 0;
            line-height: 1.2;
        }

        .header-tagline {
            font-size: 9.5px;
            font-weight: 700;
            color: #222;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .header-subtitle {
            font-size: 9.5px;
            margin: 1px 0;
            color: #111;
        }

        .divider {
            border-top: 1px dashed #000000;
            margin: 6px 0;
            width: 100%;
        }

        .meta-table, .items-table, .totals-table, .payment-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-table td {
            padding: 1.5px 0;
            font-size: 10.5px;
        }

        .items-table td {
            font-size: 11px;
        }

        .totals-table td {
            padding: 2px 0;
            font-size: 11px;
        }

        .totals-table .total-row td {
            padding-top: 3px;
            font-size: 13.5px;
            font-weight: 900;
        }

        .payment-table td {
            padding: 1.5px 0;
            font-size: 10px;
        }

        .footer-notes {
            margin-top: 8px;
            font-size: 10px;
            text-align: center;
            line-height: 1.35;
        }

        .footer-thanks {
            margin-top: 4px;
            font-size: 10.5px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- ==================== SLIP 1: KITCHEN ORDER TICKET (KOT) ==================== -->
    <div class="slip-page kitchen-slip">
        <div class="text-center" style="margin-bottom: 4px;">
            <div style="font-size: 11px; font-weight: 900; letter-spacing: 0.5px;">${brandName}</div>
            <div style="background: #000; color: #fff; padding: 4px; border-radius: 3px; font-size: 13px; font-weight: 900; letter-spacing: 1px; margin-top: 3px;">
                KITCHEN ORDER TICKET (KOT)
            </div>
        </div>

        <!-- Prominent Table & Type Header -->
        <div style="border: 2px solid #000; padding: 6px 4px; border-radius: 4px; margin: 6px 0; text-align: center; background: #fff; page-break-inside: avoid; break-inside: avoid;">
            <div style="font-size: 20px; font-weight: 900; line-height: 1.1; letter-spacing: 0.5px;">${tableNum.toUpperCase()}</div>
            <div style="font-size: 11.5px; font-weight: 900; margin-top: 2px;">[${orderTypeLabel}]</div>
        </div>

        <!-- Meta Details Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 11px; line-height: 1.4; page-break-inside: avoid; break-inside: avoid;">
            <tr>
                <td style="text-align: left; font-weight: 700; padding: 1px 0;">KOT: #${receiptNum}</td>
                <td style="text-align: right; font-weight: 700; padding: 1px 0;">SERVER: ${serverName}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 1px 0;">TIME: ${formattedTime}</td>
                <td style="text-align: right; padding: 1px 0;">DATE: ${formattedDate.split(' ')[0]}</td>
            </tr>
        </table>

        <!-- Chef Instructions / Notes -->
        ${order.notes ? `
        <div style="margin: 6px 0; border: 2px solid #000; background: #fff; padding: 6px; border-radius: 3px; text-align: left; page-break-inside: avoid; break-inside: avoid;">
            <div style="font-size: 10px; font-weight: 900; letter-spacing: 0.5px;">*** CHEF INSTRUCTIONS / NOTES ***</div>
            <div style="font-size: 12px; font-weight: 900; margin-top: 2px;">${order.notes.toUpperCase()}</div>
        </div>` : ''}

        <div class="divider"></div>

        <!-- Kitchen Items Table -->
        <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
                <tr style="border-bottom: 2px solid #000; font-size: 11px; font-weight: 900;">
                    <th style="text-align: left; padding: 4px 0; width: 44px;">QTY</th>
                    <th style="text-align: left; padding: 4px 0 4px 6px;">ITEM & KITCHEN CODE</th>
                </tr>
            </thead>
            <tbody>
                ${kitchenRowsHtml}
            </tbody>
        </table>

        <div class="divider"></div>

        <!-- Total Item Count Table -->
        <table style="width: 100%; border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 6px 0; font-size: 12px; font-weight: 900; page-break-inside: avoid; break-inside: avoid;">
            <tr>
                <td style="text-align: left; padding: 5px 0;">TOTAL KITCHEN ITEMS:</td>
                <td style="text-align: right; padding: 5px 0; font-size: 15px; font-weight: 900;">${totalItemCount}</td>
            </tr>
        </table>

        <div style="text-align: center; font-size: 9.5px; font-weight: 800; letter-spacing: 0.5px; margin-top: 8px;">
            *** KITCHEN PRODUCTION COPY ***
        </div>

        <div style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 4px; text-align: center; font-size: 9px; font-weight: bold; letter-spacing: 1px;">
            ✂ - - - - - - TEAR / CUT HERE - - - - - - ✂
        </div>
    </div>

    <!-- Screen Preview Tear Separator (Hidden in print) -->
    <div class="tear-separator" style="margin: 22px 0 18px 0; border-top: 2px dashed #000; padding-top: 6px; text-align: center; font-size: 10px; font-weight: 900; letter-spacing: 1px;">
        ✂ - - - - - TEAR / CUT HERE (KITCHEN KOT ABOVE) - - - - - ✂
    </div>

    <!-- ==================== SLIP 2: CUSTOMER MONEY RECEIPT ==================== -->
    <div class="slip-page customer-slip">
        <!-- Top Logo from AppSettings -->
        ${brandLogo ? `
        <div class="logo-wrap">
            <img src="${brandLogo}" class="logo-img" alt="Logo" onerror="this.style.display='none'" />
        </div>` : ''}

        <!-- Restaurant Header -->
        <div class="text-center">
            <div class="header-title">${brandName}</div>
            ${tagline ? `<div class="header-tagline">${tagline}</div>` : ''}
            <div class="header-subtitle">${address}</div>
            <div class="header-subtitle font-bold">TEL: ${phone}</div>
        </div>

        <!-- Divider 1 -->
        <div class="divider"></div>

        <!-- Receipt Meta Information -->
        <table class="meta-table">
            <tr>
                <td class="text-left font-bold">INVOICE:</td>
                <td class="text-right font-black" style="font-size: 12px;">#${receiptNum}</td>
            </tr>
            <tr>
                <td class="text-left font-bold">TABLE / TYPE:</td>
                <td class="text-right font-bold">${tableNum} (${orderTypeLabel})</td>
            </tr>
            <tr>
                <td class="text-left">DATE & TIME:</td>
                <td class="text-right">${formattedDate}</td>
            </tr>
            <tr>
                <td class="text-left">CASHIER / SERVER:</td>
                <td class="text-right">${serverName}</td>
            </tr>
            ${customerName ? `
            <tr>
                <td class="text-left">CUSTOMER:</td>
                <td class="text-right font-bold">${customerName} ${customerPhone ? `(${customerPhone})` : ''}</td>
            </tr>` : ''}
        </table>

        <!-- Divider 2 -->
        <div class="divider"></div>

        <!-- Items Table -->
        <table class="items-table" style="table-layout: fixed;">
            <thead>
                <tr style="border-bottom: 1.5px solid #000000; font-size: 10.5px; font-weight: 900;">
                    <th class="text-left" style="padding-bottom: 3px;">DESCRIPTION</th>
                    <th class="text-right" style="padding-bottom: 3px; width: 68px;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${customerRowsHtml}
            </tbody>
        </table>

        <!-- Divider 3 -->
        <div class="divider"></div>

        <!-- Totals & Taxes Breakdown -->
        <table class="totals-table">
            <tr>
                <td class="text-left font-bold">SUBTOTAL:</td>
                <td class="text-right">${formatAmount(subtotal, currency)}</td>
            </tr>
            ${taxAmount > 0 ? `
            <tr>
                <td class="text-left">TAX:</td>
                <td class="text-right">+${formatAmount(taxAmount, currency)}</td>
            </tr>` : ''}
            ${discountAmount > 0 ? `
            <tr style="color: #b91c1c;">
                <td class="text-left font-bold">DISCOUNT ${discountNote ? `(${discountNote.toUpperCase()})` : ''}:</td>
                <td class="text-right font-bold">-${formatAmount(discountAmount, currency)}</td>
            </tr>` : ''}
            <tr class="total-row" style="border-top: 1.5px solid #000000;">
                <td class="text-left font-black" style="font-size: 14px;">TOTAL DUE:</td>
                <td class="text-right font-black" style="font-size: 14px;">${formatAmount(grandTotal, currency)}</td>
            </tr>
        </table>

        <!-- Divider 4 -->
        <div class="divider"></div>

        <!-- Payment & Card Details -->
        <table class="payment-table">
            <tr>
                <td class="text-left">${paymentMethod === 'CARD' ? 'CARD:' : 'METHOD:'}</td>
                <td class="text-right font-bold">${cardMask}</td>
            </tr>
            <tr>
                <td class="text-left">TYPE:</td>
                <td class="text-right">${paymentMethod}</td>
            </tr>
            <tr>
                <td class="text-left">TIME:</td>
                <td class="text-right">${formattedTime}</td>
            </tr>
            <tr>
                <td class="text-left">REF:</td>
                <td class="text-right">${transactionId}</td>
            </tr>
            <tr>
                <td class="text-left">STATUS:</td>
                <td class="text-right font-bold">APPROVED</td>
            </tr>
        </table>

        <!-- Footer Messages -->
        <div class="footer-notes">
            <div>TIP IS NOT INCLUDED.</div>
            <div>PLEASE COME AGAIN!</div>
        </div>

        <div class="footer-thanks">
            THANK YOU FOR DINING WITH US!
        </div>

        <!-- Barcode -->
        ${generateBarcodeSvg(barcodeValue)}
    </div>
</body>
</html>
    `;
}

/**
 * Common Hidden Iframe print runner
 */
export function printHtmlViaIframe(html: string, onDone?: () => void, iframeId: string = 'pos-print-iframe') {
    const existingIframe = document.getElementById(iframeId);
    if (existingIframe) {
        existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    // Positioned safely off-screen with opacity 0 (NEVER visibility:hidden as that disables browser print rendering)
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '380px';
    iframe.style.height = '1200px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
        window.print();
        if (onDone) onDone();
        return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    let hasTriggered = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let readyTimer: ReturnType<typeof setTimeout> | null = null;
    let hasCleanedUp = false;

    const doCleanup = () => {
        if (hasCleanedUp) return;
        hasCleanedUp = true;
        try {
            iframe.remove();
        } catch {}
        if (onDone) onDone();
    };

    const triggerPrint = () => {
        if (hasTriggered) return;
        hasTriggered = true;

        if (fallbackTimer) clearTimeout(fallbackTimer);
        if (readyTimer) clearTimeout(readyTimer);

        try {
            iframe.contentWindow?.addEventListener('afterprint', () => {
                setTimeout(doCleanup, 200);
            }, { once: true });
        } catch {}

        try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            // When dialog closes, trigger cleanup if afterprint was not supported
            setTimeout(() => {
                doCleanup();
            }, 1000);
        } catch (e) {
            console.error('Iframe print error', e);
            window.print();
            setTimeout(doCleanup, 1000);
        }
    };

    const imgElements = doc.getElementsByTagName('img');
    if (imgElements.length > 0) {
        let loadedCount = 0;
        const checkDone = () => {
            loadedCount++;
            if (loadedCount >= imgElements.length && !hasTriggered) {
                if (fallbackTimer) clearTimeout(fallbackTimer);
                readyTimer = setTimeout(triggerPrint, 100);
            }
        };

        for (let i = 0; i < imgElements.length; i++) {
            const img = imgElements[i];
            if (img.complete) {
                checkDone();
            } else {
                img.onload = checkDone;
                img.onerror = checkDone;
            }
        }

        fallbackTimer = setTimeout(triggerPrint, 500);
    } else {
        readyTimer = setTimeout(triggerPrint, 100);
    }
}

/**
 * Print Customer Receipt
 */
export function printReceipt(order: ReceiptOrder, branding: ReceiptBranding = {}, currency: string = '৳') {
    const html = generateReceiptHtml(order, branding, currency);
    printHtmlViaIframe(html);
}

/**
 * Print Kitchen KOT Slip
 */
export function printKitchenKot(order: ReceiptOrder, branding: ReceiptBranding = {}) {
    const html = generateKitchenKotHtml(order, branding);
    printHtmlViaIframe(html);
}

/**
 * Print both Kitchen KOT and Customer Receipt as TWO DIFFERENT SLIPS (1 for KOT & 1 for Customer).
 * Never combined into a single slip.
 */
export function printBothReceipts(order: ReceiptOrder, branding: ReceiptBranding = {}, currency: string = '৳') {
    const kitchenHtml = generateKitchenKotHtml(order, branding);
    const customerHtml = generateReceiptHtml(order, branding, currency);

    // Print Slip 1: Kitchen Order Ticket (KOT)
    printHtmlViaIframe(kitchenHtml, () => {
        // Once KOT is printed/closed, print Slip 2: Customer Money Receipt
        setTimeout(() => {
            printHtmlViaIframe(customerHtml, undefined, 'pos-print-customer-iframe');
        }, 400);
    }, 'pos-print-kitchen-iframe');
}

