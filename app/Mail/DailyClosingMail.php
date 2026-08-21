<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyClosingMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;
    public string $brandName;
    public string $currency;
    public string $reportDate;

    /**
     * Create a new message instance.
     */
    public function __construct(array $data)
    {
        $this->data = $data;
        $this->brandName = $data['brand_name'] ?? 'Restaurant';
        $this->currency = $data['currency'] ?? '৳';
        $this->reportDate = $data['date'] ?? date('F d, Y');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $status = ($this->data['net_profit'] ?? 0) >= 0 ? 'Profit' : 'Loss';
        $netFormatted = $this->currency . number_format(abs($this->data['net_profit'] ?? 0), 2);
        $sign = ($this->data['net_profit'] ?? 0) >= 0 ? '+' : '-';

        return new Envelope(
            subject: "Daily Closing Report - {$this->reportDate} [{$this->brandName} | Net: {$sign}{$netFormatted}]",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    /**
     * Format a currency value.
     */
    protected function money(float $val): string
    {
        return $this->currency . number_format($val, 2);
    }

    /**
     * Build rich HTML email body.
     */
    protected function buildHtml(): string
    {
        $sales = (float)($this->data['total_sales'] ?? 0);
        $purchases = (float)($this->data['total_purchases'] ?? 0);
        $expenses = (float)($this->data['total_expenses'] ?? 0);
        $salaries = (float)($this->data['total_salaries'] ?? 0);
        $totalCosts = $purchases + $expenses + $salaries;
        $netProfit = (float)($this->data['net_profit'] ?? ($sales - $totalCosts));
        $isProfit = $netProfit >= 0;
        $orderCount = (int)($this->data['order_count'] ?? 0);
        $marginPercent = $sales > 0 ? round(($netProfit / $sales) * 100, 1) : 0;
        $topDishes = $this->data['top_dishes'] ?? [];
        $alerts = $this->data['alerts'] ?? [];
        $reportUrl = url('/administration-control/reports');

        // Render Top Dishes Rows
        $dishesHtml = '';
        if (!empty($topDishes)) {
            foreach ($topDishes as $dish) {
                $dishName = htmlspecialchars($dish['name'] ?? $dish['dish'] ?? 'Item');
                $qty = (int)($dish['qty'] ?? $dish['sold_qty'] ?? 0);
                $revenue = (float)($dish['revenue'] ?? 0);
                $revFormatted = $this->money($revenue);

                $dishesHtml .= <<<ROW
                <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #1e293b;">
                        {$dishName}
                    </td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: center; color: #64748b; font-weight: 600;">
                        {$qty}
                    </td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">
                        {$revFormatted}
                    </td>
                </tr>
ROW;
            }
        } else {
            $dishesHtml = '<tr><td colspan="3" style="padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">No dish sales recorded for today.</td></tr>';
        }

        // Render Alerts Rows
        $alertsHtml = '';
        if (!empty($alerts)) {
            foreach ($alerts as $item) {
                $ingName = htmlspecialchars($item['ingredient_name'] ?? 'Ingredient');
                $qty = $item['quantity'] ?? 0;
                $used = $item['used_amount'] ?? 0;
                $unit = htmlspecialchars($item['unit'] ?? 'kg');
                $pct = $qty > 0 ? round(($used / $qty) * 100, 0) : 100;

                $alertsHtml .= <<<ALERT
                <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px;">
                    <div style="font-size: 12px; font-weight: 700; color: #92400e; display: flex; justify-content: space-between;">
                        <span>⚠️ {$ingName}</span>
                        <span>{$pct}% Used</span>
                    </div>
                    <div style="font-size: 11px; color: #78350f; margin-top: 2px;">
                        Usage: {$used} / {$qty} {$unit}
                    </div>
                </div>
ALERT;
            }
        } else {
            $alertsHtml = <<<HEALTHY
            <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-left: 4px solid #10b981; border-radius: 8px; padding: 12px 16px; text-align: center;">
                <span style="font-size: 13px; font-weight: 600; color: #065f46;">✅ All ingredient stocks and usage thresholds are within healthy operating limits.</span>
            </div>
HEALTHY;
        }

        $profitBg = $isProfit ? '#ecfdf5' : '#fff1f2';
        $profitBorder = $isProfit ? '#a7f3d0' : '#fecdd3';
        $profitColor = $isProfit ? '#047857' : '#be123c';
        $profitLabel = $isProfit ? 'NET PROFIT' : 'NET LOSS';
        $profitBadgeBg = $isProfit ? '#10b981' : '#ef4444';
        $netSign = $isProfit ? '+' : '-';
        $netAmountFormatted = $this->money(abs($netProfit));

        $salesFormatted = $this->money($sales);
        $purchasesFormatted = $this->money($purchases);
        $salariesFormatted = $this->money($salaries);
        $expensesFormatted = $this->money($expenses);
        $costsFormatted = $this->money($totalCosts);

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Closing Report - {$this->brandName}</title>
    <style>
        body {
            margin: 0;
            padding: 24px;
            background-color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            max-width: 620px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }
        .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 32px 28px;
            text-align: center;
            color: #ffffff;
            position: relative;
        }
        .brand-pill {
            display: inline-block;
            background: rgba(245, 158, 11, 0.2);
            border: 1px solid rgba(245, 158, 11, 0.4);
            color: #fbbf24;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 4px 14px;
            border-radius: 9999px;
            margin-bottom: 12px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #ffffff;
        }
        .header p {
            margin: 6px 0 0 0;
            font-size: 13px;
            color: #94a3b8;
        }
        .content {
            padding: 28px 24px;
        }
        .profit-hero {
            background: {$profitBg};
            border: 2px solid {$profitBorder};
            border-radius: 16px;
            padding: 22px 20px;
            text-align: center;
            margin-bottom: 24px;
        }
        .profit-badge {
            display: inline-block;
            background: {$profitBadgeBg};
            color: #ffffff;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 1px;
            padding: 4px 12px;
            border-radius: 9999px;
            margin-bottom: 8px;
        }
        .profit-amount {
            font-size: 32px;
            font-weight: 900;
            color: {$profitColor};
            margin: 4px 0;
            letter-spacing: -0.5px;
        }
        .profit-sub {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
        }
        .grid {
            display: table;
            width: 100%;
            margin-bottom: 24px;
        }
        .grid-row {
            display: table-row;
        }
        .grid-cell {
            display: table-cell;
            width: 50%;
            padding: 6px;
            box-sizing: border-box;
            vertical-align: top;
        }
        .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 16px;
        }
        .metric-label {
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .metric-value {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
        }
        .metric-desc {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 2px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            margin: 24px 0 12px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-left: 3px solid #f59e0b;
            padding-left: 8px;
        }
        .table-wrap {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 24px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }
        th {
            background: #f8fafc;
            padding: 10px 14px;
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
        }
        .btn-wrap {
            text-align: center;
            margin: 28px 0 12px 0;
        }
        .btn {
            display: inline-block;
            background: #f59e0b;
            color: #0f172a !important;
            font-size: 13px;
            font-weight: 800;
            padding: 14px 28px;
            border-radius: 12px;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        .footer {
            border-top: 1px solid #f1f5f9;
            padding: 20px 24px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="brand-pill">{$this->brandName}</div>
            <h1>Daily Closing Report</h1>
            <p>Financial Summary for {$this->reportDate}</p>
        </div>

        <div class="content">
            <!-- Hero Profit / Loss Card -->
            <div class="profit-hero">
                <span class="profit-badge">{$profitLabel}</span>
                <div class="profit-amount">{$netSign}{$netAmountFormatted}</div>
                <div class="profit-sub">
                    Net Margin: <strong>{$marginPercent}%</strong> | Sales: {$salesFormatted} &minus; Costs: {$costsFormatted}
                </div>
            </div>

            <!-- 4 Metrics Grid -->
            <div class="grid">
                <div class="grid-row">
                    <div class="grid-cell">
                        <div class="metric-card">
                            <div class="metric-label" style="color: #059669;">Total Sales Revenue</div>
                            <div class="metric-value" style="color: #059669;">{$salesFormatted}</div>
                            <div class="metric-desc">{$orderCount} Paid Orders Completed</div>
                        </div>
                    </div>
                    <div class="grid-cell">
                        <div class="metric-card">
                            <div class="metric-label" style="color: #d97706;">Purchases (COGS)</div>
                            <div class="metric-value">{$purchasesFormatted}</div>
                            <div class="metric-desc">Apportioned Daily Cost</div>
                        </div>
                    </div>
                </div>
                <div class="grid-row">
                    <div class="grid-cell">
                        <div class="metric-card">
                            <div class="metric-label" style="color: #2563eb;">Staff Salaries</div>
                            <div class="metric-value">{$salariesFormatted}</div>
                            <div class="metric-desc">Apportioned Daily Payroll</div>
                        </div>
                    </div>
                    <div class="grid-cell">
                        <div class="metric-card">
                            <div class="metric-label" style="color: #dc2626;">Operational Bills</div>
                            <div class="metric-value">{$expensesFormatted}</div>
                            <div class="metric-desc">Apportioned Utilities & Overhead</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Dishes Section -->
            <div class="section-title">Today's Top Sold Dishes</div>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Dish Item</th>
                            <th style="text-align: center;">Sold Qty</th>
                            <th style="text-align: right;">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$dishesHtml}
                    </tbody>
                </table>
            </div>

            <!-- Inventory Usage / Expiry Alerts Section -->
            <div class="section-title">Inventory Alerts & Thresholds</div>
            <div>
                {$alertsHtml}
            </div>

            <!-- Direct Link Button -->
            <div class="btn-wrap">
                <a href="{$reportUrl}" class="btn" target="_blank">
                    Open Full Financial Reports Dashboard &rarr;
                </a>
            </div>
        </div>

        <div class="footer">
            &copy; {$this->brandName} &bull; Generated automatically by Restaurant Management System on {$this->reportDate}.
        </div>
    </div>
</body>
</html>
HTML;
    }
}
