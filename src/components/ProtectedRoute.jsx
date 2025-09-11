// src/components/ProtectedRoute.jsx
import React,{useEffect} from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated, checkAuth } = useAuth(false);
    checkAuth();
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
    
    return children;
};
export default ProtectedRoute;
