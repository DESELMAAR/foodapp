import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const location = useLocation();

    // Check if both token and user exist
    if (!token || !user) {
        // Redirect to the login page with the current location as state
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Render the protected component if authenticated
    return children;
};

export default ProtectedRoute;