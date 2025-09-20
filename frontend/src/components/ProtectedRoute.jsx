import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  // ✅ Get user + token from localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ If not logged in → go to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ If role doesn’t match → go to home
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ Otherwise show the page
  return children;
}