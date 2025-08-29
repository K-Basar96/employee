import React, { useState } from "react";
import "../pages/Login.css";


const Login = () => {
  const [role, setRole] = useState(0);
  console.log(role+`(${typeof(role)})`)
  return (
    <div className="login-page container-fluid vh-100">
      <div className="row h-100">
        {/* Left side with background image */}
        <div className="col-md-6 d-flex align-items-center justify-content-center text-white" 
          style={{ backgroundImage: "url('/login_page_bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", }}
        ></div>

        {/* Right side with form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
          <div className="col-md-8">
            <h3 className="form-label d-block text-center">Login As</h3>

           {/* Radio options */}
            <div className="mb-3 text-center">
              <label className={`btn btn-outline-primary me-2 ${role === 0 ? "active" : ""}`}>
                <input type="radio" name="role" value={0} className="d-none" checked={role === 0} onChange={(e) => setRole(parseInt(e.target.value))}/>
                <i className="fas fa-user me-2"></i> Teacher
              </label>

              <label className={`btn btn-outline-primary me-2 ${role === 2 ? "active" : ""}`}>
                <input type="radio" name="role" value={2} className="d-none" checked={role === 2} onChange={(e) => setRole(parseInt(e.target.value))}/>
                <i className="fas fa-school me-2"></i> School
              </label>

              <label className={`btn btn-outline-primary ${role === 1 ? "active" : ""}`}>
                <input type="radio" name="role" value={1} className="d-none" checked={role === 1} onChange={(e) => setRole(parseInt(e.target.value))}/>
                <i className="fas fa-user-shield me-2"></i> Administrator
              </label>
            </div>


            {/* Conditional Inputs */}
            {role === 0 && (
              <>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Disecode</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" />
                </div>
              </>
            )}

            {role === 2 && (
              <>
                <div className="mb-3">
                  <label className="form-label">Disecode</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" />
                </div>
              </>
            )}

            {role === 1 && (
              <>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" />
                </div>
              </>
            )}

            {/* Captcha (common for all) */}
            <div className="mb-3">
              <label className="form-label">Captcha</label>
              <div className="d-flex">
                <img
                  src="/captcha.jpg" // dummy captcha image, replace with real
                  alt="captcha"
                  className="me-2 col-md-4"
                  style={{ height: "40px" }}
                />
                <input type="text" maxLength={6} className="form-control" placeholder="Enter captcha" />
              </div>
            </div>

            {/* Login Button */}
            <div className="d-grid">
              <button className="btn btn-primary">Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;