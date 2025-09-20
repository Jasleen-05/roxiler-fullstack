import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const res = await API.get(`/user/stores?${params}`);
      setStores(res.data);
    } catch (err) {
      console.error("❌ Error fetching stores:", err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (storeId, score) => {
    try {
      await API.post(`/user/stores/${storeId}/rate`, { score });
      alert("✅ Rating submitted!");
      fetchStores(); // refresh list
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error rating store"));
    }
  };

  return (
    <div className="p-6 space-y-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600"
          placeholder="Search by Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600"
          placeholder="Search by Address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <button
          onClick={fetchStores}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Stores */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">❌ No stores found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="border rounded-lg p-4 shadow bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold">{store.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{store.address}</p>
              <p className="mt-2 text-yellow-600">
                ⭐ {Number(store.avgRating).toFixed(1)} ({store.ratingCount} ratings)
              </p>
              <p className="mt-1">
                Your Rating:{" "}
                {store.userRating ? (
                  <b>{store.userRating}</b>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">Not rated yet</span>
                )}
              </p>

              {/* Rating buttons */}
              {!store.userRating && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleRate(store.id, num)}
                      className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-blue-500 hover:text-white"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}