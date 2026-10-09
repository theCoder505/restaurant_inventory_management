<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('menu_items') && !\Illuminate\Support\Facades\Schema::hasColumn('menu_items', 'kitchen_code')) {
                \Illuminate\Support\Facades\Schema::table('menu_items', function ($table) {
                    $table->string('kitchen_code', 50)->nullable()->after('name');
                });
            }
            if (\Illuminate\Support\Facades\Schema::hasTable('order_items') && !\Illuminate\Support\Facades\Schema::hasColumn('order_items', 'kitchen_code')) {
                \Illuminate\Support\Facades\Schema::table('order_items', function ($table) {
                    $table->string('kitchen_code', 50)->nullable()->after('item_name');
                });
            }
            if (\Illuminate\Support\Facades\Schema::hasTable('orders') && !\Illuminate\Support\Facades\Schema::hasColumn('orders', 'discount_note')) {
                \Illuminate\Support\Facades\Schema::table('orders', function ($table) {
                    $table->string('discount_note', 255)->nullable()->after('discount_amount');
                });
            }
        } catch (\Throwable $e) {
            // Fail gracefully if database connection is not ready
        }
    }
}
