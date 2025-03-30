<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class MenuController extends Controller
{
    // Get all menus
    // public function index()
    // {
    //     try {
    //         // Fetch all menus with the restaurant relationship
    //         $menus = Menu::with('restaurant')->get();
    //         return response()->json($menus, 200);

    //     } catch (\Exception $e) {
    //         // Log the error
    //         Log::error('Error fetching menus: ' . $e->getMessage());

    //         // Return a generic error response
    //         return response()->json([
    //             'message' => 'An error occurred while fetching menus.',
    //             'error' => $e->getMessage(), // Only return error details in development
    //         ], 500);
    //     }
    // }
// Get all menus with optional filtering and pagination
    public function index(Request $request)
    {
        try {
            // Start building the query
            $query = Menu::query();

            // Add filtering by restaurant_id
            if ($request->has('restaurant_id')) {
                $query->where('restaurant_id', $request->input('restaurant_id'));
            }

            // Add search functionality (optional: search by name or description)
            if ($request->has('search')) {
                $searchTerm = '%' . $request->input('search') . '%';
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', $searchTerm)
                        ->orWhere('description', 'like', $searchTerm);
                });
            }

            // Add sorting (optional: sort by price, name, etc.)
            if ($request->has('sort_by') && $request->has('sort_order')) {
                $query->orderBy($request->input('sort_by'), $request->input('sort_order'));
            }

            // Add pagination (default 10 items per page)
            $menus = $query->with('restaurant')->paginate($request->input('per_page', 10));

            // Return paginated results
            return response()->json($menus, 200);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Error fetching menus: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while fetching menus.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }
    // Create a new menu item
    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'name' => 'required|string',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
            ]);

            // Create the menu item
            $menu = Menu::create($validated);

            // Return the created menu item
            return response()->json($menu, 201);

        } catch (ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Error creating menu: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while creating the menu.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Get a single menu item
    public function show($id)
    {
        try {
            // Find the menu item with the restaurant relationship
            $menu = Menu::with('restaurant')->findOrFail($id);
            return response()->json($menu, 200);

        } catch (ModelNotFoundException $e) {
            // Handle the case where the menu item is not found
            return response()->json([
                'message' => 'Menu item not found.',
            ], 404);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Error fetching menu item: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while fetching the menu item.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Update a menu item
    public function update(Request $request, $id)
    {
        try {
            // Find the menu item
            $menu = Menu::findOrFail($id);

            // Validate the request data
            $validated = $request->validate([
                'restaurant_id' => 'sometimes|exists:restaurants,id',
                'name' => 'sometimes|string',
                'price' => 'sometimes|numeric|min:0',
                'description' => 'nullable|string',
            ]);

            // Update the menu item
            $menu->update($validated);

            // Return the updated menu item
            return response()->json($menu, 200);

        } catch (ModelNotFoundException $e) {
            // Handle the case where the menu item is not found
            return response()->json([
                'message' => 'Menu item not found.',
            ], 404);

        } catch (ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Error updating menu item: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while updating the menu item.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Delete a menu item
    public function destroy($id)
    {
        try {
            // Find the menu item
            $menu = Menu::findOrFail($id);

            // Delete the menu item
            $menu->delete();

            // Return a success response
            return response()->noContent();

        } catch (ModelNotFoundException $e) {
            // Handle the case where the menu item is not found
            return response()->json([
                'message' => 'Menu item not found.',
            ], 404);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Error deleting menu item: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while deleting the menu item.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }
}