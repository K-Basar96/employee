// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import useAntiDevTools from "../hooks/useAntiDevTools";
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  // useAntiDevTools(); // Block browser devtools.
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    return stored ? JSON.parse(stored) : false;
  });

   useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => setSidebarCollapsed(s => !s);

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header onToggleSidebar={toggleSidebar} collapsed={sidebarCollapsed}/>
      <Sidebar collapsed={sidebarCollapsed} />
      <main className="page-content">
        <div className=" mb-5" style={{minHeight:'130px', backgroundImage: 'linear-gradient(90deg, #0d6efd, #145ec6)'}}></div>
        <div className="full-height m-0">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
