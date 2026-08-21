<?php

namespace App\Models;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value'];

    public static function getByKey(string $key, ?string $default = null): ?string
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function setByKey(string $key, ?string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function getAllSettings(): array
    {
        return static::pluck('value', 'key')->toArray();
    }

    /**
     * Get the configured week start day as CarbonInterface constant (0-6).
     * Defaults to Saturday.
     */
    public static function getWeekStartDay(): int
    {
        $day = strtolower(static::getByKey('week_start_day', 'saturday'));
        return match ($day) {
            'sunday' => CarbonInterface::SUNDAY,
            'monday' => CarbonInterface::MONDAY,
            'tuesday' => CarbonInterface::TUESDAY,
            'wednesday' => CarbonInterface::WEDNESDAY,
            'thursday' => CarbonInterface::THURSDAY,
            'friday' => CarbonInterface::FRIDAY,
            default => CarbonInterface::SATURDAY,
        };
    }

    /**
     * Calculate start and end date for a given week based on the configured week_start_day.
     */
    public static function getWeekRange(?Carbon $date = null): array
    {
        $baseDate = $date ? $date->copy() : now();
        $startDay = static::getWeekStartDay();
        $endDay = ($startDay + 6) % 7;

        return [
            $baseDate->copy()->startOfWeek($startDay)->startOfDay(),
            $baseDate->copy()->endOfWeek($endDay)->endOfDay(),
        ];
    }
}
