<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    // Get all orders
    public function index()
    {
        try {
            $orders = Order::with(['user', 'orderItems.menu'])->get();
            return response()->json($orders, 200);

        } catch (\Exception $e) {
            Log::error('Error fetching orders: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching orders.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Create a new order
    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'items' => 'required|array',
                'items.*.menu_id' => 'required|exists:menus,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            $totalAmount = 0;
            $orderItems = [];

            // Calculate total amount and prepare order items
            foreach ($validated['items'] as $item) {
                $menu = Menu::find($item['menu_id']);
                if (!$menu) {
                    throw new ModelNotFoundException("Menu not found with ID: " . $item['menu_id']);
                }
                $totalAmount += $menu->price * $item['quantity'];
                $orderItems[] = [
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'price' => $menu->price,
                ];
            }

            // Create the order
            $order = Order::create([
                'user_id' => $validated['user_id'],
                'total_amount' => $totalAmount,
                'status' => 'pending', // Default status
            ]);

            // Add order items
            $order->orderItems()->createMany($orderItems);

            // Return the order with order items and menu details
            return response()->json($order->load('orderItems.menu'), 201);

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
            Log::error('Error creating order: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the order.',
                'error' => $e->getMessage(), // Only return error details in development
            ], 500);
        }
    }

    // Get a single order
    public function show($id)
    {
        try {
            $order = Order::with(['user', 'orderItems.menu'])->findOrFail($id);
            return response()->json($order, 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error fetching order: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while fetching the order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Update an order (e.g., change status)
    public function update(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'status' => 'sometimes|in:pending,processing,shipped,delivered,cancelled',
            ]);

            $order->update($validated);
            return response()->json($order, 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating order: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Delete an order
    public function destroy($id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->delete();
            return response()->noContent();

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error deleting order: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while deleting the order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
   
}