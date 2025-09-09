import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../hooks/axios"; 

const Header = ({ onToggleSidebar, collapsed, hovered }) => {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { data } = await api.post("/auth/logout");
      setSuccess(data.success);
      setMessage(data.message);

      if (data.success) {
        localStorage.clear();
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Something went wrong!");
    }
  };

  const isExpanded = !collapsed || hovered;

  return (
    <header className="app-header d-flex align-items-center px-3">
      <div className="header-left d-flex align-items-center">
        {isExpanded && (
          <div
            className={`brand mx-5 ${collapsed && !hovered ? "collapsed" : ""}`}
          >
            <img src="./sms_logo.png" alt="logo" style={{ height: 34 }} />
          </div>
        )}
        <button
          className="btn btn-link me-3"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars fa-lg text-light"></i>
        </button>
        <div className="region text-uppercase">KALIMPONG</div>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <div className="header-actions">
          <button
            className="btn btn-link text-light"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
