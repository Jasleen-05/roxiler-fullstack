import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ✅ Load user details from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put("/user/password", { oldPassword, newPassword });
      alert("✅ Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error updating password"));
    }
  };

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 shadow rounded space-y-4 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>

      {/* ✅ Basic Details */}
      <div className="space-y-2">
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Address:</b> {user.address || "Not provided"}</p>
        <p><b>Role:</b> {user.role}</p>
      </div>

      {/* ✅ Button to show password form */}
      {!showPasswordForm ? (
        <button
          onClick={() => setShowPasswordForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Update Password
        </button>
      ) : (
        <form onSubmit={handlePasswordUpdate} className="space-y-3">
          <input
            type="password"
            placeholder="Old Password"
            className="border p-2 w-full rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="border p-2 w-full rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}