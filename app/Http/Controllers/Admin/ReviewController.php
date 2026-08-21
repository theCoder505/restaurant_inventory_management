<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        $reviews = Review::orderBy('order_index', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('admin/reviews/index', [
            'reviews' => $reviews,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_title' => 'nullable|string|max:255',
            'avatar_initials' => 'nullable|string|max:10',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
            'is_active' => 'boolean',
            'order_index' => 'nullable|integer',
        ]);

        if (empty($validated['avatar_initials'])) {
            $validated['avatar_initials'] = strtoupper(substr($validated['customer_name'], 0, 2));
        }

        $review = Review::create($validated);

        AuditLogService::log("Created new customer review for {$review->customer_name}", "reviews");

        return redirect()->back()->with('success', 'Customer review added successfully.');
    }

    public function update(Request $request, Review $review)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_title' => 'nullable|string|max:255',
            'avatar_initials' => 'nullable|string|max:10',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
            'is_active' => 'boolean',
            'order_index' => 'nullable|integer',
        ]);

        $review->update($validated);

        AuditLogService::log("Updated customer review for {$review->customer_name}", "reviews");

        return redirect()->back()->with('success', 'Review updated successfully.');
    }

    public function destroy(Review $review)
    {
        $name = $review->customer_name;
        $review->delete();

        AuditLogService::log("Deleted customer review for {$name}", "reviews");

        return redirect()->back()->with('success', 'Review deleted successfully.');
    }

    public function toggleActive(Review $review)
    {
        $review->is_active = !$review->is_active;
        $review->save();

        return redirect()->back()->with('success', 'Review status updated.');
    }
}
