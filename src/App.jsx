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
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
// import { useDispatch } from "react-redux";
import store from "./redux/store";

function App() {
  // console.log(store);
  return (
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
        {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
          <Route path="/discontinuity" element={<ProtectedRoute><Discontinuity /></ProtectedRoute>} />
          <Route path="/mc_status" element={<ProtectedRoute><MC_status /></ProtectedRoute>} />
          <Route path="/uploaded" element={<ProtectedRoute><Uploaded /></ProtectedRoute>} />
          <Route path="/sign" element={<ProtectedRoute><Signature /></ProtectedRoute>} />
          {/* ✅ Add more protected routes here */}
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
  );
}

export default App;
