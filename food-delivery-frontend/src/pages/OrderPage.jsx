
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch user's orders from the API
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await apiClient.get('/orders');
                setOrders(response.data);
                console.log(response.data)
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    // Redirect to login if unauthorized
                    navigate('/login');
                } else {
                    setError('Failed to load orders. Please try again later.');
                    console.error('Error fetching orders:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={styles.container}>
            <h2>Your Orders</h2>
            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                <ul style={styles.orderList}>
                    {orders.map((order) => (
                        <li key={order.id} style={styles.orderCard}>
                            <h3>Order ID: {order.id}</h3>
                            <p>Total Amount: ${order.total_amount}</p>
                            <p>Status: {order.status}</p>
                            <p>Placed On: {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Inline styles for simplicity
const styles = {
    container: {
        maxWidth: '800px',
        margin: '50px auto',
        padding: '20px',
    },
    orderList: {
        listStyle: 'none',
        padding: 0,
    },
    orderCard: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
};

export default OrderPage;
