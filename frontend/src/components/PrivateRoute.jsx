import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(userRole)) {
        return <Navigate to="/unauthorized" />; // Có thể tạo trang 403
    }

    return children;
};

export default PrivateRoute;