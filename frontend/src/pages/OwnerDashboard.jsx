// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function OwnerDashboard() {
  const [stores, setStores] = useState([]);
  const [newStore, setNewStore] = useState({ name: "", address: "", email: "" });
  const [selectedRaters, setSelectedRaters] = useState(null);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("ASC");

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  const fetchStores = async () => {
    try {
      const res = await API.get(`/owner/stores?sortBy=${sortBy}&order=${order}`);
      setStores(res.data);
    } catch (err) {
      alert("❌ Error fetching stores");
    }
  };

  const handleAddStore = async () => {
    try {
      if (!newStore.name || !newStore.address || !newStore.email) {
        alert("⚠️ Please fill in all fields");
        return;
      }
      const res = await API.post("/owner/stores", newStore);
      setStores((s) => [...s, res.data]);
      setNewStore({ name: "", address: "", email: "" });
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error adding store"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this store?")) return;
    try {
      await API.delete(`/owner/stores/${id}`);
      setStores((s) => s.filter((st) => st.id !== id));
    } catch (err) {
      alert("Error deleting store");
    }
  };

  const viewRaters = async (id) => {
    try {
      const res = await API.get(`/owner/stores/${id}/raters`);
      setSelectedRaters(res.data);
    } catch (err) {
      alert("Error fetching raters");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 space-y-6">
      <h1 className="text-2xl font-bold">Owner Dashboard</h1>

      {/* Sort controls */}
      <div className="flex gap-2 items-center">
        <label>Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="id">ID</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="address">Address</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="border p-2 rounded dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="ASC">ASC</option>
          <option value="DESC">DESC</option>
        </select>
        <button
          onClick={fetchStores}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Add Store */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow max-w-md">
        <h2 className="font-bold mb-3">➕ Add Store</h2>
        <input
          className="border p-2 w-full my-2 rounded dark:bg-gray-700 dark:border-gray-600"
          placeholder="Name"
          value={newStore.name}
          onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
        />
        <input
          className="border p-2 w-full my-2 rounded dark:bg-gray-700 dark:border-gray-600"
          placeholder="Address"
          value={newStore.address}
          onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
        />
        <input
          className="border p-2 w-full my-2 rounded dark:bg-gray-700 dark:border-gray-600"
          placeholder="Email"
          value={newStore.email}
          onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
        />
        <button
          onClick={handleAddStore}
          className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600"
        >
          Add Store
        </button>
      </div>

      {/* Store List */}
      <div>
        <h2 className="text-xl font-semibold mb-3">My Stores</h2>
        {stores.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No stores yet</p>
        ) : (
          <ul className="space-y-3">
            {stores.map((st) => (
              <li
                key={st.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-bold">{st.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {st.address}
                  </div>
                  <div className="text-sm text-yellow-500">
                    ⭐ {Number(st.avgRating).toFixed(1)} ({st.ratingCount} ratings)
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => viewRaters(st.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View Raters
                  </button>
                  <button
                    onClick={() => handleDelete(st.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Raters Modal */}
      {selectedRaters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl w-full">
            <h3 className="font-bold mb-3">
              Raters for {selectedRaters.store.name}
            </h3>
            {selectedRaters.raters.length === 0 ? (
              <p>No ratings yet</p>
            ) : (
              selectedRaters.raters.map((r) => (
                <div
                  key={r.userId}
                  className="border rounded p-3 mb-2 dark:border-gray-600"
                >
                  <div>
                    <strong>{r.name}</strong> ({r.email})
                  </div>
                  <div>Rating: ⭐ {r.rating}</div>
                  {r.comment && <div>💬 {r.comment}</div>}
                </div>
              ))
            )}
            <div className="text-right mt-4">
              <button
                onClick={() => setSelectedRaters(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}