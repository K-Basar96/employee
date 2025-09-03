// src/hooks/useAuth.jsx
import { useEffect, useState } from "react";
import api from "./axios";

// Create a singleton pattern to track ongoing auth checks
let authCheckInProgress = null;

const useAuth = (redirectToLogin = false) => {
    const [user, setUser] = useState(() => {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    });
    const [loading, setLoading] = useState(true);
    const [captcha, setCaptcha] = useState("");
    // const [lastCheck, setLastCheck] = useState(0);

    useEffect(() => {
        console.log("Auth state changed1:", user);
    }, [user]);
    const checkAuth = async () => {
        try {
            // If there's an ongoing check, wait for it and return
            if (authCheckInProgress) {
                await authCheckInProgress;
                return;
            }

            // Create a new auth check promise
            authCheckInProgress = (async () => {
                try {
                    // Get captcha to verify session
                    const res = await api.get("/captcha");
                    console.log("Captcha check response:", res.data);
                    console.log("after captcha:", user);
                    // If we get a redirect, session is valid
                    if (res.data.redirect) {
                        // Only update user data if needed
                        if (!user) {
                            const userData = localStorage.getItem("user");
                            if (userData) {
                                setUser(JSON.parse(userData));
                            }
                        }
                        if (captcha) setCaptcha("");
                    } else {
                        // Invalid session, clear everything only if we have data
                        if (user) {
                            localStorage.clear();
                            setUser(null);
                        }
                        // Only update captcha if it changed
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
            // Always clear on error since it means invalid token
            localStorage.clear();
            setUser(null);
        } finally {
            authCheckInProgress = null;
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // const logout = async () => {
    //     try {
    //         await api.post("/auth/logout");
    //         localStorage.clear();
    //         setUser(null);
    //     } catch (error) {
    //         console.error("Logout failed:", error);
    //     }
    // };

    const login = async (credentials) => {
        try {
            const { data } = await api.post("/auth/login", credentials);
            if (data.success && data.user) {
                // Only update if the user data is different
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

    return {
        user,
        loading,
        captcha,
        isAuthenticated: !!user,
        login,
        refreshAuth
    };
};

export default useAuth;
