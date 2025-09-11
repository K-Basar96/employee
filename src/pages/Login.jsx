// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/Login.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import api from "../hooks/axios";
import useAuth from "../hooks/useAuth";
import forge from "node-forge";

const Login = () => {
    const navigate = useNavigate();
    const [publicKeyPem, setPublicKeyPem] = useState("");
    const [captcha, setCaptcha] = useState("");
    const [userCaptcha, setUserCaptcha] = useState("");
    const [role, setRole] = useState(0);
    const [username, setUsername] = useState("");
    const [disecode, setDisecode] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(true);

    const { loading, isAuthenticated, captcha: authCaptcha, login } = useAuth(true);

    // Handle authentication status
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        } else if (authCaptcha) {
            setCaptcha(authCaptcha);
        }
    }, [isAuthenticated, authCaptcha, navigate]);
    useEffect(() => {
        fetch("/public.pem")
            .then((res) => res.text())
            .then(setPublicKeyPem)
            .catch((err) => console.error("Failed to load public key:", err));
    }, []);

    function encryptPassword(pass) {
        if (!publicKeyPem) {
            throw new Error("Public key not loaded yet");
        }
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const encrypted = publicKey.encrypt(pass, "RSA-OAEP", {
            md: forge.md.sha256.create(),
        });
        return forge.util.encode64(encrypted);
    }

    const handleLogin = async () => {
        const encryptedPassword = encryptPassword(password);
        try {
            let fp = await FingerprintJS.load();
            fp = await fp.get();
            const fingerprint = fp.visitorId;

            if (userCaptcha.trim() === captcha.toString().trim()) {
                const result = await login({ username, disecode, encryptedPassword, role, fingerprint });
                setSuccess(result.success);
                setMessage(result.message);

                if (result.success) {
                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 1000);
                }
            } else {
                setSuccess(false);
                setMessage("Captcha is incorrect!");
            }
        } catch (error) {
            setSuccess(false);
            setMessage("Something went wrong during login!");
        }
    };

    return (
        <div className="login-page container-fluid vh-100">
            <div className="row h-100">
                {/* Left side with background image */}
                <div className="col-12 col-md-6 p-0">
                    <img className="w-100 h-100" src="/login_page_bg.jpg" alt="School Management System" style={{ objectFit: "cover", maxHeight: "100vh" }} />
                </div>

                {/* Right side with form */}
                <div className="col-12 col-md-6 d-flex justify-content-center bg-light">
                    <div className="col-md-8 d-flex flex-column">
                        <div className="mb-auto"></div>
                        <h3 className="form-label d-block text-center">Login As</h3>

                        {/* Radio options */}
                        <div className="mb-3 text-center">
                            <label className={`btn btn-outline-primary me-2 ${role === 0 ? "active" : ""}`}>
                                <input type="radio" name="role" value={0} className="d-none" checked={role === 0} onChange={(e) => setRole(parseInt(e.target.value))} />
                                <i className="fas fa-user me-2"></i> Teacher
                            </label>

                            <label className={`btn btn-outline-primary me-2 ${role === 2 ? "active" : ""}`}>
                                <input type="radio" name="role" value={2} className="d-none" checked={role === 2} onChange={(e) => setRole(parseInt(e.target.value))} />
                                <i className="fas fa-school me-2"></i> School
                            </label>

                            <label className={`btn btn-outline-primary ${role === 1 ? "active" : ""}`}>
                                <input type="radio" name="role" value={1} className="d-none" checked={role === 1} onChange={(e) => setRole(parseInt(e.target.value))} />
                                <i className="fas fa-user-shield me-2"></i> Administrator
                            </label>
                        </div>

                        {/* Role-based fields */}
                        {[
                            { roles: [0, 1], label: "Username", state: username, setState: setUsername },
                            { roles: [0, 2], label: "Disecode", state: disecode, setState: setDisecode },
                        ].map(
                            (field, i) =>
                                field.roles.includes(role) && (
                                    <div className="mb-3" key={i}>
                                        <label className="form-label">{field.label}</label>
                                        <input type="text" className="form-control" value={field.state} onChange={(e) => field.setState(e.target.value)} />
                                    </div>
                                )
                        )}

                        {/* Common Password */}
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Captcha */}
                        <div className="mb-3">
                            <label className="form-label">Captcha</label>
                            <div className="d-flex">
                                <div
                                    className="me-2 col-md-4 d-flex align-items-center justify-content-center bg-secondary text-dark fw-bold rounded"
                                    style={{ height: "40px", fontSize: "24px", letterSpacing: "5px" }}
                                >
                                    {captcha}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-link mx-2 p-0 col-md-1"
                                    onClick={() =>
                                        api.get("/captcha").then((res) => setCaptcha(res.data.captcha))
                                    }
                                >
                                    <i className="fas fa-sync-alt fs-3"></i>
                                </button>
                                <input type="text" maxLength={6} className="form-control fs-5" placeholder="Enter captcha" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} />
                            </div>
                        </div>

                        {/* Error message */}
                        {!success && (
                            <div className="alert alert-danger py-2">
                                <div className="text-center text-danger fw-bold w-100 fs-6">
                                    {message}
                                </div>
                            </div>
                        )}

                        {/* Login button */}
                        <div className="d-flex flex-row justify-content-center my-0">
                            <button onClick={handleLogin} className="btn btn-primary col-md-8">
                                Sign in
                            </button>
                        </div>

                        <div className="mt-auto text-center">
                            <p className="mb-5">
                                <strong>Helpline :</strong> 6289-352676 <br />
                                <strong>Email :</strong> contactschoolmanagementsystem@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
