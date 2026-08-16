<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Admins Table (Dedicated table for Admin Authentication)
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('role')->default('admin');
            $table->string('phone')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. App Settings
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // 3. Categories (Inventory, Menu, Expense)
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['inventory', 'menu', 'expense']);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 4. Suppliers
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Inventory Items (Stock Master)
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->nullable();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('unit')->default('kg'); // kg, g, l, ml, piece, dozen, pack, box
            $table->decimal('current_stock', 12, 2)->default(0);
            $table->decimal('min_stock_threshold', 12, 2)->default(5);
            $table->decimal('cost_per_unit', 12, 2)->default(0);
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 6. Purchases (Daily Purchase Entry & POs)
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_number')->unique();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('set null');
            $table->string('supplier_name_text')->nullable(); // For local bazar purchases
            $table->date('purchase_date');
            $table->enum('status', ['draft', 'pending', 'approved', 'received'])->default('received');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->timestamps();
        });

        // 7. Purchase Items
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->decimal('quantity', 12, 2);
            $table->string('unit');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 12, 2);
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });

        // 8. Inventory Movements (Stock In/Out/Wastage/Return/Sale)
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'wastage', 'return', 'sale_deduction', 'adjustment']);
            $table->decimal('quantity', 12, 2);
            $table->string('unit');
            $table->decimal('cost_per_unit', 12, 2)->default(0);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 9. Menu Items
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('cost_price', 12, 2)->default(0); // Calculated dynamically from ingredients
            $table->string('image_path')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        // 10. Recipes (Ingredient mapping per Dish)
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('menu_items')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->decimal('quantity', 12, 2);
            $table->string('unit');
            $table->timestamps();
        });

        // 11. Orders (Sales / Invoices)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->enum('order_type', ['dine_in', 'takeaway', 'delivery'])->default('dine_in');
            $table->string('table_number')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->enum('payment_method', ['cash', 'card', 'bkash', 'nagad', 'other'])->default('cash');
            $table->enum('payment_status', ['paid', 'pending', 'cancelled'])->default('paid');
            $table->string('transaction_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->timestamps();
        });

        // 12. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('menu_item_id')->nullable()->constrained('menu_items')->onDelete('set null');
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 12, 2);
            $table->timestamps();
        });

        // 13. Expenses
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->decimal('amount', 12, 2);
            $table->date('expense_date');
            $table->string('payment_method')->default('cash');
            $table->string('reference_no')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->timestamps();
        });

        // 14. Employees
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role_title');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->date('joining_date')->nullable();
            $table->decimal('base_salary', 12, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // 15. Salaries
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('month_year'); // e.g. "2026-08"
            $table->decimal('base_salary', 12, 2);
            $table->decimal('bonus', 12, 2)->default(0);
            $table->decimal('deduction', 12, 2)->default(0);
            $table->decimal('net_pay', 12, 2);
            $table->enum('payment_status', ['paid', 'unpaid'])->default('paid');
            $table->date('payment_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 16. Attendance Logs
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'leave', 'half_day'])->default('present');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 17. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('admins')->onDelete('set null');
            $table->string('user_name')->nullable();
            $table->string('action');
            $table->string('module');
            $table->string('ip_address')->nullable();
            $table->text('details')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('attendance_logs');
        Schema::dropIfExists('salaries');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('recipes');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('purchase_items');
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('app_settings');
        Schema::dropIfExists('admins');
    }
};
