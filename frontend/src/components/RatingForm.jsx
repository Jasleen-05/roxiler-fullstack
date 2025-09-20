import React, { useState } from "react";

export default function RatingForm({ storeId, onRated }) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/user/rate/${storeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to rate");

      alert("✅ Rating submitted!");
      onRated(); // refresh store list or ratings
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      {error && <p className="text-red-500">{error}</p>}
      <select
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="border p-2 rounded w-full mb-2"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} ⭐
          </option>
        ))}
      </select>
      <textarea
        placeholder="Write a comment..."
        className="border p-2 rounded w-full mb-2"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Submit Rating
      </button>
    </form>
  );
}