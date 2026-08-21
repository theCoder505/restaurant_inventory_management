<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\AppSetting;
use App\Models\Category;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Recipe;
use App\Models\Salary;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        $admin = Admin::firstOrCreate(
            ['email' => 'admin@restaurant.com'],
            [
                'name' => 'Restaurant Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '+8801712345678',
            ]
        );

        // 2. App Settings
        $settings = [
            'brand_name' => 'Le Gourmet Bistro',
            'brand_logo' => '/uploads/branding/logo.svg',
            'brand_icon' => '/uploads/branding/icon.svg',
            'tagline' => 'Exquisite Culinary Excellence & Artisan Cuisine',
            'about_text' => 'Welcome to Le Gourmet Bistro. Founded in 2020, we take pride in serving farm-to-table artisan dishes, freshly prepared by master chefs using premium local ingredients.',
            'phone' => '+8801712345678',
            'email' => 'contact@legourmetbistro.com',
            'notification_email' => 'admin@legourmetbistro.com',
            'address' => '45 Artisan Boulevard, Gulshan 2, Dhaka 1212',
            'opening_hours' => 'Mon - Sun: 11:00 AM - 11:00 PM',
            'default_currency' => '৳',
            'tax_percentage' => '5.0',
            'low_stock_threshold_default' => '5',
            'google_maps_embed' => '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.045610815777!2d90.4132!3d23.7915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ3JzI5LjQiTiA5MMKwMjQnNDcuNSJF!5e0!3m2!1sen!2sbd!4v1620000000000!5m2!1sen!2sbd" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            'social_facebook' => 'https://facebook.com',
            'social_instagram' => 'https://instagram.com',
            'social_twitter' => 'https://twitter.com',
            'terms_conditions' => '1. Prices include applicable government taxes unless specified otherwise. 2. Please notify staff of food allergies before ordering.',
            'privacy_policy' => 'We treat all customer billing and contact information with strict privacy and never share data with third parties.',
            'footer_text' => '© 2026 Le Gourmet Bistro. All Rights Reserved.',
        ];

        foreach ($settings as $key => $val) {
            AppSetting::setByKey($key, $val);
        }

        // 3. Categories
        $invCategories = [
            'Vegetables & Produce' => Category::create(['name' => 'Vegetables & Produce', 'type' => 'inventory', 'description' => 'Fresh garden produce']),
            'Meat & Poultry' => Category::create(['name' => 'Meat & Poultry', 'type' => 'inventory', 'description' => 'Beef, chicken, lamb']),
            'Dairy & Cheese' => Category::create(['name' => 'Dairy & Cheese', 'type' => 'inventory', 'description' => 'Milk, butter, mozzarella, cream']),
            'Dry Goods & Grains' => Category::create(['name' => 'Dry Goods & Grains', 'type' => 'inventory', 'description' => 'Flour, rice, spices, oil']),
            'Beverages & Coffee' => Category::create(['name' => 'Beverages & Coffee', 'type' => 'inventory', 'description' => 'Coffee beans, syrup, soft drinks']),
            'Packaging & Supplies' => Category::create(['name' => 'Packaging & Supplies', 'type' => 'inventory', 'description' => 'Boxes, cups, napkins']),
        ];

        $menuCategories = [
            'Appetizers' => Category::create(['name' => 'Appetizers & Starters', 'type' => 'menu', 'description' => 'Light savory starters']),
            'Main Course' => Category::create(['name' => 'Chef Main Courses', 'type' => 'menu', 'description' => 'Signature main dishes']),
            'Desserts' => Category::create(['name' => 'Artisan Desserts', 'type' => 'menu', 'description' => 'Sweet treats']),
            'Beverages' => Category::create(['name' => 'Handcrafted Beverages', 'type' => 'menu', 'description' => 'Hot coffee & cold drinks']),
        ];

        $expCategories = [
            'Rent' => Category::create(['name' => 'Rent & Facility', 'type' => 'expense']),
            'Utilities' => Category::create(['name' => 'Electricity, Gas & Water', 'type' => 'expense']),
            'Internet' => Category::create(['name' => 'Internet & Phone', 'type' => 'expense']),
            'Marketing' => Category::create(['name' => 'Marketing & Promotions', 'type' => 'expense']),
            'Repairs' => Category::create(['name' => 'Equipment Repairs', 'type' => 'expense']),
            'Misc' => Category::create(['name' => 'Miscellaneous', 'type' => 'expense']),
        ];

        // 4. Suppliers
        $supBazar = Supplier::create([
            'name' => 'Local City Bazar Vendor',
            'contact_person' => 'Rahim Miah',
            'phone' => '+8801811111111',
            'notes' => 'Daily local market fresh vegetables purchase',
        ]);

        $supPoultry = Supplier::create([
            'name' => 'Fresh Farm Meats Co.',
            'contact_person' => 'Tariq Hassan',
            'phone' => '+8801822222222',
            'email' => 'sales@freshfarmmeats.com',
        ]);

        $supDairy = Supplier::create([
            'name' => 'Golden Dairy Products',
            'contact_person' => 'Salma Begum',
            'phone' => '+8801833333333',
        ]);

        // 5. Inventory Items
        $invItems = [
            'chicken' => InventoryItem::create(['name' => 'Chicken Breast', 'sku' => 'ING-001', 'category_id' => $invCategories['Meat & Poultry']->id, 'unit' => 'kg', 'current_stock' => 25.5, 'min_stock_threshold' => 5, 'cost_per_unit' => 6.50, 'expiry_date' => now()->addDays(5)]),
            'beef' => InventoryItem::create(['name' => 'Prime Ground Beef', 'sku' => 'ING-002', 'category_id' => $invCategories['Meat & Poultry']->id, 'unit' => 'kg', 'current_stock' => 18.0, 'min_stock_threshold' => 4, 'cost_per_unit' => 9.00, 'expiry_date' => now()->addDays(4)]),
            'tomatoes' => InventoryItem::create(['name' => 'Fresh Tomatoes', 'sku' => 'ING-003', 'category_id' => $invCategories['Vegetables & Produce']->id, 'unit' => 'kg', 'current_stock' => 15.0, 'min_stock_threshold' => 3, 'cost_per_unit' => 1.80, 'expiry_date' => now()->addDays(6)]),
            'mozzarella' => InventoryItem::create(['name' => 'Mozzarella Cheese', 'sku' => 'ING-004', 'category_id' => $invCategories['Dairy & Cheese']->id, 'unit' => 'kg', 'current_stock' => 10.0, 'min_stock_threshold' => 2, 'cost_per_unit' => 8.00, 'expiry_date' => now()->addDays(14)]),
            'flour' => InventoryItem::create(['name' => 'All-Purpose Flour', 'sku' => 'ING-005', 'category_id' => $invCategories['Dry Goods & Grains']->id, 'unit' => 'kg', 'current_stock' => 40.0, 'min_stock_threshold' => 10, 'cost_per_unit' => 1.10]),
            'oil' => InventoryItem::create(['name' => 'Cooking Olive Oil', 'sku' => 'ING-006', 'category_id' => $invCategories['Dry Goods & Grains']->id, 'unit' => 'l', 'current_stock' => 30.0, 'min_stock_threshold' => 5, 'cost_per_unit' => 4.50]),
            'coffee' => InventoryItem::create(['name' => 'Arabica Coffee Beans', 'sku' => 'ING-007', 'category_id' => $invCategories['Beverages & Coffee']->id, 'unit' => 'kg', 'current_stock' => 8.0, 'min_stock_threshold' => 2, 'cost_per_unit' => 18.00]),
            'boxes' => InventoryItem::create(['name' => 'Takeaway Food Box', 'sku' => 'SUP-001', 'category_id' => $invCategories['Packaging & Supplies']->id, 'unit' => 'piece', 'current_stock' => 150, 'min_stock_threshold' => 30, 'cost_per_unit' => 0.25]),
        ];

        // 6. Menu Items & Recipes
        $dish1 = MenuItem::create([
            'name' => 'Gourmet Chicken Burger',
            'category_id' => $menuCategories['Main Course']->id,
            'description' => 'Grilled seasoned chicken patty, lettuce, tomato, house sauce on brioche bun.',
            'price' => 12.50,
            'is_available' => true,
            'is_featured' => true,
        ]);
        Recipe::create(['menu_item_id' => $dish1->id, 'inventory_item_id' => $invItems['chicken']->id, 'quantity' => 200, 'unit' => 'g']);
        Recipe::create(['menu_item_id' => $dish1->id, 'inventory_item_id' => $invItems['tomatoes']->id, 'quantity' => 50, 'unit' => 'g']);

        $dish2 = MenuItem::create([
            'name' => 'Artisan Margherita Pizza',
            'category_id' => $menuCategories['Main Course']->id,
            'description' => 'Wood-fired crust, San Marzano tomato sauce, fresh mozzarella & basil.',
            'price' => 14.00,
            'is_available' => true,
            'is_featured' => true,
        ]);
        Recipe::create(['menu_item_id' => $dish2->id, 'inventory_item_id' => $invItems['flour']->id, 'quantity' => 250, 'unit' => 'g']);
        Recipe::create(['menu_item_id' => $dish2->id, 'inventory_item_id' => $invItems['mozzarella']->id, 'quantity' => 150, 'unit' => 'g']);
        Recipe::create(['menu_item_id' => $dish2->id, 'inventory_item_id' => $invItems['tomatoes']->id, 'quantity' => 100, 'unit' => 'g']);

        $dish3 = MenuItem::create([
            'name' => 'Double Cheeseburger',
            'category_id' => $menuCategories['Main Course']->id,
            'description' => 'Two ground beef patties, melted mozzarella cheese, pickles & special glaze.',
            'price' => 15.50,
            'is_available' => true,
            'is_featured' => true,
        ]);
        Recipe::create(['menu_item_id' => $dish3->id, 'inventory_item_id' => $invItems['beef']->id, 'quantity' => 250, 'unit' => 'g']);
        Recipe::create(['menu_item_id' => $dish3->id, 'inventory_item_id' => $invItems['mozzarella']->id, 'quantity' => 80, 'unit' => 'g']);

        $dish4 = MenuItem::create([
            'name' => 'Double Espresso',
            'category_id' => $menuCategories['Beverages']->id,
            'description' => 'Rich, aromatic double shot of 100% Arabica roast beans.',
            'price' => 4.50,
            'is_available' => true,
            'is_featured' => false,
        ]);
        Recipe::create(['menu_item_id' => $dish4->id, 'inventory_item_id' => $invItems['coffee']->id, 'quantity' => 18, 'unit' => 'g']);

        // 7. Initial Purchase Entry
        $po = Purchase::create([
            'purchase_number' => 'PO-20260816-001',
            'supplier_id' => $supPoultry->id,
            'purchase_date' => now()->format('Y-m-d'),
            'status' => 'received',
            'total_amount' => 195.00,
            'notes' => 'Weekly poultry delivery',
            'created_by' => $admin->id,
        ]);
        PurchaseItem::create([
            'purchase_id' => $po->id,
            'inventory_item_id' => $invItems['chicken']->id,
            'quantity' => 30,
            'unit' => 'kg',
            'unit_price' => 6.50,
            'total_price' => 195.00,
            'expiry_date' => now()->addDays(7),
        ]);

        // 8. Initial Sales Orders
        $ord1 = Order::create([
            'order_number' => 'INV-20260816-0001',
            'order_type' => 'dine_in',
            'table_number' => 'T-04',
            'customer_name' => 'John Doe',
            'subtotal' => 26.50,
            'tax_amount' => 1.33,
            'discount_amount' => 0.00,
            'total_amount' => 27.83,
            'payment_method' => 'card',
            'payment_status' => 'paid',
            'transaction_id' => 'TXN-998811',
            'created_by' => $admin->id,
        ]);
        OrderItem::create(['order_id' => $ord1->id, 'menu_item_id' => $dish1->id, 'item_name' => $dish1->name, 'quantity' => 1, 'unit_price' => 12.50, 'total_price' => 12.50]);
        OrderItem::create(['order_id' => $ord1->id, 'menu_item_id' => $dish2->id, 'item_name' => $dish2->name, 'quantity' => 1, 'unit_price' => 14.00, 'total_price' => 14.00]);

        // 9. Initial Expenses
        Expense::create([
            'title' => 'August Restaurant Electricity Bill',
            'category_id' => $expCategories['Utilities']->id,
            'amount' => 240.00,
            'expense_date' => now()->startOfMonth()->format('Y-m-d'),
            'payment_method' => 'bKash',
            'reference_no' => 'UTIL-8822',
            'created_by' => $admin->id,
        ]);

        // 10. Employees & Salary
        $emp1 = Employee::create([
            'name' => 'Chef Alex Rivers',
            'role_title' => 'Head Chef',
            'phone' => '+8801799999999',
            'email' => 'alex@legourmetbistro.com',
            'joining_date' => '2024-01-15',
            'base_salary' => 1200.00,
            'status' => 'active',
        ]);

        $emp2 = Employee::create([
            'name' => 'Maria Santos',
            'role_title' => 'Lead Server',
            'phone' => '+8801788888888',
            'joining_date' => '2024-06-01',
            'base_salary' => 600.00,
            'status' => 'active',
        ]);

        Salary::create([
            'employee_id' => $emp1->id,
            'month_year' => '2026-07',
            'base_salary' => 1200.00,
            'bonus' => 100.00,
            'deduction' => 0.00,
            'net_pay' => 1300.00,
            'payment_status' => 'paid',
            'payment_date' => '2026-08-01',
        ]);

        $this->call(ReviewSeeder::class);
    }
}
