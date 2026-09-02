import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader, { Alert, StagePill } from '../components/Loader.jsx';
import Example from './Example.jsx';
import { useActiveTitle } from '../hooks/useActiveTitle.js';

const PER_PAGE = 1;

/** Question.js — one question per page, with answers written by the client. */
export default function Question() {
  const { titleId, titleName } = useActiveTitle();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!titleId) return;
    try {
      const res = await api.get(`/questions/${titleId}?page=${page}&limit=${PER_PAGE}`);
      setData(res);
      setDrafts(
        Object.fromEntries(res.questions.map((q) => [q.id, q.answer?.body || ''])),
      );
    } catch (err) {
      setError(err.message);
    }
  }, [titleId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async (count) => {
    setError('');
    setGenerating(true);
    try {
      const result = await api.post(`/questions/${titleId}/generate`, { count });
      const nextPage = (data?.pagination.total || 0) + result.questions.length;
      if (nextPage === page) await load();
      else setPage(Math.max(1, nextPage));
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const nextQuestion = async () => {
    if (page < pagination.total) {
      setPage(page + 1);
      return;
    }
    if (entitlements.remaining > 0) await generate(1);
  };

  const saveAnswer = async (questionId) => {
    setSaving((s) => ({ ...s, [questionId]: true }));
    setError('');
    try {
      await api.put(`/answers/${questionId}`, { body: drafts[questionId] });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving((s) => ({ ...s, [questionId]: false }));
    }
  };

  if (!titleId) {
    return (
      <section className="kk-section kk-section--alt text-center">
        <div className="container">
          <h1 className="kk-section__title">Pick a business title first</h1>
          <Link className="btn btn-primary px-4" to="/title">Go to Title</Link>
        </div>
      </section>
    );
  }

  if (!data) return <Loader label="Loading your questions…" />;

  const { pagination, entitlements, questions } = data;

  return (
    <section className="kk-section kk-section--alt">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <span className="kk-section__eyebrow">Questions</span>
            <h1 className="kk-section__title mb-0">{titleName}</h1>
          </div>
          <div className="d-flex gap-2 no-print">
            <button
              className="btn btn-outline-secondary"
              onClick={() => window.print()}
              type="button"
            >
              Print page
            </button>
            <button
              className="btn btn-gold px-3"
              onClick={() => generate(1)}
              disabled={generating || entitlements.remaining < 1}
              type="button"
            >
              {generating ? 'Writing…' : 'Write the next question'}
            </button>
          </div>
        </div>

        <Alert onClose={() => setError('')}>{error}</Alert>

        <p className="text-muted">
          {entitlements.used} of {entitlements.quota} questions used · {entitlements.remaining} left
          on the {entitlements.tierName}
        </p>

        {!questions.length ? (
          <div className="kk-card p-5 text-center">
            <h2 className="h4">No questions yet</h2>
            <p className="text-muted">
              The AI writes them around <strong>{titleName}</strong>, starting with the law.
            </p>
            <button
              className="btn btn-primary px-4"
              onClick={() => generate(1)}
              disabled={generating || !entitlements.remaining}
              type="button"
            >
              {generating ? 'Writing your question…' : 'Write my first question'}
            </button>
          </div>
        ) : (
          <div className="d-grid gap-4">
            {questions.map((q) => (
              <article className="kk-card kk-card__top p-4 p-md-5" key={q.id}>
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <StagePill stage={q.stage} />
                  <span className="text-muted small">
                    Question {q.position} · {q.wordCount} words
                  </span>
                </div>

                <p className="fs-5 lh-base no-print">{q.prompt}</p>

                <Example question={q} />

                <label className="form-label fw-semibold mt-4 no-print" htmlFor={`answer-${q.id}`}>
                  Your answer
                </label>
                <textarea
                  id={`answer-${q.id}`}
                  className="form-control kk-textarea no-print"
                  value={drafts[q.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                  placeholder="The answer comes from you."
                />

                <p className="kk-print-only mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                  {drafts[q.id] || ''}
                </p>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 no-print">
                  <span className="small text-muted">
                    {(drafts[q.id] || '').trim().split(/\s+/).filter(Boolean).length} words
                    {q.answer && ` · saved ${new Date(q.answer.updatedAt).toLocaleString()}`}
                  </span>
                  <button
                    className="btn btn-primary px-4"
                    onClick={() => saveAnswer(q.id)}
                    disabled={saving[q.id] || !(drafts[q.id] || '').trim()}
                    type="button"
                  >
                    {saving[q.id] ? 'Saving…' : 'Save answer'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5">
          <nav aria-label="Questions">
            <ul className="pagination justify-content-center mb-0">
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1 || generating}
                >
                  Previous
                </button>
              </li>
              <li className="page-item active" aria-current="page">
                <span className="page-link">{page}</span>
              </li>
              <li
                className={`page-item ${
                  page >= pagination.total && entitlements.remaining < 1 ? 'disabled' : ''
                }`}
              >
                <button
                  className="page-link"
                  type="button"
                  onClick={nextQuestion}
                  disabled={generating || (page >= pagination.total && entitlements.remaining < 1)}
                >
                  {generating ? 'Writing…' : 'Next'}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
