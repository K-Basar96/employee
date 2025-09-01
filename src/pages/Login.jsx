import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/Login.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const Login = () => {
    const navigate = useNavigate();
    const [captcha, setCaptcha] = useState("");
    const [userCaptcha, setUserCaptcha] = useState("");

    const [role, setRole] = useState(0);
    const [username, setUsername] = useState("");
    const [disecode, setDisecode] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(true);

    // Fetch captcha on page load
    useEffect(() => {
        fetch("/captcha")
            .then((res) => res.json())
            .then((data) => setCaptcha(data.captcha))
            .catch((err) => console.error("Error fetching captcha:", err));
    }, []);

    const handleLogin = async () => {
    // alert("✅ Captcha verified!");
    const fp = await FingerprintJS.load();
    const fs_res = await fp.get();
    // console.log(fs_res.visitorId);
        if (userCaptcha.trim() === captcha.toString().trim()) {
            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, disecode, password, role }),
                });
                const data = await response.json();
                setSuccess(data.success);
                setMessage(data.message || "Unknown response");
                if (data.success) {
                    navigate("/dashboard"); // ✅ Redirect to dashboard after successful login
                }
            } catch (error) {
                setMessage("Something went wrong!");
            }
        } else {
            alert("❌ Captcha incorrect!");
        }
    };

    return (
        <div className="login-page container-fluid vh-100">
            <div className="row h-100">
                {/* Left side with background image */}
                <div className="col-12 col-md-6 p-0">
                    <img className="w-100 h-100" src="/login_page_bg.jpg" alt="School Management System" 
                        style={{ objectFit: "cover", maxHeight: "100vh" }}/>
                </div>

                {/* Right side with form */}
                <div className="col-12 col-md-6 d-flex justify-content-center bg-light" >
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
                            { roles: [0, 2], label: "Disecode", state: disecode, setState: setDisecode }
                        ].map(
                            (field, i) =>
                                field.roles.includes(role) && (
                                    <div className="mb-3" key={i}>
                                        <label className="form-label">{field.label}</label>
                                        <input type="text" className="form-control" value={field.state} onChange={(e) => field.setState(e.target.value)} />
                                    </div>
                                )
                        )}

                        {/* Common Password and Captcha (common for all) */}
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Captcha</label>
                            <div className="d-flex">
                                {/* Captcha box instead of static image */}
                                <div className="me-2 col-md-4 d-flex align-items-center justify-content-center bg-secondary text-dark fw-bold rounded"
                                    style={{ height: "40px", fontSize: "24px", letterSpacing: "5px" }}>
                                    {captcha}
                                </div>
                                <button type="button" className="btn btn-link mx-2 p-0 col-md-1"
                                    onClick={() => {
                                        fetch("/captcha")
                                            .then((res) => res.json()).then((data) => setCaptcha(data.captcha));
                                    }}><i className="fas fa-sync-alt fs-3"></i>
                                </button>
                                <input type="text" maxLength={6} className="form-control fs-5" placeholder="Enter captcha"
                                    value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} />
                            </div>
                        </div>

                        {/* Login Button */}
                        {!success && <div className="alert alert-danger py-2">
                            <div className="text-center text-danger fw-bold w-100 fs-6">{message}</div>
                        </div>}
                        <div className="d-flex flex-row justify-content-center my-0">
                            <br />
                            <button onClick={handleLogin} className="btn btn-primary col-md-8">Sign in</button>
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