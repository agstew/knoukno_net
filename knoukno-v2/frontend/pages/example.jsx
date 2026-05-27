import { useMemo, useState } from 'react';

import FeatureShell from '../components/FeatureShell';
import PaginationControls from '../components/PaginationControls';
import { generateExamples, tierRules } from '../lib/aiContent';

const tierOptions = ['free', 'member', 'pro', 'memberBonus', 'proBonus'];

export default function ExamplePage() {
  const [tier, setTier] = useState('free');
  const [page, setPage] = useState(1);

  const allExamples = useMemo(() => generateExamples(300), []);
  const tierInfo = tierRules[tier];
  const total = tierInfo.maxQuestions;
  const pagedExamples = allExamples.slice(0, total);
  const totalPages = Math.max(total, 1);
  const item = pagedExamples[page - 1];

  function handleTierChange(event) {
    setTier(event.target.value);
    setPage(1);
  }

  return (
    <FeatureShell title="Example">
      <section className="auth-card">
        <h2>Example Pagination</h2>
        <select id="exampleTier" name="exampleTier" className="form-control auth-input" value={tier} onChange={handleTierChange}>
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
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((current) => Math.max(current - 1, 1))}
          onNext={() => setPage((current) => Math.min(current + 1, totalPages))}
        />
      </section>
    </FeatureShell>
  );
}
