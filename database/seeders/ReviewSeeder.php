<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            [
                'customer_name' => 'John D.',
                'customer_title' => 'Verified Diner • Night Owl',
                'avatar_initials' => 'JD',
                'rating' => 5,
                'comment' => 'The best burger I\'ve had at 3 AM. It doesn\'t feel like regular fast food—it feels like a complete gastronomic event. Fresh, piping hot, and full of rich flavor.',
                'order_index' => 1,
                'is_active' => true,
            ],
            [
                'customer_name' => 'Sarah M.',
                'customer_title' => 'Verified Diner • Creative Director',
                'avatar_initials' => 'SM',
                'rating' => 5,
                'comment' => 'Finally, a restaurant that takes delivery and midnight recipes seriously. The truffle fries were still crispy and the brioche burger buns were toasted to perfection.',
                'order_index' => 2,
                'is_active' => true,
            ],
            [
                'customer_name' => 'Tanvir Ahmed',
                'customer_title' => 'VIP Lounge Member',
                'avatar_initials' => 'TA',
                'rating' => 5,
                'comment' => 'The Wagyu Smash Burger paired with their secret sauce is legendary. Delivered in 14 minutes with thermal lock packaging intact. Truly impressive speed and quality.',
                'order_index' => 3,
                'is_active' => true,
            ],
            [
                'customer_name' => 'Elena Rostova',
                'customer_title' => 'Food & Lifestyle Critic',
                'avatar_initials' => 'ER',
                'rating' => 5,
                'comment' => 'An after-hours atmosphere unlike any other in the city. The ambient neon aesthetic, pulsating beats, and artisanal culinary recipes make this our team\'s midnight headquarters.',
                'order_index' => 4,
                'is_active' => true,
            ],
            [
                'customer_name' => 'Rashid Karim',
                'customer_title' => 'Tech Founder • Midnight Diner',
                'avatar_initials' => 'RK',
                'rating' => 4,
                'comment' => 'Exceptional artisan pizza crust with authentic charred edges. Delivery was slightly delayed during peak Friday midnight rush, but the flavor was 100% worth every single minute.',
                'order_index' => 5,
                'is_active' => true,
            ],
            [
                'customer_name' => 'Ayesha Siddiqua',
                'customer_title' => 'Verified Gourmet Foodie',
                'avatar_initials' => 'AS',
                'rating' => 5,
                'comment' => 'The Smoked Brisket Sandwich with spicy chimichurri sauce is an absolute masterpiece. You can tell they use prime aged cuts and real hickory smoke.',
                'order_index' => 6,
                'is_active' => true,
            ],
            [
                'customer_name' => 'Marcus Vance',
                'customer_title' => 'Music Producer',
                'avatar_initials' => 'MV',
                'rating' => 5,
                'comment' => 'Ordered for our late-night studio session at 2:30 AM. Everything was piping hot, beautifully presented, and energized the entire crew. Unbeatable nocturnal service.',
                'order_index' => 7,
                'is_active' => true,
            ],
            [
                'customer_name' => 'Nabila Chowdhury',
                'customer_title' => 'Regular Patron',
                'avatar_initials' => 'NC',
                'rating' => 5,
                'comment' => 'The physical lounge is stunning and the WhatsApp ordering process is seamless. The Korean Glazed Chicken wings have just the right amount of fiery sweetness.',
                'order_index' => 8,
                'is_active' => true,
            ],
            [
                'customer_name' => 'David Sterling',
                'customer_title' => 'Executive Chef Enthusiast',
                'avatar_initials' => 'DS',
                'rating' => 5,
                'comment' => 'The attention to detail in their recipes is second to none. Perfectly balanced marinades, high heat sear marks, and gourmet ingredients that elevate midnight fast food.',
                'order_index' => 9,
                'is_active' => true,
            ],
            [
                'customer_name' => 'Zubair Hossain',
                'customer_title' => 'Elite Syndicate Member',
                'avatar_initials' => 'ZH',
                'rating' => 5,
                'comment' => 'Membership perks are real—priority dispatch routing, exclusive off-menu tastings, and reserved table seating. The gold standard for night owls in Dhaka.',
                'order_index' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($reviews as $reviewData) {
            Review::updateOrCreate(
                ['customer_name' => $reviewData['customer_name']],
                $reviewData
            );
        }
    }
}
