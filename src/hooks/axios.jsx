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

            localStorage.clear();
            window.location.href = "/";
            return Promise.reject(error);   // handled 401/403
        }

        return Promise.reject(error);   // All other errors
    }
);

export default api;
