<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'month_year',
        'base_salary',
        'bonus',
        'deduction',
        'net_pay',
        'payment_status',
        'payment_date',
        'notes',
    ];

    protected $casts = [
        'base_salary' => 'float',
        'bonus' => 'float',
        'deduction' => 'float',
        'net_pay' => 'float',
        'payment_date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
