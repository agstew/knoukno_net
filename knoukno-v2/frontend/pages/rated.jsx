import { useMemo, useState } from 'react';

import FeatureShell from '../components/FeatureShell';
import PaginationControls from '../components/PaginationControls';
import { generateQuestions } from '../lib/aiContent';
import { loadWorkspace, saveWorkspace } from '../lib/clientStore';

export default function RatedPage() {
  const [page, setPage] = useState(1);
  const [value, setValue] = useState('3');
  const [note, setNote] = useState('');
  const questions = useMemo(() => generateQuestions(300), []);
  const item = questions[page - 1];

  function handleSave() {
    const state = loadWorkspace();
    const next = state.ratings.filter((entry) => entry.questionId !== item.id);
    next.push({
      questionId: item.id,
      title: item.title,
      value: Number(value || 0)
    });

    saveWorkspace({
      ...state,
      ratings: next
    });
    setNote('Rating saved.');
  }

  return (
    <FeatureShell title="Rated">
      <section className="auth-card">
        <h2>Rate Question</h2>
        <h3>{item.id}. {item.title}</h3>
        <p>{item.text}</p>
        <input id="ratingValue" name="ratingValue" className="form-control auth-input" type="number" min="1" max="5" value={value} onChange={(event) => setValue(event.target.value)} />
        <button type="button" className="btn auth-button" onClick={handleSave}>Save Rating</button>
        {note ? <p className="auth-note">{note}</p> : null}
        <PaginationControls
          page={page}
          totalPages={300}
          onPrev={() => setPage((current) => Math.max(current - 1, 1))}
          onNext={() => setPage((current) => Math.min(current + 1, 300))}
        />
      </section>
    </FeatureShell>
  );
}
