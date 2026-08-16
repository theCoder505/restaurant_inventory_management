<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'inventory_item_id',
        'quantity',
        'unit',
        'unit_price',
        'total_price',
        'expiry_date',
    ];

    protected $casts = [
        'quantity' => 'float',
        'unit_price' => 'float',
        'total_price' => 'float',
        'expiry_date' => 'date',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
