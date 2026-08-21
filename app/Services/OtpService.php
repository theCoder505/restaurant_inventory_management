<?php

namespace App\Services;

use App\Mail\OtpMail;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    public const EXPIRY_MINUTES = 10;
    public const COOLDOWN_SECONDS = 60;

    /**
     * Generate and dispatch a 6-digit OTP code to the user's current email.
     *
     * @param Authenticatable $user
     * @param string $action ('profile_update' | 'password_update')
     * @return array
     */
    public static function generateAndSend(Authenticatable $user, string $action = 'profile_update'): array
    {
        $cooldownKey = "admin_otp_cooldown_{$user->id}_{$action}";
        $cachedCooldown = Cache::get($cooldownKey);

        if ($cachedCooldown) {
            $remaining = (int) ceil($cachedCooldown - now()->timestamp);
            if ($remaining > 0) {
                return [
                    'success' => false,
                    'message' => "Please wait {$remaining} seconds before requesting a new code.",
                    'cooldown' => $remaining,
                ];
            }
        }

        // Generate 6-digit cryptographic random OTP
        $otp = (string) random_int(100000, 999999);
        $cacheKey = "admin_otp_{$user->id}_{$action}";

        // Store OTP with 10-minute validity
        Cache::put($cacheKey, [
            'otp' => $otp,
            'created_at' => now()->timestamp,
        ], now()->addMinutes(self::EXPIRY_MINUTES));

        // Set 60-second cooldown
        Cache::put($cooldownKey, now()->addSeconds(self::COOLDOWN_SECONDS)->timestamp, now()->addSeconds(self::COOLDOWN_SECONDS));

        // Send Email
        try {
            Mail::to($user->email)->send(new OtpMail($otp, $action, $user->name ?? 'Administrator'));
        } catch (\Throwable $e) {
            Log::error("Failed to send OTP email to {$user->email}: " . $e->getMessage());
        }

        // Log OTP in system logs for developer/local convenience
        Log::info("Admin OTP generated for {$user->email} [{$action}]: {$otp}");
        AuditLogService::log("Dispatched {$action} OTP verification code to {$user->email}", 'security');

        return [
            'success' => true,
            'message' => "A 6-digit verification code has been sent to {$user->email}.",
            'cooldown' => self::COOLDOWN_SECONDS,
        ];
    }

    /**
     * Verify the provided OTP code.
     *
     * @param Authenticatable $user
     * @param string $action
     * @param string|null $code
     * @return bool
     */
    public static function verify(Authenticatable $user, string $action, ?string $code): bool
    {
        if (empty($code)) {
            return false;
        }

        $cacheKey = "admin_otp_{$user->id}_{$action}";
        $cached = Cache::get($cacheKey);

        if (!$cached || !isset($cached['otp'])) {
            return false;
        }

        if (trim((string) $cached['otp']) === trim((string) $code)) {
            self::clear($user, $action);
            return true;
        }

        return false;
    }

    /**
     * Clear OTP data from cache.
     *
     * @param Authenticatable $user
     * @param string $action
     * @return void
     */
    public static function clear(Authenticatable $user, string $action): void
    {
        Cache::forget("admin_otp_{$user->id}_{$action}");
        Cache::forget("admin_otp_cooldown_{$user->id}_{$action}");
    }
}
