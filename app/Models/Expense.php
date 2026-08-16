<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category_id',
        'amount',
        'expense_date',
        'payment_method',
        'reference_no',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'float',
        'expense_date' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }
}
