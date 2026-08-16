<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false; // Custom created_at timestamp

    protected $fillable = [
        'user_id',
        'user_name',
        'action',
        'module',
        'ip_address',
        'details',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(Admin::class, 'user_id');
    }
}
