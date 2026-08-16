<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category_id',
        'description',
        'price',
        'cost_price',
        'image_path',
        'is_available',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'float',
        'cost_price' => 'float',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getProfitMarginAttribute(): float
    {
        if ($this->price <= 0) return 0;
        return round((($this->price - $this->cost_price) / $this->price) * 100, 1);
    }
}
