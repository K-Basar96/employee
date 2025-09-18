// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentLanguage from "./pages/StudentLanguage";
import SchoolLanguage from "./pages/SchoolLanguage";
import Signature from "./pages/Signature";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDispatch } from "react-redux";
import store from "./redux/store";

function App() {
	// console.log(store);
	return (
		<Routes>
			{/* Public route */}
			<Route path="/" element={<Login />} />

			<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
				{/* Protected routes */}
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/language/school" element={<SchoolLanguage />} />
				<Route path="/language/student" element={<StudentLanguage />} />
				<Route path="/sign" element={<Signature />} />
				{/* ✅ Add more protected routes here */}
			</Route>
			<Route path="*" element={<Login />} />
		</Routes>
	);
}

export default App;
