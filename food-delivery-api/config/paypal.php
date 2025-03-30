<?php

return [
    'mode' => env('PAYPAL_MODE', 'sandbox'), // 'sandbox' or 'live'
    'client_id' => env('PAYPAL_CLIENT_ID'),
    'secret' => env('PAYPAL_SECRET'),
];