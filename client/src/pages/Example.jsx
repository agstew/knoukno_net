import { useState } from 'react';

/** Example.js — the AI-written worked example that sits with each question. */
export default function Example({ question }) {
  const [open, setOpen] = useState(false);

  if (!question.example) return null;

  return (
    <div className="border-start border-4 border-gold ps-3 mt-3 no-print">
      <button
        type="button"
        className="btn btn-link p-0 fw-semibold text-decoration-none no-print"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? 'Hide the example' : 'Show me an example'}
      </button>

      {open && (
        <div className="mt-2">
          {question.example.split(/\n{2,}/).map((paragraph, i) => (
            <p className="text-muted mb-2" key={i}>
              {paragraph}
            </p>
          ))}
          <p className="small fst-italic mb-0">
            This is only an example. The answer still comes from you.
          </p>
        </div>
      )}
    </div>
  );
}
