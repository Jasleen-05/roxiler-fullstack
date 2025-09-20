import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useTheme } from "./context/ThemeContext"; // ✅ import useTheme
import Login from "./components/Login";
import Signup from "./components/Signup";
import StoreList from "./components/StoreList";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import UserProfile from "./components/UserProfile";
import OwnerProfile from "./pages/OwnerProfile";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl font-extrabold text-blue-700">🏠 Home Page</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Welcome to <span className="font-bold">Roxiler App</span> 🚀
      </p>
    </div>
  );
}

function About() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl font-extrabold text-green-700">ℹ️ About Page</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Built with <b>React + Tailwind + Express + PostgreSQL</b>.
      </p>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { theme, toggleTheme } = useTheme(); // ✅ get theme + toggle

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    alert("✅ Logged out successfully!");
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"
      }`}
    >
      {/* ✅ Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">🚀 Roxiler App</h1>
        <div className="space-x-4 flex items-center">
          <Link
            className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
            to="/"
          >
            Home
          </Link>
          <Link
            className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
            to="/about"
          >
            About
          </Link>

          {/* ✅ Show Stores only when logged in */}
          {user && (
            <Link
              className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
              to="/stores"
            >
              Stores
            </Link>
          )}

          {!user ? (
            <>
              <Link
                className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
                to="/signup"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              {user.role === "admin" && (
                <Link
                  className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
                  to="/admin"
                >
                  Admin
                </Link>
              )}
              {user.role === "owner" && (
                <>
                  <Link
                    className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
                    to="/owner"
                  >
                    Owner
                  </Link>
                  <Link
                    className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
                    to="/owner/profile"
                  >
                    Profile
                  </Link>
                </>
              )}
              {user.role === "user" && (
                <>
                  <Link
                    className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
                    to="/user"
                  >
                    User
                  </Link>
                  <Link
                    className="px-3 py-2 text-white hover:bg-white hover:text-blue-600 rounded-lg"
                    to="/profile"
                  >
                    Profile
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}

          {/* ✅ Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="ml-4 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-lg"
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </nav>

      {/* ✅ Routes */}
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/stores" element={<StoreList />} />

          {/* Dashboards */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <ProtectedRoute role="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Profiles */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute role="user">
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/profile"
            element={
              <ProtectedRoute role="owner">
                <OwnerProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}