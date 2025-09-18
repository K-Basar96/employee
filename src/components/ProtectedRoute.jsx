// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated, checkAuth, user } = useAuth(false);
    const location = useLocation();
    useEffect(() => {
        checkAuth();
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        localStorage.clear();
        return <Navigate to="/" replace />;
    }
    return React.cloneElement(children, { user });
    return children;
};
export default ProtectedRoute;
