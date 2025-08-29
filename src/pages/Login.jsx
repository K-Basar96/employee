import React, { useEffect, useState } from "react";
import "../pages/Login.css";


const Login = () => {
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  const [role, setRole] = useState(0);
  const [username, setUsername] = useState("");
  const [disecode, setDisecode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Fetch captcha on page load
  useEffect(() => {
    fetch("http://localhost:5000/captcha")
      .then((res) => res.json())
      .then((data) => setCaptcha(data.captcha))
      .catch((err) => console.error("Error fetching captcha:", err));
  }, []);

  const handleLogin = async () => {
    if (userCaptcha === captcha.toString()) {
      alert("✅ Captcha verified!");
      try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
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
                  {/* Captcha box instead of static image */}
                  <div className="me-2 col-md-4 d-flex align-items-center justify-content-center bg-secondary text-dark fw-bold rounded"
                    style={{ height: "40px", fontSize: "24px", letterSpacing: "5px" }}
                  > {captcha}
                  </div>
                  <button type="button" className="btn btn-link mx-2 p-0 col-md-1"
                  onClick={() => {
                    fetch("http://localhost:5000/captcha")
                      .then((res) => res.json())
                      .then((data) => setCaptcha(data.captcha));
                    }}><i className="fas fa-sync-alt fs-3"></i>
                  </button>
                  <input type="text" maxLength={4} className="form-control fs-5" placeholder="Enter captcha"
                    value={userCaptcha}
                    onChange={(e) => setUserCaptcha(e.target.value)}
                  />
                </div>

                {/* Refresh button */}
                
              </div>

            {/* Login Button */}
            <div className="d-grid">
              <p>{message}</p>
              <button onClick={handleLogin} className="btn btn-primary">Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;