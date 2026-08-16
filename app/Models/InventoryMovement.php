<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasFactory;

    public $timestamps = false; // We use custom created_at column

    protected $fillable = [
        'inventory_item_id',
        'type',
        'quantity',
        'unit',
        'cost_per_unit',
        'reference_type',
        'reference_id',
        'notes',
        'created_at',
    ];

    protected $casts = [
        'quantity' => 'float',
        'cost_per_unit' => 'float',
        'created_at' => 'datetime',
    ];

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
