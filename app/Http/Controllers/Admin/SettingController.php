<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                'brand_name' => $settings['brand_name'] ?? 'Le Gourmet Bistro',
                'brand_logo' => $settings['brand_logo'] ?? '/uploads/branding/logo.svg',
                'brand_icon' => $settings['brand_icon'] ?? '/uploads/branding/icon.svg',
                'tagline' => $settings['tagline'] ?? 'Fresh Ingredients, Exquisite Flavors',
                'about_text' => $settings['about_text'] ?? 'Welcome to our restaurant! We serve freshly prepared dishes crafted with passion, premium local ingredients, and authentic recipes.',
                'phone' => $settings['phone'] ?? '+8801700000000',
                'email' => $settings['email'] ?? 'contact@restaurant.com',
                'notification_email' => $settings['notification_email'] ?? 'admin@restaurant.com',
                'address' => $settings['address'] ?? '123 Culinary Avenue, Food District, Dhaka',
                'opening_hours' => $settings['opening_hours'] ?? 'Mon - Sun: 10:00 AM - 11:00 PM',
                'logo_url' => $settings['logo_url'] ?? null,
                'default_currency' => $settings['default_currency'] ?? '৳',
                'tax_percentage' => $settings['tax_percentage'] ?? '5.0',
                'expiry_warning_threshold' => $settings['expiry_warning_threshold'] ?? '80',
                'google_maps_embed' => $settings['google_maps_embed'] ?? '',
                'social_facebook' => $settings['social_facebook'] ?? '#',
                'social_instagram' => $settings['social_instagram'] ?? '#',
                'social_twitter' => $settings['social_twitter'] ?? '#',
                'terms_conditions' => $settings['terms_conditions'] ?? 'Standard restaurant policies apply to all dine-in, takeaway, and delivery orders.',
                'privacy_policy' => $settings['privacy_policy'] ?? 'We respect your privacy and process customer order info strictly for billing and delivery purposes.',
                'footer_text' => $settings['footer_text'] ?? '© 2026 Le Gourmet Bistro. All Rights Reserved.',
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
            'email' => 'required|email|max:255',
            'notification_email' => 'required|email|max:255',
            'address' => 'nullable|string',
            'opening_hours' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'default_currency' => 'required|string|max:10',
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'expiry_warning_threshold' => 'required|numeric|min:1|max:100',
            'google_maps_embed' => 'nullable|string',
            'social_facebook' => 'nullable|string',
            'social_instagram' => 'nullable|string',
            'social_twitter' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'footer_text' => 'nullable|string',
            'brand_logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'brand_icon_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Process Brand Logo File Upload
        if ($request->hasFile('brand_logo_file')) {
            $file = $request->file('brand_logo_file');
            $fileName = 'brand_logo_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/branding'), $fileName);
            AppSetting::setByKey('brand_logo', '/uploads/branding/' . $fileName);
        }

        // Process Brand Icon File Upload
        if ($request->hasFile('brand_icon_file')) {
            $file = $request->file('brand_icon_file');
            $fileName = 'brand_icon_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/branding'), $fileName);
            AppSetting::setByKey('brand_icon', '/uploads/branding/' . $fileName);
        }

        foreach ($validated as $key => $value) {
            if ($key !== 'brand_logo_file' && $key !== 'brand_icon_file' && $value !== null) {
                AppSetting::setByKey($key, (string)$value);
            }
        }

        AuditLogService::log("Updated application settings and brand logo/icon assets", "settings");

        return redirect()->back()->with('success', 'App settings & branding updated successfully.');
    }

    public function backupDatabase(): StreamedResponse
    {
        $tables = DB::select('SHOW TABLES');
        $dbName = config('database.connections.mysql.database');
        $propertyKey = "Tables_in_{$dbName}";

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
