<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'role_title',
        'phone',
        'email',
        'address',
        'joining_date',
        'base_salary',
        'status',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'base_salary' => 'float',
    ];

    public function salaries()
    {
        return $this->hasMany(Salary::class);
    }

    public function attendanceLogs()
    {
        return $this->hasMany(AttendanceLog::class);
    }
}
