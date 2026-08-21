<?php

namespace App\Services;

use App\Mail\DailyClosingMail;
use App\Models\AppSetting;
use App\Models\PurchaseItem;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Checks items reaching or exceeding the configured used amount threshold percentage.
     */
    public static function checkAlerts(): array
    {
        $thresholdPercent = (float) AppSetting::getByKey('expiry_warning_threshold', '80');
        $thresholdRatio = $thresholdPercent / 100;

        $expiryWarnings = PurchaseItem::with('purchase.supplier')
            ->where('quantity', '>', 0)
            ->whereRaw('(used_amount / quantity) >= ?', [$thresholdRatio])
            ->orderByDesc('id')
            ->get();

        return [
            'expiring' => $expiryWarnings,
            'threshold_percentage' => $thresholdPercent,
        ];
    }

    /**
     * Get all active system notifications (expiry warnings, threshold usage, etc.)
     */
    public static function getAllNotifications(): array
    {
        $alerts = self::checkAlerts();
        $notifications = [];

        foreach ($alerts['expiring'] as $item) {
            $usedPercent = $item->quantity > 0 ? round(($item->used_amount / $item->quantity) * 100, 1) : 0;
            $notifications[] = [
                'id' => $item->id,
                'title' => "High Ingredient Usage ({$usedPercent}%)",
                'message' => "Ingredient '{$item->ingredient_name}' has reached {$usedPercent}% usage.",
                'type' => 'warning',
                'created_at' => $item->created_at?->toIso8601String() ?? now()->toIso8601String(),
            ];
        }

        return $notifications;
    }

    /**
     * Sends daily summary report email synchronously.
     */
    public static function sendDailySummaryEmail(array $summaryData): bool
    {
        $adminEmail = AppSetting::getByKey('notification_email');
        if (empty($adminEmail)) {
            $adminEmail = auth()->user()?->email;
        }
        if (empty($adminEmail)) {
            $adminEmail = config('mail.from.address');
        }

        if (!$adminEmail) {
            Log::warning("Could not dispatch daily closing email: No recipient email configured.");
            return false;
        }

        try {
            Mail::to($adminEmail)->send(new DailyClosingMail($summaryData));

            Log::info("Daily closing summary email successfully sent to {$adminEmail}");
            AuditLogService::log("Sent Daily Closing Summary Email to " . $adminEmail, "reports");
            return true;
        } catch (\Throwable $e) {
            Log::error("Failed to send Daily Closing Summary Email to {$adminEmail}: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            return false;
        }
    }
}

