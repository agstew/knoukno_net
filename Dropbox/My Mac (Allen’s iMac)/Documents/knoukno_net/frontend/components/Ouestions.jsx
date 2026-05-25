"use client";

import { useMemo, useState } from "react";
import Pagination from "@/components/Pagination";

const QUESTION_POOL = Array.from({ length: 300 }, (_, i) =>
  `AI Question ${i + 1}: What startup step should be improved this week to increase execution quality?`
);

export default function Ouestions() {
  const pageSize = 5;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(QUESTION_POOL.length / pageSize);
  const visible = useMemo(() => {
    const start = (page - 1) * pageSize;
    return QUESTION_POOL.slice(start, start + pageSize);
  }, [page]);

  return (
    <section className="info-card mb-4">
      <h3>Ouestions.jsx - Pagination</h3>
      <ol start={(page - 1) * pageSize + 1}>
        {visible.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </section>
  );
}
