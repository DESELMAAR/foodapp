<?php


namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{

    public function index(Request $request)
    {
        $user = $request->user(); // Gets the logged-in user
        // dump($user);
        // Fetch only the current user's cart items (with product details if needed)
        $cartItems = $user->cartItems()->with('product')->get();

        return response()->json([
            'success' => true,
            'items' => $cartItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required',
            'quantity' => 'required|integer|min:1',
        ]);

        // Check if the product is already in the cart
        $existingCartItem = Cart::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingCartItem) {
            // Update quantity if product exists
            $existingCartItem->quantity += $request->quantity;
            $existingCartItem->save();
        } else {
            // Create new cart item
            Cart::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return response()->json([
            'message' => 'Product added to cart successfully',
            'cart' => Auth::user()->cartItems()->with('product')->get()
        ], 201);
    }
    public function getCartCount()
    {
        $count = Cart::where('user_id', auth()->id())->count('id');
        return response()->json(['count' => $count]);
    }

    public function update(Request $request, $itemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0'
        ]);

        $cartItem = $request->user()->cartItems()->findOrFail($itemId);
        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json(['success' => true]);
    }


    public function destroy(Request $request, $itemId)
    {
        $request->user()->cartItems()->where('id', $itemId)->delete();
        return response()->json(['success' => true]);
    }
}