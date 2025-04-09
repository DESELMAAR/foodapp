<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MenuLikeController extends Controller
{
    public function like($menuId)
    {
        try {
            $user = Auth::user();
            $menu = Menu::findOrFail($menuId);

            // Check if already liked
            if ($user->likedMenus()->where('menu_id', $menuId)->exists()) {
                return response()->json([
                    'message' => 'Menu item already liked',
                    'liked' => true,
                    'likes_count' => $menu->likes()->count()
                ], 200);
            }

            $user->likedMenus()->attach($menuId);

            return response()->json([
                'message' => 'Menu item liked successfully',
                'liked' => true,
                'likes_count' => $menu->likes()->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error liking menu item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function unlike($menuId)
    {
        try {
            $user = Auth::user();
            $menu = Menu::findOrFail($menuId);

            $user->likedMenus()->detach($menuId);

            return response()->json([
                'message' => 'Menu item unliked successfully',
                'liked' => false,
                'likes_count' => $menu->likes()->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error unliking menu item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkLike($menuId)
    {
        try {
            $user = Auth::user();
            $isLiked = $user->likedMenus()->where('menu_id', $menuId)->exists();

            return response()->json([
                'liked' => $isLiked,
                'likes_count' => Menu::findOrFail($menuId)->likes()->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error checking like status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLikedMenus()
    {
        try {
            $user = Auth::user();
            $likedMenus = $user->likedMenus()
                ->with(['restaurant' => function($query) {
                    $query->select('id', 'name', 'address');
                }])
                ->select([
                    'menus.*',
                    DB::raw("CONCAT('" . url('') . "', '/storage/', menus.image_path) as image_url")
                ])
                ->get();

            return response()->json([
                'liked_menus' => $likedMenus
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching liked menus',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}