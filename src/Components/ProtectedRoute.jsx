// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../hooks/axios";

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await api.get("/auth/me");
                if (res.data?.user) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch {
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        verifySession();
    }, []);

    if (loading) {
        return <div className="text-center mt-5">🔄 Checking session...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
