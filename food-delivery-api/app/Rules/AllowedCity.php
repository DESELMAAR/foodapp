<?php

namespace App\Rules;

use App\Models\Restaurant;
use Illuminate\Contracts\Validation\Rule;

class AllowedCity implements Rule
{
    public function passes($attribute, $value)
    {
        return in_array($value, Restaurant::ALLOWED_CITIES);
    }

    public function message()
    {
        return 'The :attribute must be one of: '.implode(', ', Restaurant::ALLOWED_CITIES);
    }
}