import { useMemo, useState } from 'react';

import FeatureShell from '../components/FeatureShell';
import PaginationControls from '../components/PaginationControls';
import { generateQuestions, tierRules } from '../lib/aiContent';

const tierOptions = ['free', 'member', 'pro', 'memberBonus', 'proBonus'];

export default function QuestionsPage() {
  const [tier, setTier] = useState('free');
  const [page, setPage] = useState(1);

  const allQuestions = useMemo(() => generateQuestions(300), []);
  const tierInfo = tierRules[tier];
  const total = tierInfo.maxQuestions;
  const pagedQuestions = allQuestions.slice(0, total);
  const totalPages = Math.max(total, 1);
  const item = pagedQuestions[page - 1];

  function handleTierChange(event) {
    setTier(event.target.value);
    setPage(1);
  }

  function handlePrev() {
    setPage((current) => Math.max(current - 1, 1));
  }

  function handleNext() {
    setPage((current) => Math.min(current + 1, totalPages));
  }

  return (
    <FeatureShell title="Questions">
      <section className="auth-card">
        <h2>Questions Pagination</h2>
        <select id="questionsTier" name="questionsTier" className="form-control auth-input" value={tier} onChange={handleTierChange}>
          {tierOptions.map((key) => (
            <option key={key} value={key}>{tierRules[key].label}</option>
          ))}
        </select>
        {item ? (
          <article className="question-panel">
            <img src={item.image} alt={item.title} className="client-image" loading="lazy" />
            <h3>{item.id}. {item.title}</h3>
            <p>{item.text}</p>
          </article>
        ) : null}
        <PaginationControls page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />
      </section>
    </FeatureShell>
  );
}
