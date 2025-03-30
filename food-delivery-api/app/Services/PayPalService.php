<?php

namespace App\Services;

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;

class PayPalService
{
    private $client;

    public function __construct()
    {
        $config = config('paypal');

        // Set up the environment
        $environment = $config['mode'] === 'sandbox'
            ? new SandboxEnvironment($config['client_id'], $config['secret'])
            : new ProductionEnvironment($config['client_id'], $config['secret']);

        // Initialize the PayPal HTTP client
        $this->client = new PayPalHttpClient($environment);
    }

    /**
     * Create a PayPal order.
     *
     * @param float $amount
     * @param string $currency
     * @param string $orderId (your internal order ID)
     * @return array
     */
    public function createOrder($amount, $currency = 'USD', $orderId)
    {
        $request = new OrdersCreateRequest();
        $request->prefer('return=representation');
        $request->body = [
            "intent" => "CAPTURE",
            "purchase_units" => [[
                "reference_id" => $orderId,
                "amount" => [
                    "currency_code" => $currency,
                    "value" => number_format($amount, 2, '.', ''),
                ],
            ]],
            "application_context" => [
                "cancel_url" => route('payment.cancel'),
                "return_url" => route('payment.success'),
            ],
        ];

        try {
            $response = $this->client->execute($request);
            return $response->result;
        } catch (\Exception $e) {
            throw new \Exception('Error creating PayPal order: ' . $e->getMessage());
        }
    }

    /**
     * Capture a PayPal order.
     *
     * @param string $orderID
     * @return array
     */
    public function captureOrder($orderID)
    {
        $request = new OrdersCaptureRequest($orderID);
        $request->prefer('return=representation');

        try {
            $response = $this->client->execute($request);
            return $response->result;
        } catch (\Exception $e) {
            throw new \Exception('Error capturing PayPal order: ' . $e->getMessage());
        }
    }
}