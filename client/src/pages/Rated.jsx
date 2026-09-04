import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader, { Alert, StagePill } from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import { useActiveTitle } from '../hooks/useActiveTitle.js';

/**
 * Rated.js — the answers numbered 1, 2, 3 ... If you do not like a number,
 * pick the answer up and move it to a new place.
 */
export default function Rated() {
  const { titleId, titleName } = useActiveTitle();
  const [page, setPage] = useState(1);
  const [answers, setAnswers] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef(null);
  const [overIndex, setOverIndex] = useState(null);

  const load = useCallback(async () => {
    if (!titleId) return;
    try {
      const data = await api.get(`/ratings/${titleId}?page=${page}&limit=5`);
      setAnswers(data.answers);
      setPagination(data.pagination);
      setDirty(false);
    } catch (err) {
      setError(err.message);
    }
  }, [titleId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const move = (from, to) => {
    if (from === to || from == null || to == null) return;
    setAnswers((list) => {
      const next = [...list];
      const [picked] = next.splice(from, 1);
      next.splice(to, 0, picked);
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/ratings/${titleId}`, {
        order: answers.map((a) => a.answer_id),
        startRank: (page - 1) * 5 + 1,
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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

  if (error && !answers) return <div className="container py-5"><Alert>{error}</Alert></div>;
  if (!answers) return <Loader label="Loading your ranking…" />;

  return (
    <section className="kk-section kk-section--alt">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <span className="kk-section__eyebrow">Rated</span>
            <h1 className="kk-section__title mb-0">{titleName}</h1>
          </div>
          <button
            className="btn btn-gold px-4 no-print"
            onClick={save}
            disabled={!dirty || saving}
            type="button"
          >
            {saving ? 'Saving…' : 'Save the order'}
          </button>
        </div>

        <p className="text-muted">
          The number tells you which answer is first, second, third. Drag an answer to a new place —
          or use the arrows — then save the order.
        </p>

        <Alert onClose={() => setError('')}>{error}</Alert>

        {!answers.length ? (
          <div className="kk-card p-5 text-center text-muted">
            No answers to rank yet. Answer a question first.
          </div>
        ) : (
          <ol className="list-unstyled d-grid gap-3 mb-0">
            {answers.map((answer, index) => (
              <li
                key={answer.answer_id}
                className={`kk-card kk-card__top kk-rate-item p-4 ${
                  overIndex === index ? 'is-over' : ''
                } ${dragIndex.current === index ? 'is-dragging' : ''}`}
                draggable
                onDragStart={() => {
                  dragIndex.current = index;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(index);
                }}
                onDragLeave={() => setOverIndex(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  move(dragIndex.current, index);
                  dragIndex.current = null;
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  dragIndex.current = null;
                  setOverIndex(null);
                }}
              >
                <div className="d-flex gap-3 align-items-start">
                  <span className="kk-rank">{(page - 1) * 5 + index + 1}</span>

                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                      <StagePill stage={answer.stage} />
                      <span className="small text-muted">Question {answer.position}</span>
                    </div>
                    <p className="fw-semibold mb-2 no-print">{answer.prompt}</p>
                    <p className="mb-0 text-body-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                      {answer.body}
                    </p>
                  </div>

                  <div className="btn-group-vertical no-print" role="group" aria-label="Move answer">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => move(index, index + 1)}
                      disabled={index === answers.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        {pagination && (
          <div className="mt-4">
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </section>
  );
}
