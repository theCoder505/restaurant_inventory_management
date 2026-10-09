<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('menu_items') && !Schema::hasColumn('menu_items', 'kitchen_code')) {
            Schema::table('menu_items', function (Blueprint $table) {
                $table->string('kitchen_code', 50)->nullable()->after('name');
            });
        }

        if (Schema::hasTable('order_items') && !Schema::hasColumn('order_items', 'kitchen_code')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('kitchen_code', 50)->nullable()->after('item_name');
            });
        }

        if (Schema::hasTable('orders') && !Schema::hasColumn('orders', 'discount_note')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('discount_note', 255)->nullable()->after('discount_amount');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('menu_items') && Schema::hasColumn('menu_items', 'kitchen_code')) {
            Schema::table('menu_items', function (Blueprint $table) {
                $table->dropColumn('kitchen_code');
            });
        }

        if (Schema::hasTable('order_items') && Schema::hasColumn('order_items', 'kitchen_code')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropColumn('kitchen_code');
            });
        }

        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'discount_note')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('discount_note');
            });
        }
    }
};
