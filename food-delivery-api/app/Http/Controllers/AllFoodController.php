<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AllFoodController extends Controller
{
    /**
     * Display a listing of all menu items with restaurant information.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $query = Menu::with(['restaurant:id,name'])
                ->select('id', 'restaurant_id', 'name', 'description', 'price', 'category', 'image_path');
            
            // Apply filters if provided
            if ($request->has('category')) {
                $query->where('category', $request->input('category'));
            }

            if ($request->has('search')) {
                $searchTerm = '%' . $request->input('search') . '%';
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', $searchTerm)
                      ->orWhere('description', 'like', $searchTerm);
                });
            }

            // Apply sorting
            $sortBy = $request->input('sort_by', 'name');
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate results
            $perPage = $request->input('per_page', 15);
            $menus = $query->paginate($perPage);

            // Transform the response to include full image URL
            $menus->getCollection()->transform(function ($menu) {
                if ($menu->image_path) {
                    $menu->image_url = asset('storage/' . $menu->image_path);
                }
                return $menu;
            });

            return response()->json([
                'success' => true,
                'data' => $menus,
                'message' => 'All menu items retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching all menu items: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve menu items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get distinct food categories
     *
     * @return \Illuminate\Http\Response
     */
    public function categories()
    {
        try {
            $categories = Menu::distinct()
                ->whereNotNull('category')
                ->orderBy('category', 'asc')
                ->pluck('category');

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Food categories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching food categories: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve food categories'
            ], 500);
        }
    }
}