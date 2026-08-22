<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = AppSetting::getAllSettings();

        return Inertia::render('admin/settings/index', [
            'settings' => [
                'brand_name' => $settings['brand_name'] ?? 'NOCTURNE',
                'brand_logo' => $settings['brand_logo'] ?? '/uploads/branding/logo.svg',
                'brand_logo_dark' => $settings['brand_logo_dark'] ?? ($settings['brand_logo'] ?? '/uploads/branding/logo.svg'),
                'brand_icon' => $settings['brand_icon'] ?? '/uploads/branding/icon.svg',
                'header_white_logo' => $settings['header_white_logo'] ?? '1',
                'tagline' => $settings['tagline'] ?? 'CRAVINGS NEVER SLEEP',
                'about_text' => $settings['about_text'] ?? 'Step into a world where culinary excellence meets nightlife seduction. Nocturne isn\'t just a meal; it\'s a sensory experience designed for those who thrive when the sun goes down.',
                'phone' => $settings['phone'] ?? '+8801700000000',
                'whatsapp_number' => $settings['whatsapp_number'] ?? '+8801700000000',
                'enable_whatsapp' => $settings['enable_whatsapp'] ?? '1',
                'email' => $settings['email'] ?? 'contact@restaurant.com',
                'notification_email' => $settings['notification_email'] ?? 'admin@restaurant.com',
                'address' => $settings['address'] ?? '889 Midnight Ave, Suite B, Downtown District',
                'opening_hours' => $settings['opening_hours'] ?? "Saturday - Wednesday: 8:00 PM - 4:00 AM\nThursday - Friday (Peak Nights): 8:00 PM - 6:00 AM",
                'logo_url' => $settings['logo_url'] ?? null,
                'default_currency' => $settings['default_currency'] ?? '৳',
                'week_start_day' => $settings['week_start_day'] ?? 'saturday',
                'tax_percentage' => $settings['tax_percentage'] ?? '5.0',
                'expiry_warning_threshold' => $settings['expiry_warning_threshold'] ?? '80',
                'google_maps_embed' => $settings['google_maps_embed'] ?? '',
                'social_facebook' => $settings['social_facebook'] ?? 'https://facebook.com',
                'social_instagram' => $settings['social_instagram'] ?? 'https://instagram.com',
                'social_twitter' => $settings['social_twitter'] ?? 'https://twitter.com',
                'terms_conditions' => $settings['terms_conditions'] ?? 'Standard restaurant policies apply to all dine-in, takeaway, and delivery orders.',
                'privacy_policy' => $settings['privacy_policy'] ?? 'We respect your privacy and process customer order info strictly for billing and delivery purposes.',
                'footer_text' => $settings['footer_text'] ?? '© 2026 NOCTURNE AFTER HOURS. All Rights Reserved.',
                // Surface landing background images
                'hero_bg_image' => $settings['hero_bg_image'] ?? null,
                'atmosphere_image' => $settings['atmosphere_image'] ?? null,
                'vip_lounge_image' => $settings['vip_lounge_image'] ?? null,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'brand_name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'about_text' => 'nullable|string',
            'phone' => 'required|string|max:50',
            'whatsapp_number' => 'nullable|string|max:50',
            'enable_whatsapp' => 'nullable|string|in:0,1,true,false',
            'header_white_logo' => 'nullable|string|in:0,1,true,false',
            'email' => 'required|email|max:255',
            'notification_email' => 'required|email|max:255',
            'address' => 'nullable|string',
            'opening_hours' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'default_currency' => 'required|string|max:10',
            'week_start_day' => 'nullable|string|in:saturday,sunday,monday,tuesday,wednesday,thursday,friday',
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'expiry_warning_threshold' => 'required|numeric|min:1|max:100',
            'google_maps_embed' => 'nullable|string',
            'social_facebook' => 'nullable|string',
            'social_instagram' => 'nullable|string',
            'social_twitter' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'footer_text' => 'nullable|string',
            'brand_logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'brand_logo_dark_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'brand_icon_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp,ico|max:2048',
            'hero_bg_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'atmosphere_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'vip_lounge_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
        ]);

        $uploadPath = public_path('uploads/branding');
        if (!File::exists($uploadPath)) {
            File::makeDirectory($uploadPath, 0755, true);
        }

        // Process Brand Logo (Light Theme) File Upload
        if ($request->hasFile('brand_logo_file')) {
            $file = $request->file('brand_logo_file');
            $fileName = 'brand_logo_light_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $fileName);
            AppSetting::setByKey('brand_logo', '/uploads/branding/' . $fileName);
        }

        // Process Brand Logo Dark (Dark Theme) File Upload
        if ($request->hasFile('brand_logo_dark_file')) {
            $file = $request->file('brand_logo_dark_file');
            $fileName = 'brand_logo_dark_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $fileName);
            AppSetting::setByKey('brand_logo_dark', '/uploads/branding/' . $fileName);
        }

        // Process Brand Icon File Upload
        if ($request->hasFile('brand_icon_file')) {
            $file = $request->file('brand_icon_file');
            $fileName = 'brand_icon_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $fileName);
            AppSetting::setByKey('brand_icon', '/uploads/branding/' . $fileName);
        }

        // Process Hero Background Image Upload
        if ($request->hasFile('hero_bg_file')) {
            $file = $request->file('hero_bg_file');
            $fileName = 'hero_bg_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $fileName);
            AppSetting::setByKey('hero_bg_image', '/uploads/branding/' . $fileName);
        }

        // Process Atmosphere Image Upload
        if ($request->hasFile('atmosphere_image_file')) {
            $file = $request->file('atmosphere_image_file');
            $fileName = 'atmosphere_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $fileName);
            AppSetting::setByKey('atmosphere_image', '/uploads/branding/' . $fileName);
        }

        // Process VIP Lounge Image Upload
        if ($request->hasFile('vip_lounge_image_file')) {
            $file = $request->file('vip_lounge_image_file');
            $fileName = 'vip_lounge_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadPath, $fileName);
            AppSetting::setByKey('vip_lounge_image', '/uploads/branding/' . $fileName);
        }

        // Save all other string/numeric settings
        $excludedKeys = [
            'brand_logo_file',
            'brand_logo_dark_file',
            'brand_icon_file',
            'hero_bg_file',
            'atmosphere_image_file',
            'vip_lounge_image_file',
        ];

        foreach ($validated as $key => $value) {
            if (!in_array($key, $excludedKeys) && $value !== null) {
                AppSetting::setByKey($key, (string)$value);
            }
        }

        AuditLogService::log("Updated application settings, week start day ({$request->week_start_day}) and operating hours", "settings");

        return redirect()->back()->with('success', 'App settings, week start day & operating hours saved successfully.');
    }

    public function backupDatabase(): StreamedResponse
    {
        $tables = DB::select('SHOW TABLES');
        $dbName = config('database.connections.mysql.database');

        $backupData = [
            'database' => $dbName,
            'exported_at' => now()->toIso8601String(),
            'tables' => [],
        ];

        foreach ($tables as $tableObj) {
            $arrayObj = (array) $tableObj;
            $tableName = array_values($arrayObj)[0] ?? null;

            if ($tableName) {
                $backupData['tables'][$tableName] = DB::table($tableName)->get();
            }
        }

        $filename = 'backup_' . $dbName . '_' . date('Y-m-d_H-i-s') . '.json';

        $headers = [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        AuditLogService::log("Downloaded database backup JSON export", "settings");

        return response()->stream(function () use ($backupData) {
            echo json_encode($backupData, JSON_PRETTY_PRINT);
        }, 200, $headers);
    }
}
