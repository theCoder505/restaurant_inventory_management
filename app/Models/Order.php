<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'order_type',
        'table_number',
        'customer_name',
        'customer_phone',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'payment_method',
        'payment_status',
        'transaction_id',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'discount_amount' => 'float',
        'total_amount' => 'float',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
