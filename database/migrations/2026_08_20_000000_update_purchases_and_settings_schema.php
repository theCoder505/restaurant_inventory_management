<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->string('ingredient_name')->nullable()->after('purchase_id');
            $table->decimal('used_amount', 12, 2)->default(0)->after('quantity');
            $table->foreignId('inventory_item_id')->nullable()->change();
        });

        // Insert default setting for expiry warning threshold if not present
        if (!DB::table('app_settings')->where('key', 'expiry_warning_threshold')->exists()) {
            DB::table('app_settings')->insert([
                'key' => 'expiry_warning_threshold',
                'value' => '80',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->dropColumn(['ingredient_name', 'used_amount']);
        });

        DB::table('app_settings')->where('key', 'expiry_warning_threshold')->delete();
    }
};
