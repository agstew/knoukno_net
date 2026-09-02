import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader, { Alert } from '../components/Loader.jsx';
import { useActiveTitle } from '../hooks/useActiveTitle.js';

const STAGE_LABEL = {
  law: 'Law',
  location: 'Location',
  hiring: 'Hiring',
  people: 'People',
};

/** Average.js — the roll-up of every grade for the business title. */
export default function Average() {
  const { titleId, titleName } = useActiveTitle();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!titleId) return;
    api
      .get(`/averages/${titleId}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [titleId]);

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

  if (error) return <div className="container py-5"><Alert>{error}</Alert></div>;
  if (!data) return <Loader label="Working out your average…" />;

  const { summary, byStage } = data;

  return (
    <section className="kk-section kk-section--alt">
      <div className="container">
        <span className="kk-section__eyebrow">Average</span>
        <h1 className="kk-section__title mb-1">{titleName}</h1>
        <p className="text-muted mb-4">
          Every grade added together and divided by the number of graded answers.
        </p>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="kk-card kk-card__top kk-card__top--gold p-5 text-center h-100">
              <div
                className={`kk-grade-badge kk-grade-badge--${summary.letter || 'F'} mx-auto mb-3`}
                style={{ width: 96, height: 96, fontSize: '2.5rem' }}
              >
                {summary.letter || '–'}
              </div>
              <div className="display-5 fw-bolder mb-0">{summary.averagePoints}</div>
              <p className="text-muted">average grade point (out of 4)</p>
              <hr />
              <div className="row text-center">
                <div className="col-4">
                  <div className="h4 mb-0">{summary.totalPoints}</div>
                  <div className="small text-muted">total</div>
                </div>
                <div className="col-4">
                  <div className="h4 mb-0">{summary.gradedCount}</div>
                  <div className="small text-muted">graded</div>
                </div>
                <div className="col-4">
                  <div className="h4 mb-0">{summary.answerCount}</div>
                  <div className="small text-muted">answers</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="kk-card kk-card__top p-4 h-100">
              <h2 className="h5 mb-4">Stage by stage</h2>

              {!byStage.length ? (
                <p className="text-muted mb-0">
                  Nothing graded yet. Go to <Link to="/grade">Grade</Link> and score your answers.
                </p>
              ) : (
                byStage.map((stage) => (
                  <div className="mb-4" key={stage.stage}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">{STAGE_LABEL[stage.stage] || stage.stage}</span>
                      <span className="text-muted small">
                        {stage.averagePoints} / 4 · {stage.graded} graded
                      </span>
                    </div>
                    <div className="progress" style={{ height: 12 }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${(stage.averagePoints / 4) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={stage.averagePoints}
                        aria-valuemin="0"
                        aria-valuemax="4"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 no-print">
          <button className="btn btn-outline-secondary px-4" onClick={() => window.print()} type="button">
            Print page
          </button>
        </div>
      </div>
    </section>
  );
}
