"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function Admin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/dashboard/admin")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="info-card mb-4">
      <h3>Admin.jsx</h3>
      <p className="mb-2">Admin Email: {data?.adminEmail || "admin@knoukno.net"}</p>
      {error ? <p className="text-danger">{error}</p> : null}
      {!error && !data ? <p>Loading admin dashboard...</p> : null}
      {data ? (
        <>
          <h5>Collection Links</h5>
          <ul>
            {data.collectionLinks.map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
