// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Verification from './pages/Verification';
import Discontinuity from './pages/Discontinuity';
import Uploaded from './pages/Uploaded';
import MC_status from './pages/MC_status';
import Signature from './pages/Signature';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      {/* Login stays without header/sidebar/footer */}
      <Route path="/" element={<Login />} />

      {/* All routes that should have header/sidebar/footer */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/discontinuity" element={<Discontinuity />} />
        <Route path="/mc_status" element={<MC_status />} />
        <Route path="/uploaded" element={<Uploaded />} />
        <Route path="/sign" element={<Signature />} />
        {/* more routes here */}
      </Route>
    </Routes>
  );
}

export default App;
