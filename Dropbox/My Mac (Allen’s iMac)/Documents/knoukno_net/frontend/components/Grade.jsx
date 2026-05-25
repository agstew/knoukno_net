"use client";

import { useState } from "react";

export default function Grade() {
  const [score, setScore] = useState(75);

  return (
    <section className="info-card mb-4">
      <h3>Grade.jsx</h3>
      <p>Grade your execution quality from 0 to 100.</p>
      <input
        type="range"
        min={0}
        max={100}
        value={score}
        className="form-range"
        onChange={(e) => setScore(Number(e.target.value))}
      />
      <p className="mb-0 fw-bold">Score: {score}</p>
    </section>
  );
}
