<?php

namespace App\Models;

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
}
