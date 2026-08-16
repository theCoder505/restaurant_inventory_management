<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'description'];

    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
