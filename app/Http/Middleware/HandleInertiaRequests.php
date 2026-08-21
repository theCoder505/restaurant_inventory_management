<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $brandName = AppSetting::getByKey('brand_name', config('app.name', 'Restaurant'));

        return array_merge(parent::share($request), [
            'name' => $brandName,
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'branding' => [
                'brand_name' => $brandName,
                'brand_logo' => AppSetting::getByKey('brand_logo', '/uploads/branding/logo.svg'),
                'brand_icon' => AppSetting::getByKey('brand_icon', '/uploads/branding/icon.svg'),
                'address' => AppSetting::getByKey('address', '889 Midnight Ave, Suite B, Downtown District'),
                'phone' => AppSetting::getByKey('phone', '+8801700000000'),
                'email' => AppSetting::getByKey('email', 'contact@restaurant.com'),
                'tagline' => AppSetting::getByKey('tagline', 'Exquisite Culinary Excellence & Artisan Cuisine'),
                'default_currency' => AppSetting::getByKey('default_currency', '৳'),
                'tax_percentage' => (float)AppSetting::getByKey('tax_percentage', '5.0'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'lastOrder' => fn () => $request->session()->get('lastOrder'),
            ],
        ]);
    }
}
