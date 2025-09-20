import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function StoreList() {
  const [stores, setStores] = useState([]);

  // ✅ Load stores
  useEffect(() => {
    API.get("/user/stores")
      .then((res) => setStores(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Handle rating
  const handleRate = async (storeId) => {
    const score = prompt("Enter rating (1-5):");
    if (!score) return;

    try {
      await API.post(`/user/stores/${storeId}/rate`, {
        score: Number(score),
        comment: "Nice store!",
      });
      alert("✅ Rating submitted!");

      // refresh store list to update rating
      const updated = await API.get("/user/stores");
      setStores(updated.data);
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error rating store"));
    }
  };

  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      {stores.map((store) => (
        <div key={store.id} className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold">{store.name}</h2>
          <p className="text-gray-600">{store.address}</p>
          <p className="mt-2 text-yellow-600">
            ⭐{" "}
            {store.avgRating
              ? `${Number(store.avgRating).toFixed(1)} (${store.ratingCount} ratings)`
              : "No ratings yet"}
          </p>
          <button
            onClick={() => handleRate(store.id)}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            ⭐ Rate
          </button>
        </div>
      ))}
    </div>
  );
}