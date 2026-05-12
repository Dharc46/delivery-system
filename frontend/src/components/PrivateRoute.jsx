import React from 'react';
import { Navigate } from 'react-router-dom';
import { AUTH_MESSAGES } from '../utils/authMessages';

const PrivateRoute = ({ children, roles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace state={{ authMessage: AUTH_MESSAGES.unauthorized }} />;
    }

    if (roles && !roles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace state={{ authMessage: AUTH_MESSAGES.forbidden }} />;
    }

    return children;
};

export default PrivateRoute;