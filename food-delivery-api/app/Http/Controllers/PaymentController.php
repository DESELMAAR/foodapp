<?php
namespace App\Http\Controllers;

use App\Mail\OrderConfirmationMail;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Order;
use App\Services\PayPalService;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    protected $payPalService;

    public function __construct(PayPalService $payPalService)
    {
        $this->payPalService = $payPalService;
    }

    // Initiate a PayPal payment
    public function initiatePayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required',
        ]);

        $order = Order::findOrFail($validated['order_id']);
        // if(   !$order){
        //     return response()->json([
        //         'message' => 'order not found',
        //     ], 400);
        // }
        $amount = $order->total_amount;

        if ($amount <= 0) {
            return response()->json([
                'message' => 'Amount must be greater than zero.',
            ], 400);
        }

        try {
            // Create a PayPal order
            $response = $this->payPalService->createOrder($amount, 'USD', $order->id);

            // Save the PayPal order ID for reference
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'paypal',
                'amount' => $amount,
                'status' => 'pending',
                'transaction_id' => $response->id,
            ]);

            // Redirect the user to PayPal for approval
            return response()->json([
                'approval_url' => $response->links[1]->href, // Approval URL
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while initiating the payment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Handle successful payment
    public function successPayment(Request $request)
    {
        $validated = $request->validate([
            'orderID' => 'required|string',
        ]);

        try {
            // Capture the PayPal order
            $response = $this->payPalService->captureOrder($validated['orderID']);

            // Update the payment status
            $payment = Payment::where('transaction_id', $validated['orderID'])->firstOrFail();

            if ($payment->status === 'completed') {
                return response()->json([
                    'message' => 'Payment is already completed.',
                ], 400);
            }

            $payment->update([
                'status' => 'completed',
            ]);

            // Optionally update the order status
            $payment->order->update(['status' => 'paid']);
            // Send email notification
            Mail::to($payment->order->user->email)->send(new OrderConfirmationMail($payment->order));

            return response()->json([
                'message' => 'Payment completed successfully.',
                'payment' => $payment,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while completing the payment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Handle canceled payment
    public function cancelPayment()
    {
        \Log::info('Payment was canceled by the user.');
        return response()->json([
            'message' => 'Payment was canceled by the user.',
        ], 400);
    }
}