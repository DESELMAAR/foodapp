<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class RestaurantController extends Controller
{
    // Get all restaurants
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // For admins - show all, for restaurant owners - show only theirs
            if ($user->hasRole(['admin','customer'])) {
                $restaurants = Restaurant::with('menus')->get();
            } else {
                $restaurants = Restaurant::where('user_id', $user->id)
                    ->with('menus')
                    ->get();
            }

            return response()->json($restaurants, 200);

        } catch (\Exception $e) {
            Log::error('Error fetching restaurants: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching restaurants.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Create a new restaurant
    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'name' => 'required|string',
                'address' => 'required|string',
                'phone' => 'required|string',
                'user_id' => 'required'
            ]);

            // Create the restaurant
            $restaurant = Restaurant::create($validated);

            // Return the created restaurant
            return response()->json($restaurant, 201);

        } catch (ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Error creating restaurant: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while creating the restaurant.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Get a single restaurant
    public function show($id)
    {
        try {
            // Find the restaurant
            $restaurant = Restaurant::findOrFail($id);
            return response()->json($restaurant, 200);

        } catch (ModelNotFoundException $e) {
            // Handle the case where the restaurant is not found
            return response()->json([
                'message' => 'Restaurant not found.',
            ], 404);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Error fetching restaurant: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while fetching the restaurant.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Update a restaurant
    public function update(Request $request, $id)
    {
        try {
            // Find the restaurant
            $restaurant = Restaurant::findOrFail($id);

            // Validate the request data
            $validated = $request->validate([
                'name' => 'sometimes|string',
                'address' => 'sometimes|string',
                'phone' => 'sometimes|string',
            ]);

            // Update the restaurant
            $restaurant->update($validated);

            // Return the updated restaurant
            return response()->json($restaurant, 200);

        } catch (ModelNotFoundException $e) {
            // Handle the case where the restaurant is not found
            return response()->json([
                'message' => 'Restaurant not found.',
            ], 404);

        } catch (ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            // Log the error
            Log::error('Error updating restaurant: ' . $e->getMessage());

            // Return a generic error response
            return response()->json([
                'message' => 'An error occurred while updating the restaurant.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Delete a restaurant
    public function destroy($id)
    {
        try {
            $restaurant = Restaurant::findOrFail($id);

            // This will throw an AccessDeniedHttpException if not authorized
            $this->authorize('delete', $restaurant);

            $restaurant->delete();
            return response()->noContent();

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Restaurant not found.'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting restaurant: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while deleting the restaurant.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}