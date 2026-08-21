<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otp;
    public string $actionText;
    public string $recipientName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $otp, string $action = 'profile_update', string $recipientName = 'Administrator')
    {
        $this->otp = $otp;
        $this->recipientName = $recipientName;
        $this->actionText = match ($action) {
            'password_update' => 'Password Change Request',
            default => 'Profile Information Update',
        };
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Verification Code: {$this->otp} - {$this->actionText}",
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
     * Build rich HTML email body.
     */
    protected function buildHtml(): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 24px;
        }
        .container {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            padding: 28px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 6px 0 0 0;
            font-size: 13px;
            opacity: 0.9;
        }
        .content {
            padding: 32px 24px;
            text-align: center;
        }
        .greeting {
            font-size: 15px;
            color: #334155;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .text {
            font-size: 13px;
            line-height: 1.6;
            color: #64748b;
            margin-bottom: 24px;
        }
        .otp-badge {
            display: inline-block;
            background: #fef3c7;
            color: #b45309;
            border: 2px dashed #f59e0b;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 8px;
            padding: 14px 28px;
            border-radius: 12px;
            margin: 8px 0 24px 0;
        }
        .alert {
            background: #f1f5f9;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 12px;
            color: #475569;
            text-align: left;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .footer {
            border-top: 1px solid #f1f5f9;
            padding: 16px 24px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Restaurant Inventory System</h1>
            <p>Admin Security Verification</p>
        </div>
        <div class="content">
            <div class="greeting">Hello, {$this->recipientName}</div>
            <p class="text">
                A request has been initiated to perform a <strong>{$this->actionText}</strong> on your administrator account.
                Please use the single-use 6-digit verification code below to authorize this action:
            </p>

            <div class="otp-badge">{$this->otp}</div>

            <div class="alert">
                ⏰ <strong>Validity:</strong> This code will expire in <strong>10 minutes</strong>.<br>
                🔒 <strong>Security Warning:</strong> If you did not initiate this request, please review your account credentials immediately.
            </div>
        </div>
        <div class="footer">
            &copy; Restaurant Inventory Management System. This is an automated security email.
        </div>
    </div>
</body>
</html>
HTML;
    }
}
