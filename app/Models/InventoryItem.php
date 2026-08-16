<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'category_id',
        'unit',
        'current_stock',
        'min_stock_threshold',
        'cost_per_unit',
        'expiry_date',
        'notes',
    ];

    protected $casts = [
        'current_stock' => 'float',
        'min_stock_threshold' => 'float',
        'cost_per_unit' => 'float',
        'expiry_date' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }

    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->current_stock <= $this->min_stock_threshold;
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        if (!$this->expiry_date) {
            return false;
        }
        return $this->expiry_date->diffInDays(now(), false) >= -7;
    }
}
