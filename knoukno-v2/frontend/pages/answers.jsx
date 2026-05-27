import { useMemo, useState } from 'react';

import FeatureShell from '../components/FeatureShell';
import PaginationControls from '../components/PaginationControls';
import { generateQuestions, tierRules } from '../lib/aiContent';
import { loadWorkspace, saveWorkspace } from '../lib/clientStore';

const tierOptions = ['free', 'member', 'pro', 'memberBonus', 'proBonus'];

export default function AnswersPage() {
  const [tier, setTier] = useState('free');
  const [page, setPage] = useState(1);
  const [note, setNote] = useState('');

  const allQuestions = useMemo(() => generateQuestions(300), []);
  const total = tierRules[tier].maxQuestions;
  const viewItems = allQuestions.slice(0, total);
  const item = viewItems[page - 1];
  const totalPages = Math.max(total, 1);

  function currentAnswer() {
    const state = loadWorkspace();
    const hit = state.answers.find((entry) => entry.questionId === item.id);
    return hit ? hit.text : '';
  }

  const [answerText, setAnswerText] = useState('');

  function handleTierChange(event) {
    setTier(event.target.value);
    setPage(1);
    setAnswerText('');
  }

  function handleSave() {
    const state = loadWorkspace();
    const nextAnswers = state.answers.filter((entry) => entry.questionId !== item.id);
    nextAnswers.push({
      questionId: item.id,
      title: item.title,
      question: item.text,
      text: answerText
    });

    saveWorkspace({
      ...state,
      answers: nextAnswers
    });

    setNote('Answer saved.');
  }

  return (
    <FeatureShell title="Answers">
      <section className="auth-card">
        <h2>Answers Pagination</h2>
        <select id="answersTier" name="answersTier" className="form-control auth-input" value={tier} onChange={handleTierChange}>
          {tierOptions.map((key) => (
            <option key={key} value={key}>{tierRules[key].label}</option>
          ))}
        </select>

        {item ? (
          <article className="question-panel">
            <h3>{item.id}. {item.title}</h3>
            <p>{item.text}</p>
            <textarea
              id="answerText"
              name="answerText"
              className="form-control auth-input auth-textarea"
              placeholder="The client writes the answer here"
              value={answerText || currentAnswer()}
              onChange={(event) => setAnswerText(event.target.value)}
            />
            <button type="button" className="btn auth-button" onClick={handleSave}>Save Answer</button>
            {note ? <p className="auth-note">{note}</p> : null}
          </article>
        ) : null}

        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={() => { setPage((current) => Math.max(current - 1, 1)); setAnswerText(''); }}
          onNext={() => { setPage((current) => Math.min(current + 1, totalPages)); setAnswerText(''); }}
        />
      </section>
    </FeatureShell>
  );
}
