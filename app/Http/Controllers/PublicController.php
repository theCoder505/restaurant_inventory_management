<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Review;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    /**
     * Helper to prepare standard settings payload.
     */
    protected function getSettingsPayload(): array
    {
        $settings = AppSetting::getAllSettings();

        return [
            'brand_name' => $settings['brand_name'] ?? 'NOCTURNE',
            'brand_logo' => $settings['brand_logo'] ?? null,
            'brand_logo_dark' => $settings['brand_logo_dark'] ?? ($settings['brand_logo'] ?? null),
            'brand_icon' => $settings['brand_icon'] ?? null,
            'header_white_logo' => !isset($settings['header_white_logo']) || in_array($settings['header_white_logo'], ['1', 'true', true, 1], true),
            'tagline' => $settings['tagline'] ?? 'CRAVINGS NEVER SLEEP',
            'about_text' => $settings['about_text'] ?? 'Step into a world where culinary excellence meets nightlife seduction. Nocturne isn\'t just a meal; it\'s a sensory experience designed for those who thrive when the sun goes down.',
            'phone' => $settings['phone'] ?? '+8801712345678',
            'whatsapp_number' => $settings['whatsapp_number'] ?? ($settings['phone'] ?? '+8801712345678'),
            'enable_whatsapp' => !isset($settings['enable_whatsapp']) || in_array($settings['enable_whatsapp'], ['1', 'true', true, 1], true),
            'email' => $settings['email'] ?? 'contact@restaurant.com',
            'address' => $settings['address'] ?? '889 Midnight Ave, Suite B, Downtown District',
            'opening_hours' => $settings['opening_hours'] ?? "Saturday - Wednesday: 8:00 PM - 4:00 AM\nThursday - Friday: 8:00 PM - 6:00 AM",
            'logo_url' => $settings['logo_url'] ?? null,
            'default_currency' => $settings['default_currency'] ?? '৳',
            'week_start_day' => $settings['week_start_day'] ?? 'saturday',
            'google_maps_embed' => $settings['google_maps_embed'] ?? '',
            'social_facebook' => $settings['social_facebook'] ?? 'https://facebook.com',
            'social_instagram' => $settings['social_instagram'] ?? 'https://instagram.com',
            'social_twitter' => $settings['social_twitter'] ?? 'https://twitter.com',
            'terms_conditions' => $settings['terms_conditions'] ?? '1. Prices include applicable taxes unless specified otherwise. 2. Please notify staff of food allergies before placing orders.',
            'privacy_policy' => $settings['privacy_policy'] ?? 'We respect your privacy and process customer order information strictly for billing, preparation, and delivery purposes.',
            'footer_text' => $settings['footer_text'] ?? '© 2026 NOCTURNE AFTER HOURS. All Rights Reserved.',
            // Surface landing background images
            'hero_bg_image' => $settings['hero_bg_image'] ?? null,
            'atmosphere_image' => $settings['atmosphere_image'] ?? null,
            'vip_lounge_image' => $settings['vip_lounge_image'] ?? null,
        ];
    }

    /**
     * Display the public restaurant landing page.
     */
    public function index(): Response
    {
        $menuCategories = Category::where('type', 'menu')
            ->with(['menuItems' => function ($query) {
                $query->where('is_available', true)->with(['category', 'recipes.inventoryItem']);
            }])
            ->get();

        $featuredItems = MenuItem::where('is_available', true)
            ->where('is_featured', true)
            ->with(['category', 'recipes.inventoryItem'])
            ->get();

        // If no featured items are explicitly marked, grab the first 4 available dishes as highlights
        if ($featuredItems->isEmpty()) {
            $featuredItems = MenuItem::where('is_available', true)
                ->with(['category', 'recipes.inventoryItem'])
                ->take(4)
                ->get();
        }

        // Fetch dynamic reviews from database with fallback
        try {
            $reviews = Review::where('is_active', true)
                ->orderBy('order_index', 'asc')
                ->get();
        } catch (\Exception $e) {
            $reviews = collect();
        }

        if ($reviews->isEmpty()) {
            $reviews = collect([
                ['customer_name' => 'John D.', 'customer_title' => 'Verified Diner • Night Owl', 'avatar_initials' => 'JD', 'rating' => 5, 'comment' => 'The best burger I\'ve had at 3 AM. It doesn\'t feel like regular fast food—it feels like a complete gastronomic event. Fresh, piping hot, and full of rich flavor.'],
                ['customer_name' => 'Sarah M.', 'customer_title' => 'Verified Diner • Creative Director', 'avatar_initials' => 'SM', 'rating' => 5, 'comment' => 'Finally, a restaurant that takes delivery and midnight recipes seriously. The truffle fries were still crispy and the brioche burger buns were toasted to perfection.'],
                ['customer_name' => 'Tanvir Ahmed', 'customer_title' => 'VIP Lounge Member', 'avatar_initials' => 'TA', 'rating' => 5, 'comment' => 'The Wagyu Smash Burger paired with their secret sauce is legendary. Delivered in 14 minutes with thermal lock packaging intact. Truly impressive speed and quality.'],
                ['customer_name' => 'Elena Rostova', 'customer_title' => 'Food & Lifestyle Critic', 'avatar_initials' => 'ER', 'rating' => 5, 'comment' => 'An after-hours atmosphere unlike any other in the city. The ambient neon aesthetic, pulsating beats, and artisanal culinary recipes make this our team\'s midnight headquarters.'],
                ['customer_name' => 'Rashid Karim', 'customer_title' => 'Tech Founder • Midnight Diner', 'avatar_initials' => 'RK', 'rating' => 4, 'comment' => 'Exceptional artisan pizza crust with authentic charred edges. Delivery was slightly delayed during peak Friday midnight rush, but the flavor was 100% worth every single minute.'],
                ['customer_name' => 'Ayesha Siddiqua', 'customer_title' => 'Verified Gourmet Foodie', 'avatar_initials' => 'AS', 'rating' => 5, 'comment' => 'The Smoked Brisket Sandwich with spicy chimichurri sauce is an absolute masterpiece. You can tell they use prime aged cuts and real hickory smoke.'],
                ['customer_name' => 'Marcus Vance', 'customer_title' => 'Music Producer', 'avatar_initials' => 'MV', 'rating' => 5, 'comment' => 'Ordered for our late-night studio session at 2:30 AM. Everything was piping hot, beautifully presented, and energized the entire crew. Unbeatable nocturnal service.'],
                ['customer_name' => 'Nabila Chowdhury', 'customer_title' => 'Regular Patron', 'avatar_initials' => 'NC', 'rating' => 5, 'comment' => 'The physical lounge is stunning and the WhatsApp ordering process is seamless. The Korean Glazed Chicken wings have just the right amount of fiery sweetness.'],
                ['customer_name' => 'David Sterling', 'customer_title' => 'Executive Chef Enthusiast', 'avatar_initials' => 'DS', 'rating' => 5, 'comment' => 'The attention to detail in their recipes is second to none. Perfectly balanced marinades, high heat sear marks, and gourmet ingredients that elevate midnight fast food.'],
                ['customer_name' => 'Zubair Hossain', 'customer_title' => 'Elite Syndicate Member', 'avatar_initials' => 'ZH', 'rating' => 5, 'comment' => 'Membership perks are real—priority dispatch routing, exclusive off-menu tastings, and reserved table seating. The gold standard for night owls in Dhaka.'],
            ]);
        }

        return Inertia::render('welcome', [
            'settings' => $this->getSettingsPayload(),
            'menuCategories' => $menuCategories,
            'featuredItems' => $featuredItems,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Display all recipes collection page.
     */
    public function recipes(): Response
    {
        $menuCategories = Category::where('type', 'menu')
            ->with(['menuItems' => function ($query) {
                $query->where('is_available', true)->with(['category', 'recipes.inventoryItem']);
            }])
            ->get();

        $allDishes = MenuItem::where('is_available', true)
            ->with(['category', 'recipes.inventoryItem'])
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('recipes', [
            'settings' => $this->getSettingsPayload(),
            'menuCategories' => $menuCategories,
            'allDishes' => $allDishes,
        ]);
    }

    /**
     * Display a specific recipe / dish detail page.
     */
    public function recipeDetail(MenuItem $menuItem, ?string $slug = null): Response
    {
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
            'settings' => $this->getSettingsPayload(),
        ]);
    }
}
