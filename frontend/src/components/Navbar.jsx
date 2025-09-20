import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext"; // ✅ import ThemeContext

export default function Navbar() {
  const role = localStorage.getItem("role"); // role saved at login (user/owner/admin)
  const { theme, toggleTheme } = useContext(ThemeContext); // ✅ get theme + toggle

  return (
    <nav className="p-4 flex justify-between items-center bg-white dark:bg-gray-900 shadow">
      {/* Left side - Logo & Links */}
      <div className="flex gap-4 items-center">
        <Link
          to="/"
          className="text-xl font-bold text-gray-800 dark:text-gray-200"
        >
          Roxiler App
        </Link>

        <Link
          to="/dashboard"
          className="text-gray-700 dark:text-gray-300 hover:underline"
        >
          Dashboard
        </Link>

        {role === "user" && (
          <Link
            to="/profile"
            className="text-gray-700 dark:text-gray-300 hover:underline"
          >
            Profile
          </Link>
        )}
      </div>

      {/* Right side - Theme Toggle + Logout */}
      <div className="flex gap-3 items-center">
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
        </button>

        <Link
          to="/login"
          onClick={() => {
            localStorage.clear();
          }}
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </Link>
      </div>
    </nav>
  );
}