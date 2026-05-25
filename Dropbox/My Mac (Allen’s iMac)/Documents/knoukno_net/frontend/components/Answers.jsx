"use client";

import { useMemo, useState } from "react";
import Pagination from "@/components/Pagination";

export default function Answers() {
  const [answers, setAnswers] = useState(() =>
    Array.from({ length: 75 }, (_, i) => ({
      id: i + 1,
      question: `Client Question ${i + 1}`,
      answer: ""
    }))
  );

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(answers.length / pageSize);

  const visible = useMemo(() => {
    const start = (page - 1) * pageSize;
    return answers.slice(start, start + pageSize);
  }, [answers, page]);

  function updateAnswer(id, value) {
    setAnswers((current) =>
      current.map((item) => (item.id === id ? { ...item, answer: value } : item))
    );
  }

  return (
    <section className="info-card mb-4">
      <h3>Answers.jsx - Pagination</h3>
      {visible.map((item) => (
        <div className="mb-3" key={item.id}>
          <label className="form-label fw-bold">{item.question}</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Write your answer..."
            value={item.answer}
            onChange={(e) => updateAnswer(item.id, e.target.value)}
          />
        </div>
      ))}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </section>
  );
}
