<!DOCTYPE html>
<html>
<head>
    <title>Order Confirmation</title>
</head>
<body>
    <h1>Thank you for your order!</h1>
    <p>Your order (#{{ $order->id }}) has been successfully placed.</p>
    <p>Total Amount: ${{ number_format($order->total_amount, 2) }}</p>
</body>
</html>