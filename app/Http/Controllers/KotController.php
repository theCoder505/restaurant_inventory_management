<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AppSetting;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\AuditLogService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class KotController extends Controller
{
    /**
     * Show dedicated Kitchen Portal Login page.
     */
    public function showLogin(Request $request)
    {
        if (Auth::check()) {
            return redirect()->route('kot.index');
        }

        $branding = [
            'brand_name' => AppSetting::getByKey('brand_name', 'NOCTURNE'),
            'brand_logo' => AppSetting::getByKey('brand_logo', '/uploads/branding/logo.svg'),
            'brand_logo_dark' => AppSetting::getByKey('brand_logo_dark', AppSetting::getByKey('brand_logo', '/uploads/branding/logo.svg')),
            'brand_icon' => AppSetting::getByKey('brand_icon', '/uploads/branding/icon.svg'),
            'tagline' => AppSetting::getByKey('tagline', 'Kitchen Order Ticket Terminal'),
        ];

        return Inertia::render('kitchen/login', [
            'branding' => $branding,
            'status' => $request->session()->get('status'),
            'defaultUsername' => AppSetting::getByKey('kot_username', 'kitchen'),
        ]);
    }

    /**
     * Handle Kitchen Portal authentication.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = trim($credentials['login']);
        $password = $credentials['password'];

        $targetEmail = $loginInput;

        // Check if matching KOT username in AppSetting
        $kotUsername = AppSetting::getByKey('kot_username', 'kitchen');
        $kotEmail = AppSetting::getByKey('kot_email', 'kitchen@restaurant.com');

        if (strtolower($loginInput) === strtolower($kotUsername)) {
            $targetEmail = $kotEmail;
        } else {
            // Check if user exists by email or name
            $matchedAdmin = Admin::where('email', $loginInput)
                ->orWhere('name', $loginInput)
                ->first();

            if ($matchedAdmin) {
                $targetEmail = $matchedAdmin->email;
            }
        }

        if (!Auth::attempt(['email' => $targetEmail, 'password' => $password], $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'login' => 'Invalid Kitchen User ID or Password. Please check your credentials configured in App Settings.',
            ]);
        }

        $request->session()->regenerate();
        AuditLogService::log("Kitchen staff logged into Kitchen Display System", "kot");

        return redirect()->intended(route('kot.index'))->with('success', 'Logged in to Kitchen Display Terminal.');
    }

    /**
     * Log out from Kitchen Portal.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('kot.login')->with('success', 'You have been logged out of the Kitchen Display Terminal.');
    }

    /**
     * Update Kitchen Employee Profile and Login Credentials.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        /** @var Admin $user */
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('kot.login');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'kot_username' => 'nullable|string|max:100',
            'email' => 'required|email|max:255|unique:admins,email,' . $user->id,
            'phone' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:4|max:100',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // If this user is kitchen role or the primary kot account, update AppSettings
        if ($user->role === 'kitchen' || $user->email === AppSetting::getByKey('kot_email')) {
            if (!empty($validated['kot_username'])) {
                AppSetting::setByKey('kot_username', $validated['kot_username']);
            }
            AppSetting::setByKey('kot_email', $validated['email']);
            if (!empty($validated['password'])) {
                AppSetting::setByKey('kot_password', $validated['password']);
            }
        }

        AuditLogService::log("Kitchen staff ({$user->name}) updated portal profile details", "kot");

        return redirect()->back()->with('success', 'Kitchen staff details and credentials updated successfully.');
    }

    /**
     * Display the Kitchen Order Ticket (KOT) panel.
     */
    public function index(Request $request): Response
    {
        $currency = AppSetting::getByKey('default_currency', '৳');

        $activeOrders = Order::with(['items.menuItem', 'creator'])
            ->whereIn('order_status', ['processing', 'ready', 'served'])
            ->orderBy('created_at', 'asc')
            ->get();

        $completedToday = Order::with(['items.menuItem', 'creator'])
            ->where('order_status', 'completed')
            ->whereDate('created_at', Carbon::today())
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $stats = [
            'total_active' => $activeOrders->count(),
            'processing_count' => $activeOrders->where('order_status', 'processing')->count(),
            'ready_count' => $activeOrders->where('order_status', 'ready')->count(),
            'served_count' => $activeOrders->where('order_status', 'served')->count(),
            'completed_today' => $completedToday->count(),
        ];

        $branding = [
            'brand_name' => AppSetting::getByKey('brand_name', 'Restaurant'),
            'brand_logo' => AppSetting::getByKey('brand_logo', '/uploads/branding/logo.svg'),
            'brand_icon' => AppSetting::getByKey('brand_icon', '/uploads/branding/icon.svg'),
            'default_currency' => $currency,
        ];

        return Inertia::render('kitchen/index', [
            'activeOrders' => $activeOrders,
            'completedToday' => $completedToday,
            'stats' => $stats,
            'branding' => $branding,
            'currency' => $currency,
            'currentUser' => Auth::user(),
            'kotUsername' => AppSetting::getByKey('kot_username', 'kitchen'),
        ]);
    }

    /**
     * Real-time JSON polling endpoint for live KOT display updates.
     */
    public function getOrders(Request $request): JsonResponse
    {
        $activeOrders = Order::with(['items.menuItem', 'creator'])
            ->whereIn('order_status', ['processing', 'ready', 'served'])
            ->orderBy('created_at', 'asc')
            ->get();

        $completedCount = Order::where('order_status', 'completed')
            ->whereDate('created_at', Carbon::today())
            ->count();

        $stats = [
            'total_active' => $activeOrders->count(),
            'processing_count' => $activeOrders->where('order_status', 'processing')->count(),
            'ready_count' => $activeOrders->where('order_status', 'ready')->count(),
            'served_count' => $activeOrders->where('order_status', 'served')->count(),
            'completed_today' => $completedCount,
        ];

        return response()->json([
            'success' => true,
            'orders' => $activeOrders,
            'stats' => $stats,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Update order status from KOT panel or POS.
     */
    public function updateStatus(Order $order, Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:processing,ready,served,completed,cancelled',
        ]);

        $oldStatus = $order->order_status;
        $order->order_status = $validated['status'];
        if ($validated['status'] === 'completed') {
            $order->payment_status = 'paid';
        }
        $order->save();

        // Update item statuses to match if batch transitioning
        if (in_array($validated['status'], ['ready', 'served', 'completed'])) {
            $order->items()->update(['item_status' => $validated['status']]);
        } elseif ($validated['status'] === 'processing') {
            $order->items()->update(['item_status' => 'processing']);
        }

        AuditLogService::log("KOT: Order #{$order->order_number} status changed from {$oldStatus} to {$validated['status']}", "kot");

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Order #{$order->order_number} marked as {$validated['status']}",
                'order' => $order->fresh(['items', 'creator']),
            ]);
        }

        return redirect()->back()->with('success', "Order #{$order->order_number} marked as {$validated['status']}");
    }

    /**
     * Update individual item status within a KOT order.
     */
    public function updateItemStatus(Order $order, OrderItem $item, Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:processing,ready,served',
        ]);

        $item->item_status = $validated['status'];
        $item->save();

        // Check if all items in the order are now ready
        $allItems = $order->items()->get();
        $allReady = $allItems->every(fn($i) => $i->item_status === 'ready');
        $allServed = $allItems->every(fn($i) => $i->item_status === 'served');

        if ($allServed && $order->order_status !== 'served') {
            $order->order_status = 'served';
            $order->save();
        } elseif ($allReady && $order->order_status === 'processing') {
            $order->order_status = 'ready';
            $order->save();
        }

        AuditLogService::log("KOT: Item {$item->item_name} on Order #{$order->order_number} marked as {$validated['status']}", "kot");

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'item' => $item,
                'order' => $order->fresh(['items', 'creator']),
            ]);
        }

        return redirect()->back()->with('success', "Item {$item->item_name} marked as {$validated['status']}");
    }
}
