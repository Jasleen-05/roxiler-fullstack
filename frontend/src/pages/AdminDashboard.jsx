// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({ usersCount: 0, storesCount: 0, ratingsCount: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", address: "", role: "user" });
  const [selectedUser, setSelectedUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSummary();
    fetchUsers();
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildQuery = (obj) => {
    const params = {};
    Object.keys(obj).forEach((k) => {
      if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") params[k] = obj[k];
    });
    return new URLSearchParams(params).toString();
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("summary fetch failed", await res.text());
        return;
      }
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("❌ Error fetching summary:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const q = buildQuery(filters);
      const url = q ? `http://localhost:5000/api/admin/users?${q}` : `http://localhost:5000/api/admin/users`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        console.error("users fetch failed", await res.text());
        setUsers([]);
        return;
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setUsers([]);
    }
  };

  const fetchStores = async () => {
    try {
      const q = buildQuery(filters);
      const url = q ? `http://localhost:5000/api/admin/stores?${q}` : `http://localhost:5000/api/admin/stores`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        console.error("stores fetch failed", await res.text());
        setStores([]);
        return;
      }
      const data = await res.json();
      setStores(data);
    } catch (err) {
      console.error("❌ Error fetching stores:", err);
      setStores([]);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("❌ " + (data.message || "Error creating user"));
        return;
      }
      setNewUser({ name: "", email: "", password: "", address: "", role: "user" });
      fetchUsers();
      alert("✅ User created");
    } catch (err) {
      console.error("❌ Error creating user:", err);
      alert("❌ Error creating user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("delete user failed", await res.text());
      }
      fetchUsers();
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  };

  const deleteStore = async (id) => {
    if (!window.confirm("Delete this store?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/stores/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("delete store failed", await res.text());
      }
      fetchStores();
    } catch (err) {
      console.error("❌ Error deleting store:", err);
    }
  };

  const viewUserDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("user details fetch failed", await res.text());
        return;
      }
      const data = await res.json();
      setSelectedUser(data);
    } catch (err) {
      console.error("❌ Error fetching user details:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded shadow">👤 Users: {summary.usersCount ?? 0}</div>
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded shadow">🏬 Stores: {summary.storesCount ?? 0}</div>
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded shadow">⭐ Ratings: {summary.ratingsCount ?? 0}</div>
      </div>

      {/* Add User */}
      <div className="p-4 bg-white dark:bg-black shadow rounded text-gray-900 dark:text-gray-100">
        <h2 className="font-bold mb-3">➕ Add New User</h2>
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <input className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <input type="password" className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <input className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Address" value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} />
          <select className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="user">User</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
        </form>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white dark:bg-black shadow rounded flex flex-wrap gap-2">
        <input className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Filter by Name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Filter by Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" placeholder="Filter by Address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <select className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={() => { fetchUsers(); fetchStores(); }} className="bg-green-500 text-white px-4 py-2 rounded">Apply Filters</button>
      </div>

      {/* Users & Stores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users */}
        <div>
          <h1 className="text-xl font-bold mb-4">👤 Users</h1>
          {users.length === 0 ? <p>No users found</p> : users.map((u) => (
            <div key={u.id} className="flex justify-between items-center p-3 bg-white dark:bg-black shadow rounded mb-2">
              <span>{u.name} ({u.role})</span>
              <div className="space-x-2">
                <button onClick={() => viewUserDetails(u.id)} className="bg-blue-500 text-white px-3 py-1 rounded">View</button>
                <button onClick={() => deleteUser(u.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Stores */}
        <div>
          <h1 className="text-xl font-bold mb-4">🏬 Stores</h1>
          {stores.length === 0 ? <p>No stores found</p> : stores.map((s) => (
            <div key={s.id} className="flex justify-between items-center p-3 bg-white dark:bg-black shadow rounded mb-2">
              <span>{s.name} ({s.email}) ⭐ {parseFloat(s.avgRating).toFixed(1)}</span>
              <button onClick={() => deleteStore(s.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
            </div>
          ))}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-black p-6 rounded shadow max-w-md w-full text-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-bold mb-3">👤 {selectedUser.name}</h2>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Address:</strong> {selectedUser.address}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>

            {selectedUser.role === "owner" && selectedUser.stores && (
              <div className="mt-3">
                <h3 className="font-bold">Owned Stores</h3>
                {selectedUser.stores.length === 0 ? (
                  <p>No stores added yet</p>
                ) : (
                  selectedUser.stores.map((st) => (
                    <p key={st.id} className="mt-2">
                      <strong>{st.name}</strong> — {st.email} <br />
                      {st.address} <br />
                      ⭐ {parseFloat(st.avgRating || 0).toFixed(1)} ({st.ratingCount || 0} ratings)
                    </p>
                  ))
                )}
              </div>
            )}

            <button onClick={() => setSelectedUser(null)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}