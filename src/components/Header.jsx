// src/components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onToggleSidebar, collapsed, hovered }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const response = await fetch("/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json","Bearer token": '12345'},
            body: JSON.stringify({ username, disecode, password, role }),
        });
        const data = await response.json();
        setSuccess(data.success);
        setMessage(data.message || "Unknown response");
        if (data.success) {
            navigate("/");
        }
    } catch (error) {
        setMessage("Something went wrong!");
    }
  };

  // Sidebar is expanded if not collapsed OR if hovered
  const isExpanded = !collapsed || hovered;

  return (
    <header className={`app-header d-flex align-items-center px-3`}>
      <div className="header-left d-flex align-items-center">
        {isExpanded && (<div className={`brand mx-5 ${collapsed && !hovered ? "collapsed" : ""}`}>
            <img src="./sms_logo.png" alt="logo" style={{ height: 34 }} />
          </div>)}
        {/* Toggle button always visible */}
        <button className="btn btn-link me-3" onClick={onToggleSidebar} aria-label="Toggle sidebar" >
          <i className="fas fa-bars fa-lg text-light"></i>
        </button>
        <div className="region text-uppercase">KALIMPONG</div>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <div className="header-actions ">
          {/* <button className="btn btn-link" title="Menu">
            <i className="fas fa-th"></i>
            </button> */}
            <button className="btn btn-link text-light" onClick={handleLogout} title="Logout" aria-label="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
