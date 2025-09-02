// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Verification from "./pages/Verification";
import Discontinuity from "./pages/Discontinuity";
import Uploaded from "./pages/Uploaded";
import MC_status from "./pages/MC_status";
import Signature from "./pages/Signature";
import Layout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/discontinuity" element={<Discontinuity />} />
        <Route path="/mc_status" element={<MC_status />} />
        <Route path="/uploaded" element={<Uploaded />} />
        <Route path="/sign" element={<Signature />} />
        {/* ✅ Add more protected routes here */}
      </Route>
    </Routes>
  );
}

export default App;
