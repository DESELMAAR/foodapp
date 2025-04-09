<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        try {
            // $query = Menu::query();
            $query = Menu::query()->withCount('likes');
          
            if ($request->has('restaurant_id')) {
                $query->where('restaurant_id', $request->input('restaurant_id'));
            }

            if ($request->has('category')) {
                $query->where('category', $request->input('category'));
            }

            if ($request->has('search')) {
                $searchTerm = '%' . $request->input('search') . '%';
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', $searchTerm)
                        ->orWhere('description', 'like', $searchTerm)
                        ->orWhere('category', 'like', $searchTerm);
                });
            }

            if ($request->has('sort_by') && $request->has('sort_order')) {
                $query->orderBy($request->input('sort_by'), $request->input('sort_order'));
            }

            $menus = $query->with('restaurant:id,name')->paginate($request->input('per_page', 10));

            // Convert image paths to full URLs
            $menus->getCollection()->transform(function ($menu) {
                if ($menu->image_path) {
                    $menu->image_url = Storage::url($menu->image_path);
                }
                return $menu;
            });

            return response()->json($menus, 200);

        } catch (\Exception $e) {
            Log::error('Error fetching menus: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching menus.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5048', // 2MB max
            ]);

            $menuData = $request->except('image');
            
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('menu_images', 'public');
                $menuData['image_path'] = $imagePath;
            }

            $menu = Menu::create($menuData);
            
            // Add the full URL to the response
            if ($menu->image_path) {
                $menu->image_url = Storage::url($menu->image_path);
            }

            return response()->json($menu, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error creating menu: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the menu.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            // $menu = Menu::with('restaurant:id,name')->findOrFail($id);
            $menu = Menu::with(['restaurant:id,name', 'likes'])->withCount('likes')->findOrFail($id);

            
            // Add the full URL to the response
            if ($menu->image_path) {
                $menu->image_url = Storage::url($menu->image_path);
            }
            
            return response()->json($menu, 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Menu item not found.',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error fetching menu item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching the menu item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $menu = Menu::findOrFail($id);

            $validated = $request->validate([
                'restaurant_id' => 'sometimes|exists:restaurants,id',
                'name' => 'sometimes|string|max:255',
                'price' => 'sometimes|numeric|min:0',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5048', // 2MB max
            ]);

            $updateData = $request->except('image');
            
            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($menu->image_path) {
                    Storage::disk('public')->delete($menu->image_path);
                }
                
                $imagePath = $request->file('image')->store('menu_images', 'public');
                $updateData['image_path'] = $imagePath;
            }
            
            $menu->update($updateData);
            
            // Add the full URL to the response
            if ($menu->image_path) {
                $menu->image_url = Storage::url($menu->image_path);
            }

            return response()->json($menu, 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Menu item not found.',
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating menu item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the menu item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $menu = Menu::findOrFail($id);
            
            // Delete associated image
            if ($menu->image_path) {
                Storage::disk('public')->delete($menu->image_path);
            }
            
            $menu->delete();
            return response()->noContent();

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Menu item not found.',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error deleting menu item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while deleting the menu item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getMenuCount(Request $request)
    {
        $count = Menu::where('restaurant_id', $request->id)->count('id');
        return response()->json(['count' => $count]);
    }
}