// src/hooks/useAuth.jsx
import { useEffect, useState } from "react";
import api from "./axios";
import { useDispatch } from "react-redux";
import { session_token } from "../redux/action";

// Create a singleton pattern to track ongoing auth checks
let authCheckInProgress = null;

const useAuth = (redirectToLogin = false) => {
    const dispatch = useDispatch();
    const [user, setUser] = useState(() => {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    });
    const [loading, setLoading] = useState(true);
    const [captcha, setCaptcha] = useState("");
    
    const checkAuth = async () => {
        try {
            if (authCheckInProgress) {
                await authCheckInProgress;
                return;
            }
            authCheckInProgress = (async () => {
                try {
                    const res = await api.get("/captcha");
                    if (res.data.redirect) {
                        if (!user) {
                            localStorage.setItem("user", JSON.stringify(res.data.user));
                            const userData = localStorage.getItem("user");
                            if (userData) {
                                setUser(JSON.parse(userData));
                            }
                        }
                        if (captcha) setCaptcha("");
                    } else {
                        if (user) {
                            localStorage.clear();
                            setUser(null);
                        }
                        if (res.data.captcha && captcha !== res.data.captcha) {
                            setCaptcha(res.data.captcha);
                        }
                    }
                } finally {
                    setLoading(false);
                }
            })();

            await authCheckInProgress;
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.clear();
            setUser(null);
        } finally {
            authCheckInProgress = null;
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            const { data } = await api.post("/auth/logout");

            localStorage.clear();
            setUser(null);

            return { success: true, message: data?.message || "Logout successful" };
        } catch (error) {
            console.error("Logout failed:", error);
            return { success: false, message: "Something went wrong during logout!" };
        }
    };

    const login = async (credentials) => {
        try {
            const { data } = await api.post("/auth/login", credentials);
            if (data.success && data.user) {
                dispatch(session_token(data.accessToken));
                const currentUser = localStorage.getItem("user");
                if (!currentUser || JSON.stringify(data.user) !== currentUser) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setUser(data.user);
                }
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message || "Login failed" };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, message: "Something went wrong!" };
        }
    };

    const refreshAuth = () => checkAuth();

    return {user, loading, captcha, isAuthenticated: !!user, login, logout, refreshAuth, checkAuth};
};

export default useAuth;
