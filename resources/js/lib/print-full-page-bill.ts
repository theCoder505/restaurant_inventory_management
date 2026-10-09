import { ReceiptBranding, ReceiptOrder } from './print-receipt';

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
    const height = 36;
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
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 6px;">
            <svg viewBox="0 0 ${totalWidth} ${height}" style="width: 180px; height: ${height}px;" shape-rendering="crispEdges">
                ${rects}
            </svg>
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; margin-top: 2px; font-family: monospace;">${cleanValue}</div>
        </div>
    `;
}

function formatAmount(amount: number, currency: string = '৳'): string {
    return `${currency}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        formattedDate: `${d}/${m}/${y}`,
        formattedTime: `${hr}:${min}:${sec} ${ampm}`,
    };
}

export function generateFullPageBillHtml(order: ReceiptOrder, branding: ReceiptBranding = {}, currency: string = '৳'): string {
    const brandName = (branding.brand_name || 'NOCTURNE RESTAURANT').toUpperCase();
    const brandLogo = branding.brand_logo || '/uploads/branding/logo.svg';
    const tagline = branding.tagline || 'CRAVINGS NEVER SLEEP';
    const address = branding.address || '889 Midnight Ave, Suite B, Downtown District';
    const phone = branding.phone || '+8801700000000';

    const { formattedDate, formattedTime } = formatDate(order.created_at);

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

    const itemsRowsHtml = items.map((item, idx) => {
        const name = item.item_name || item.name || 'Dish Item';
        const unitPrice = formatAmount(item.unit_price, currency);
        const totalPrice = formatAmount(item.total_price, currency);
        return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 12px; text-align: center; color: #475569; font-size: 12px;">${idx + 1}</td>
                <td style="padding: 10px 12px; text-align: left; font-weight: 600; color: #0f172a; font-size: 13px;">
                    ${name}
                </td>
                <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #0f172a; font-size: 13px;">${item.quantity}</td>
                <td style="padding: 10px 12px; text-align: right; color: #475569; font-size: 12px;">${unitPrice}</td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">${totalPrice}</td>
            </tr>
        `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>POS Bill - ${invoiceNum}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            margin: 0;
            padding: 24px 32px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            font-size: 13px;
            line-height: 1.5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 32px 36px;
            background: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        @media print {
            body {
                padding: 0;
                background: #ffffff;
            }
            .container {
                max-width: 100%;
                border: none;
                border-radius: 0;
                padding: 0;
                box-shadow: none;
            }
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        .logo-img {
            max-height: 55px;
            max-width: 180px;
            object-fit: contain;
            display: block;
        }
        .brand-title {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0f172a;
            margin: 0;
            line-height: 1.1;
        }
        .brand-tagline {
            font-size: 11px;
            font-weight: 600;
            color: #f59e0b;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 4px;
        }
        .brand-info {
            font-size: 11.5px;
            color: #475569;
            margin-top: 4px;
            line-height: 1.4;
        }
        .invoice-badge {
            display: inline-block;
            background-color: #0f172a;
            color: #ffffff;
            font-weight: 900;
            font-size: 16px;
            letter-spacing: 1px;
            padding: 6px 16px;
            border-radius: 8px;
            text-transform: uppercase;
        }
        .meta-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 24px;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .meta-table td {
            padding: 4px 8px;
            font-size: 12px;
            vertical-align: top;
        }
        .meta-label {
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            font-size: 10.5px;
            letter-spacing: 0.5px;
        }
        .meta-value {
            font-weight: 800;
            color: #0f172a;
            font-size: 13px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        .items-table th {
            background-color: #0f172a;
            color: #ffffff;
            padding: 10px 12px;
            font-size: 11.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .items-table th:first-child { border-top-left-radius: 8px; }
        .items-table th:last-child { border-top-right-radius: 8px; }
        .summary-wrap {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-bottom: 28px;
        }
        .summary-table {
            width: 320px;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 6px 10px;
            font-size: 13px;
        }
        .summary-total-row td {
            border-top: 2px solid #0f172a;
            padding-top: 10px;
            padding-bottom: 10px;
            font-size: 17px;
            font-weight: 900;
            color: #0f172a;
        }
        .payment-banner {
            background-color: #f1f5f9;
            border-left: 4px solid #10b981;
            border-radius: 6px;
            padding: 10px 16px;
            margin-bottom: 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .status-badge {
            background-color: #10b981;
            color: #ffffff;
            font-weight: 900;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            letter-spacing: 0.5px;
        }
        .footer-wrap {
            border-top: 1px dashed #cbd5e1;
            padding-top: 18px;
            text-align: center;
            color: #64748b;
            font-size: 11.5px;
        }
        .signature-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 36px;
            padding: 0 10px;
        }
        .sig-box {
            border-top: 1px solid #94a3b8;
            width: 180px;
            text-align: center;
            font-size: 11px;
            font-weight: 600;
            padding-top: 4px;
            color: #475569;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header: Logo & Restaurant Information -->
        <table class="header-table">
            <tr>
                <td style="width: 55%; vertical-align: top;">
                    ${brandLogo ? `<img src="${brandLogo}" class="logo-img" alt="${brandName}" onerror="this.style.display='none'" />` : ''}
                    <h1 class="brand-title">${brandName}</h1>
                    <div class="brand-tagline">${tagline}</div>
                    <div class="brand-info">
                        ${address}<br/>
                        Phone: <strong>${phone}</strong>
                    </div>
                </td>
                <td style="width: 45%; vertical-align: top; text-align: right;">
                    <div class="invoice-badge">POS BILL & TAX INVOICE</div>
                    <div style="margin-top: 8px; font-family: monospace; font-size: 15px; font-weight: 900; color: #0f172a;">
                        ${invoiceNum}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                        Date: <strong>${formattedDate}</strong> | Time: <strong>${formattedTime}</strong>
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                        Served by: <strong>${serverName}</strong>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Order & Customer Meta Grid -->
        <div class="meta-card">
            <table class="meta-table">
                <tr>
                    <td style="width: 25%;">
                        <div class="meta-label">Order Type</div>
                        <div class="meta-value" style="color: #f59e0b;">${orderTypeLabel}</div>
                    </td>
                    <td style="width: 25%;">
                        <div class="meta-label">Table / Counter</div>
                        <div class="meta-value">${tableNum}</div>
                    </td>
                    <td style="width: 25%;">
                        <div class="meta-label">Customer Name</div>
                        <div class="meta-value">${customerName}</div>
                    </td>
                    <td style="width: 25%;">
                        <div class="meta-label">Customer Phone</div>
                        <div class="meta-value">${customerPhone}</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Itemized Dish Billing Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 8%; text-align: center;">#</th>
                    <th style="width: 47%; text-align: left;">Item & Description</th>
                    <th style="width: 15%; text-align: center;">Quantity</th>
                    <th style="width: 15%; text-align: right;">Unit Price</th>
                    <th style="width: 15%; text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRowsHtml}
            </tbody>
        </table>

        <!-- Financial Totals Summary -->
        <div class="summary-wrap" style="display: block; text-align: right;">
            <table class="summary-table" style="margin-left: auto;">
                <tr>
                    <td style="text-align: left; color: #64748b; font-weight: 600;">Subtotal:</td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">${formatAmount(subtotal, currency)}</td>
                </tr>
                <tr>
                    <td style="text-align: left; color: #64748b; font-weight: 600;">VAT / Tax:</td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">${formatAmount(tax, currency)}</td>
                </tr>
                ${discount > 0 ? `
                <tr>
                    <td style="text-align: left; color: #e11d48; font-weight: 600;">Discount Applied:</td>
                    <td style="text-align: right; font-weight: 700; color: #e11d48;">-${formatAmount(discount, currency)}</td>
                </tr>` : ''}
                <tr class="summary-total-row">
                    <td style="text-align: left;">GRAND TOTAL:</td>
                    <td style="text-align: right; color: #f59e0b;">${formatAmount(total, currency)}</td>
                </tr>
            </table>
        </div>

        <!-- Payment Settlement Status -->
        <div class="payment-banner">
            <div>
                <span style="font-size: 11.5px; color: #475569; font-weight: 600;">PAYMENT METHOD:</span>
                <strong style="color: #0f172a; margin-left: 6px; font-size: 13px;">${paymentMethod}</strong>
                ${transactionId ? `<span style="color: #64748b; font-size: 11px; margin-left: 10px;">(Ref: ${transactionId})</span>` : ''}
            </div>
            <div>
                <span class="status-badge">${paymentStatus}</span>
            </div>
        </div>

        <!-- Barcode & Authorized Signature -->
        <div class="signature-row">
            <div>
                ${generateBarcodeSvg(invoiceNum)}
            </div>
            <div class="sig-box">
                Authorized Signature / Cashier
            </div>
        </div>

        <!-- Footer Notes -->
        <div class="footer-wrap" style="margin-top: 24px;">
            <p style="margin: 0 0 4px 0; font-weight: 700; color: #0f172a; font-size: 12.5px;">
                Thank you for dining at ${brandName}! We look forward to serving you again.
            </p>
            <p style="margin: 0; font-size: 11px;">
                All prices include applicable government taxes. For inquiries or feedback, please contact ${phone} or visit our website.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Isolated Hidden Iframe Printing for Full-Page Standard (A4/Letter) Printer.
 */
export function printFullPageBill(order: ReceiptOrder, branding: ReceiptBranding = {}, currency: string = '৳') {
    const html = generateFullPageBillHtml(order, branding, currency);

    // Remove any existing print iframe
    const existingIframe = document.getElementById('full-page-print-iframe');
    if (existingIframe) {
        existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'full-page-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
        window.print();
        return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    let hasTriggered = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let readyTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerPrint = () => {
        if (hasTriggered) return;
        hasTriggered = true;

        if (fallbackTimer) clearTimeout(fallbackTimer);
        if (readyTimer) clearTimeout(readyTimer);

        try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        } catch (e) {
            console.error('Iframe print error, falling back to window.print', e);
            window.print();
        } finally {
            setTimeout(() => {
                try {
                    iframe.remove();
                } catch {
                    // Ignore removal error
                }
            }, 3000);
        }
    };

    const imgElements = doc.getElementsByTagName('img');
    if (imgElements.length > 0) {
        let loadedCount = 0;
        const checkDone = () => {
            loadedCount++;
            if (loadedCount >= imgElements.length && !hasTriggered) {
                if (fallbackTimer) clearTimeout(fallbackTimer);
                readyTimer = setTimeout(triggerPrint, 150);
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

        fallbackTimer = setTimeout(triggerPrint, 800);
    } else {
        readyTimer = setTimeout(triggerPrint, 150);
    }
}
