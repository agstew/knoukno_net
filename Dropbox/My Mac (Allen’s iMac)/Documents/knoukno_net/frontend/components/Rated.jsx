"use client";

import { useState } from "react";

export default function Rated() {
  const [rating, setRating] = useState(4);

  return (
    <section className="info-card mb-4">
      <h3>Rated.jsx</h3>
      <p>Rate the answer quality from 1 to 5.</p>
      <select
        className="form-select"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <p className="mt-2 mb-0">Current Rating: {rating}</p>
    </section>
  );
}
