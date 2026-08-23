<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'order_status')) {
                    $table->enum('order_status', ['processing', 'ready', 'served', 'completed', 'cancelled'])
                          ->default('processing')
                          ->after('order_type');
                }
            });

            // Set existing orders to 'completed' so historical sales remain intact
            DB::table('orders')->whereNull('order_status')->orWhere('order_status', '')->update(['order_status' => 'completed']);
        }

        if (Schema::hasTable('order_items')) {
            Schema::table('order_items', function (Blueprint $table) {
                if (!Schema::hasColumn('order_items', 'item_status')) {
                    $table->enum('item_status', ['processing', 'ready', 'served'])
                          ->default('processing')
                          ->after('quantity');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('orders') && Schema::hasColumn('orders', 'order_status')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('order_status');
            });
        }

        if (Schema::hasTable('order_items') && Schema::hasColumn('order_items', 'item_status')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropColumn('item_status');
            });
        }
    }
};
