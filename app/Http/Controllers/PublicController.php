<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Category;
use App\Models\MenuItem;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    /**
     * Display the public restaurant landing page.
     */
    public function index(): Response
    {
        $settings = AppSetting::getAllSettings();

        $menuCategories = Category::where('type', 'menu')
            ->with(['menuItems' => function ($query) {
                $query->where('is_available', true)->with(['category', 'recipes.inventoryItem']);
            }])
            ->get();

        $featuredItems = MenuItem::where('is_available', true)
            ->where('is_featured', true)
            ->with(['category', 'recipes.inventoryItem'])
            ->get();

        // If no featured items are explicitly marked, grab the first 3-4 available dishes as highlights
        if ($featuredItems->isEmpty()) {
            $featuredItems = MenuItem::where('is_available', true)
                ->with(['category', 'recipes.inventoryItem'])
                ->take(4)
                ->get();
        }

        return Inertia::render('welcome', [
            'settings' => [
                'brand_name' => $settings['brand_name'] ?? 'NOCTURNE',
                'brand_logo' => $settings['brand_logo'] ?? null,
                'brand_icon' => $settings['brand_icon'] ?? null,
                'tagline' => $settings['tagline'] ?? 'CRAVINGS NEVER SLEEP',
                'about_text' => $settings['about_text'] ?? 'Step into a world where culinary excellence meets nightlife seduction. Nocturne isn\'t just a meal; it\'s a sensory experience designed for those who thrive when the sun goes down.',
                'phone' => $settings['phone'] ?? '+8801712345678',
                'email' => $settings['email'] ?? 'contact@restaurant.com',
                'address' => $settings['address'] ?? '889 Midnight Ave, Suite B, Downtown District',
                'opening_hours' => $settings['opening_hours'] ?? 'Mon - Sun: 8:00 PM - 4:00 AM (Fri-Sat till 6 AM)',
                'logo_url' => $settings['logo_url'] ?? null,
                'default_currency' => $settings['default_currency'] ?? '৳',
                'google_maps_embed' => $settings['google_maps_embed'] ?? '',
                'social_facebook' => $settings['social_facebook'] ?? 'https://facebook.com',
                'social_instagram' => $settings['social_instagram'] ?? 'https://instagram.com',
                'social_twitter' => $settings['social_twitter'] ?? 'https://twitter.com',
                'terms_conditions' => $settings['terms_conditions'] ?? '1. Prices include applicable taxes unless specified otherwise. 2. Please notify staff of food allergies before placing orders.',
                'privacy_policy' => $settings['privacy_policy'] ?? 'We respect your privacy and process customer order information strictly for billing, preparation, and delivery purposes.',
                'footer_text' => $settings['footer_text'] ?? '© 2026 NOCTURNE AFTER HOURS. All Rights Reserved.',
            ],
            'menuCategories' => $menuCategories,
            'featuredItems' => $featuredItems,
        ]);
    }

    /**
     * Display a specific recipe / dish detail page.
     */
    public function recipeDetail(MenuItem $menuItem, ?string $slug = null): Response
    {
        $settings = AppSetting::getAllSettings();

        // Eager load category and recipe ingredients with inventory items
        $menuItem->load(['category', 'recipes.inventoryItem']);

        // Fetch related dishes from the same category or general available dishes
        $relatedItems = MenuItem::where('category_id', $menuItem->category_id)
            ->where('id', '!=', $menuItem->id)
            ->where('is_available', true)
            ->with(['category', 'recipes.inventoryItem'])
            ->take(3)
            ->get();

        if ($relatedItems->isEmpty()) {
            $relatedItems = MenuItem::where('id', '!=', $menuItem->id)
                ->where('is_available', true)
                ->with(['category', 'recipes.inventoryItem'])
                ->take(3)
                ->get();
        }

        return Inertia::render('recipe-detail', [
            'item' => $menuItem,
            'relatedItems' => $relatedItems,
            'settings' => [
                'brand_name' => $settings['brand_name'] ?? 'NOCTURNE',
                'brand_logo' => $settings['brand_logo'] ?? null,
                'brand_icon' => $settings['brand_icon'] ?? null,
                'tagline' => $settings['tagline'] ?? 'CRAVINGS NEVER SLEEP',
                'phone' => $settings['phone'] ?? '+8801712345678',
                'email' => $settings['email'] ?? 'contact@restaurant.com',
                'address' => $settings['address'] ?? '889 Midnight Ave, Suite B, Downtown District',
                'opening_hours' => $settings['opening_hours'] ?? 'Mon - Sun: 8:00 PM - 4:00 AM',
                'default_currency' => $settings['default_currency'] ?? '৳',
                'social_facebook' => $settings['social_facebook'] ?? 'https://facebook.com',
                'social_instagram' => $settings['social_instagram'] ?? 'https://instagram.com',
                'social_twitter' => $settings['social_twitter'] ?? 'https://twitter.com',
                'footer_text' => $settings['footer_text'] ?? '© 2026 NOCTURNE AFTER HOURS. All Rights Reserved.',
            ],
        ]);
    }
}
