<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class OrderItemController extends Controller
{
    // Get all order items
    public function index()
    {
        try {
            $orderItems = OrderItem::with(['order', 'menu'])->get();
            return response()->json($orderItems, 200);

        } catch (\Exception $e) {
            Log::error('Error fetching order items: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching order items.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Create a new order item
    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'order_id' => 'required|',
                'menu_id' => 'required|',
                'quantity' => 'required|integer|min:1',
            ]);

            // Fetch the menu item to get the price
            $menu = Menu::find($validated['menu_id']);
            if (!$menu) {
                throw new ModelNotFoundException("Menu not found with ID: " . $validated['menu_id']);
            }

            // Create the order item
            $orderItem = OrderItem::create([
                'order_id' => $validated['order_id'],
                'menu_id' => $validated['menu_id'],
                'quantity' => $validated['quantity'],
                'price' => $menu->price,
            ]);

            // Return the created order item with relationships
            return response()->json($orderItem->load('order', 'menu'), 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Resource not found.',
                'error' => $e->getMessage(),
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error creating order item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the order item.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Get a single order item
    public function show($id)
    {
        try {
            $orderItem = OrderItem::with(['order', 'menu'])->findOrFail($id);
            return response()->json($orderItem, 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order item not found.',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error fetching order item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching the order item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Update an order item
    public function update(Request $request, $id)
    {
        try {
            $orderItem = OrderItem::findOrFail($id);

            // Validate the request data
            $validated = $request->validate([
                'quantity' => 'sometimes|integer|min:1',
            ]);

            // Update the order item if quantity is provided
            if (isset($validated['quantity'])) {
                $menu = $orderItem->menu;
                $orderItem->update([
                    'quantity' => $validated['quantity'],
                    'price' => $menu->price, // Recalculate the price
                ]);
            }

            // Return the updated order item with relationships
            return response()->json($orderItem->load('order', 'menu'), 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order item not found.',
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating order item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the order item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Delete an order item
    public function destroy($id)
    {
        try {
            $orderItem = OrderItem::findOrFail($id);
            $orderItem->delete();
            return response()->noContent();

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order item not found.',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error deleting order item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while deleting the order item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}