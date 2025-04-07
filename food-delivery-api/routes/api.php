<?php

use App\Http\Controllers\AllFoodController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v1'], function() {
    // ... other routes
    
    // All Food routes
    Route::group(['prefix' => 'all-food'], function() {
        Route::get('/', [AllFoodController::class, 'index']);
        Route::get('/categories', [AllFoodController::class, 'categories']);
    });
});
// 🔹 Public Routes (No Authentication Required)
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/menus', [MenuController::class, 'index']);

// 🔹 Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 🔹 Protected Routes (Require Authentication via Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/restaurants', [RestaurantController::class, 'index']);
    Route::get('/restaurants/{restaurant}', [RestaurantController::class, 'show']);

    // User info endpoint
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
            'roles' => $request->user()->getRoleNames(),
            'permissions' => $request->user()->getAllPermissions()->pluck('name')
        ]);
    });

    // 🔹 Admin Routes (Full Management)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/menus', MenuController::class);
        Route::apiResource('/payments', PaymentController::class);
        Route::apiResource('/order-items', OrderItemController::class);
    });

    // 🔹 Restaurant Owner Routes
    Route::middleware('role:restaurant')->group(function () {
        // Restaurants can only manage their own menus
        Route::apiResource('/menus', MenuController::class);
       


        
        // Restaurants can only manage their own restaurant profile
        Route::put('/restaurants/{restaurant}', [RestaurantController::class, 'update']);
        Route::delete('/restaurants/{restaurant}', [RestaurantController::class, 'destroy']);
    });

    // 🔹 Customer Routes
    Route::middleware('role:customer')->group(function () {
        Route::apiResource('/cart', CartController::class)->except(['show']);
        Route::get('/cart/count', [CartController::class, 'getCartCount']);
        Route::apiResource('/orders', OrderController::class)->only(['store', 'show']);
    });

    // 🔹 Shared Routes
    
    // Restaurant creation (admin or restaurant owner)
    Route::middleware('can:create,App\Models\Restaurant')->post('/restaurants', [RestaurantController::class, 'store']);
    
    // Order management (admin or restaurant)
    Route::middleware('role:admin|restaurant')->group(function () {
        Route::apiResource('/orders', OrderController::class)->except(['store']);
    });
    
    // Public view endpoints (available to all authenticated users)
    Route::get('/restaurants/{restaurant}', [RestaurantController::class, 'show']);
});