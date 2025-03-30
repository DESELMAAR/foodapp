<?php

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

// 🔹 Public Routes (No Authentication Required)
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/menus', [MenuController::class, 'index']);

// 🔹 Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 🔹 Protected Routes (Require Authentication via Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Route::get('/user', fn(Request $request) => $request->user());
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
            'roles' => $request->user()->getRoleNames(), // Spatie method
            'permissions' => $request->user()->getAllPermissions()->pluck('name')
        ]);
    });

    Route::middleware('auth:sanctum')->get('/test-role', function (Request $request) {
        $user = $request->user();

        return response()->json([
            'has_customer_role' => $user->hasRole('customer'),
            'roles' => $user->getRoleNames(),
            'all_data' => $user->toArray()
        ]);
    });

    // 🔹 Admin Routes (Full Management)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/restaurants', RestaurantController::class)->except(['index']);
        Route::apiResource('/menus', MenuController::class);
        Route::apiResource('/payments', PaymentController::class);
        Route::apiResource('/order-items', OrderItemController::class);
    });

    // 🔹 Restaurant Routes (Manage Own Menus & Orders)
    Route::middleware('role:restaurant')->group(function () {
        Route::apiResource('/menus', MenuController::class)->except(['index']); // No need to fetch all menus
        Route::apiResource('/restaurants', RestaurantController::class);
    });
    // Admin & Restaurant - Full Order Management
    Route::middleware(['role:admin|restaurant'])->group(function () {
        Route::apiResource('/orders', OrderController::class)->except(['show']);
    });

    // Customers - Only View Their Orders
// Route::middleware(['role:customer'])->group(function () {
//     // Route::get('/orders/{order}', [OrderController::class, 'show']);
//     Route::post('/cart/add', [CartController::class, 'addToCart']);

    // });

    Route::middleware(['auth:sanctum', 'role:admin|customer'])->group(function () {
        Route::post('/cart/add', [CartController::class, 'addToCart']);
        Route::apiResource('/orders', OrderController::class);

    });

    Route::middleware(['auth:sanctum', 'role:customer'])->get('/cart/count', [CartController::class, 'getCartCount']);

    // Customer Routes (Place Orders & Make Payments)
    Route::middleware('role:customer')->group(function () {
        Route::apiResource('/orders', OrderController::class)->only(['show']);
        Route::apiResource('/cart', CartController::class);

    });
    // Route::middleware('role:customer')->group(function () {
    //     Route::apiResource('/orders', OrderController::class)->only(['store', 'show']); // Place and view orders
    //     Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment'])->name('payment.initiate');
    //     Route::get('/payments/success', [PaymentController::class, 'successPayment'])->name('payment.success');
    //     Route::get('/payments/cancel', [PaymentController::class, 'cancelPayment'])->name('payment.cancel');
    // });
});
