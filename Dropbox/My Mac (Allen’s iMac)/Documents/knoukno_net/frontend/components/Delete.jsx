"use client";

import { useState } from "react";

export default function Delete() {
  const [message, setMessage] = useState("");

  function handleDelete() {
    setMessage("Delete action queued. Connect to /api/collections/delete to persist logs.");
  }

  return (
    <section className="info-card mb-4">
      <h3>Delete.jsx</h3>
      <p>Remove entries and keep a delete log for admin review.</p>
      <button className="btn btn-danger" onClick={handleDelete}>
        Delete Selected
      </button>
      {message ? <p className="mt-2 mb-0">{message}</p> : null}
    </section>
  );
}
