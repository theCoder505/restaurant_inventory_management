<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'customer_title',
        'avatar_initials',
        'avatar_url',
        'rating',
        'comment',
        'is_active',
        'order_index',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_active' => 'boolean',
        'order_index' => 'integer',
    ];
}
