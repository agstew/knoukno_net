import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader, { Alert } from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';
import AnswersList from './AnswersList.jsx';
import { useActiveTitle } from '../hooks/useActiveTitle.js';

const LETTERS = ['A', 'B', 'C', 'D', 'F'];

/** Grade.js — every answer gets a grade, and the grades are added up. */
export default function Grade() {
  const { titleId, titleName } = useActiveTitle();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!titleId) return;
    try {
      setData(await api.get(`/grades/${titleId}?page=${page}&limit=5`));
    } catch (err) {
      setError(err.message);
    }
  }, [titleId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setGrade = async (answerId, letter) => {
    setError('');
    try {
      await api.put(`/grades/${answerId}`, { letter });
      await load();
    } catch (err) {
      setError(err.message);
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

  if (error && !data) return <div className="container py-5"><Alert>{error}</Alert></div>;
  if (!data) return <Loader label="Loading your grades…" />;

  const { summary, scale, answers } = data;

  return (
    <section className="kk-section kk-section--alt">
      <div className="container">
        <span className="kk-section__eyebrow">Grade</span>
        <h1 className="kk-section__title mb-1">{titleName}</h1>
        <p className="text-muted mb-4">
          A = {scale.A}, B = {scale.B}, C = {scale.C}, D = {scale.D}, F = {scale.F}. Every answer
          gets a grade, and the grades are added together.
        </p>

        <Alert onClose={() => setError('')}>{error}</Alert>

        <div className="kk-card kk-card__top kk-card__top--gold p-4 mb-4">
          <div className="row g-3 text-center">
            <div className="col-6 col-lg-3">
              <div className="h2 mb-0 text-primary">{summary.totalPoints}</div>
              <div className="small text-muted">total grade points</div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="h2 mb-0">{summary.maxPoints}</div>
              <div className="small text-muted">possible from saved answers</div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="h2 mb-0">{summary.gradedCount}/{summary.questionCount}</div>
              <div className="small text-muted">plan questions graded</div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="h2 mb-0">{summary.percent}%</div>
              <div className="small text-muted">score on graded answers</div>
            </div>
          </div>

          <p className="text-center text-muted small mt-3 mb-0">
            {summary.writtenCount} questions written · {summary.answerCount} answers saved ·{' '}
            {summary.questionCount - summary.writtenCount} questions not written yet
          </p>
        </div>

        <AnswersList
          answers={answers}
          emptyText="Answer a question and it will show up here to be graded."
          renderTrail={(answer) => (
            <div className="btn-group-vertical no-print" role="group" aria-label="Grade">
              {LETTERS.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className={`btn btn-sm ${
                    answer.letter === letter ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setGrade(answer.answer_id, letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
          renderLead={(answer) =>
            answer.letter ? (
              <span className={`kk-grade-badge kk-grade-badge--${answer.letter}`}>
                {answer.letter}
              </span>
            ) : (
              <span className="kk-grade-badge bg-light text-muted border">–</span>
            )
          }
        />

        <div className="mt-4">
          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            onChange={setPage}
          />
        </div>
      </div>
    </section>
  );
}
