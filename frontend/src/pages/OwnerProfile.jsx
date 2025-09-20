import React, { useState } from "react";
import API from "../services/api";

export default function OwnerProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put("/owner/password", { oldPassword, newPassword });
      alert("✅ Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error updating password"));
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="p-6 max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        {!showPasswordForm ? (
          <>
            <h1 className="text-xl font-bold mb-4">Owner Profile</h1>
            <p>
              <b>Name:</b> {user?.name}
            </p>
            <p>
              <b>Email:</b> {user?.email}
            </p>
            <p>
              <b>Address:</b> {user?.address}
            </p>
            <p>
              <b>Role:</b> {user?.role}
            </p>

            <button
              onClick={() => setShowPasswordForm(true)}
              className="mt-6 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
            >
              🔒 Update Password
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-4">Update Password</h1>
            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <input
                type="password"
                placeholder="Old Password"
                className="border p-2 w-full rounded dark:bg-gray-700 dark:border-gray-600"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="New Password"
                className="border p-2 w-full rounded dark:bg-gray-700 dark:border-gray-600"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="w-full mt-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}