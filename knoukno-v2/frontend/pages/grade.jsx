import { useMemo, useState } from 'react';

import FeatureShell from '../components/FeatureShell';
import PaginationControls from '../components/PaginationControls';
import { generateQuestions } from '../lib/aiContent';
import { loadWorkspace, saveWorkspace } from '../lib/clientStore';

export default function GradePage() {
  const [page, setPage] = useState(1);
  const [value, setValue] = useState('0');
  const [note, setNote] = useState('');
  const questions = useMemo(() => generateQuestions(300), []);
  const item = questions[page - 1];

  function handleSave() {
    const state = loadWorkspace();
    const next = state.grades.filter((entry) => entry.questionId !== item.id);
    next.push({
      questionId: item.id,
      title: item.title,
      value: Number(value || 0)
    });

    saveWorkspace({
      ...state,
      grades: next
    });
    setNote('Grade saved.');
  }

  return (
    <FeatureShell title="Grade">
      <section className="auth-card">
        <h2>Grade Question</h2>
        <h3>{item.id}. {item.title}</h3>
        <p>{item.text}</p>
        <input id="gradeValue" name="gradeValue" className="form-control auth-input" type="number" min="0" max="100" value={value} onChange={(event) => setValue(event.target.value)} />
        <button type="button" className="btn auth-button" onClick={handleSave}>Save Grade</button>
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
