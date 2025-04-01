<?php

namespace App\Policies;

use App\Models\Restaurant;
use App\Models\User;

class RestaurantPolicy
{
    /**
     * Determine if the user can view any restaurants.
     */
    public function viewAny(User $user, Restaurant $restaurant): bool
    {
        // return true; 
        return $user->hasRole(['admin']) || $restaurant->user_id === $user->id;
        // return $user->hasRole(['admin', 'restaurant']);
        // All authenticated users can view restaurants list
    }

    /**
     * Determine if the user can view the restaurant.
     */
    public function view(User $user, Restaurant $restaurant): bool
    {
        // Users can view if they own the restaurant or are admin
        return $user->hasRole(['admin','restaurant']) || $restaurant->user_id === $user->id;
    }

    /**
     * Determine if the user can create restaurants.
     */
    public function create(User $user): bool
    {
        // Only restaurant owners and admins can create
        return $user->hasRole(['admin', 'restaurant']);
    }

    /**
     * Determine if the user can update the restaurant.
     */
    public function update(User $user, Restaurant $restaurant): bool
    {
        // Users can update if they own the restaurant or are admin
        return $user->hasRole('admin') || $restaurant->user_id === $user->id;
    }

    /**
     * Determine if the user can delete the restaurant.
     */
    public function delete(User $user, Restaurant $restaurant): bool
    {
        // Admins can delete any restaurant
        if ($user->hasRole(['admin'])) {
            return true;
        }

        // Restaurant owners can delete their own restaurants
        return $user->hasRole('restaurant') && $restaurant->user_id === $user->id;
    }
}