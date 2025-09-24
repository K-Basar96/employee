// src/hooks/axios.jsx
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fingerprint = null;

// Preload fingerprint once
(async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    fingerprint = result.visitorId;
    localStorage.setItem("fingerprint", fingerprint);
})();

const api = axios.create({
    baseURL: "http://localhost:5000", // backend
    withCredentials: true,            // ✅ always send cookies
});

// Attach fingerprint header for every request
api.interceptors.request.use((config) => {
    if (fingerprint || localStorage.getItem("fingerprint")) {
        config.headers["x-fingerprint"] = fingerprint || localStorage.getItem("fingerprint");
    }
    return config;
});

// Handle expired access tokens automatically and redirect to login
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle both 401 (Unauthorized) and 403 (Forbidden)
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Only fingerprint needed, refresh token is in HttpOnly cookie
                await api.post("/auth/refresh", {
                    fingerprint: localStorage.getItem("fingerprint"),
                });

                processQueue(null);
                return api(originalRequest); // retry request
            } catch (err) {
                // Clear auth data and redirect to login on refresh failure
                localStorage.clear();
                processQueue(err, null);
                window.location.href = "/";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
