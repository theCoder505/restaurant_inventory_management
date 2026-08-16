<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Category;
use App\Models\MenuItem;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    public function index(): Response
    {
        $settings = AppSetting::getAllSettings();

        $menuCategories = Category::where('type', 'menu')
            ->with(['menuItems' => function ($query) {
                $query->where('is_available', true);
            }])
            ->get();

        $featuredItems = MenuItem::where('is_available', true)
            ->where('is_featured', true)
            ->with('category')
            ->get();

        return Inertia::render('welcome', [
            'settings' => [
                'brand_name' => $settings['brand_name'] ?? 'Gourmet Bistro',
                'tagline' => $settings['tagline'] ?? 'Fresh Ingredients, Exquisite Flavors',
                'about_text' => $settings['about_text'] ?? 'Welcome to our restaurant! We serve freshly prepared dishes crafted with passion, premium local ingredients, and authentic recipes.',
                'phone' => $settings['phone'] ?? '+8801700000000',
                'email' => $settings['email'] ?? 'contact@restaurant.com',
                'address' => $settings['address'] ?? '123 Culinary Avenue, Food District, Dhaka',
                'opening_hours' => $settings['opening_hours'] ?? 'Mon - Sun: 10:00 AM - 11:00 PM',
                'logo_url' => $settings['logo_url'] ?? null,
                'default_currency' => $settings['default_currency'] ?? '৳',
                'google_maps_embed' => $settings['google_maps_embed'] ?? '',
                'social_facebook' => $settings['social_facebook'] ?? '#',
                'social_instagram' => $settings['social_instagram'] ?? '#',
                'social_twitter' => $settings['social_twitter'] ?? '#',
                'terms_conditions' => $settings['terms_conditions'] ?? 'Standard restaurant policies apply to all dine-in, takeaway, and delivery orders.',
                'privacy_policy' => $settings['privacy_policy'] ?? 'We respect your privacy and process customer order info strictly for billing and delivery purposes.',
                'footer_text' => $settings['footer_text'] ?? '© 2026 Gourmet Bistro. All Rights Reserved.',
            ],
            'menuCategories' => $menuCategories,
            'featuredItems' => $featuredItems,
        ]);
    }
}
