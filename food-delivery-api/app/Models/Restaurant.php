<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    const ALLOWED_CITIES = [
        'kenitra',
        'Rabat',
        'Casa',
        'tanger'
    ];
    protected $fillable = [
        'name',
        'address',
        'phone',
        'user_id' ,
        'city',

    ];



    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function menus()
    {
        return $this->hasMany(Menu::class);
    }

}
