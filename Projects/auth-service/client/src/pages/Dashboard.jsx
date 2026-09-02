import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader, { Alert } from '../components/Loader.jsx';
import { useActiveTitle } from '../hooks/useActiveTitle.js';
import { useAuth } from '../context/AuthContext.jsx';

const CARDS = [
  { to: '/questions', label: 'Questions', text: 'Answer the next question in the path.', gold: true },
  { to: '/grade', label: 'Grade', text: 'Give every answer a grade from A to F and see the total.' },
  { to: '/rated', label: 'Rated', text: 'Rank your answers 1, 2, 3 and move them where they belong.' },
  { to: '/average', label: 'Average', text: 'The average of every grade, stage by stage.' },
  { to: '/print', label: 'Print / Save', text: 'Print or save the whole workbook.' },
];

export default function Dashboard() {
  const { titleId, titleName, select } = useActiveTitle();
  const { entitlements } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!titleId) return;
    api
      .get(`/titles/${titleId}`)
      .then((res) => {
        setData(res);
        select(res.title.id, res.title.business_title);
      })
      .catch((err) => setError(err.message));
    // select is stable; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleId]);

  if (!titleId) {
    return (
      <section className="kk-section kk-section--alt text-center">
        <div className="container">
          <h1 className="kk-section__title">Pick a business title first</h1>
          <p className="lead">The dashboard works on one business at a time.</p>
          <Link className="btn btn-primary px-4" to="/title">Go to Title</Link>
        </div>
      </section>
    );
  }

  if (error) return <div className="container py-5"><Alert>{error}</Alert></div>;
  if (!data) return <Loader label="Opening your dashboard…" />;

  const { stats } = data;
  const titleEntitlements = data.entitlements || entitlements;
  const paid = titleEntitlements && titleEntitlements.tier !== 'free';

  return (
    <section className="kk-section kk-section--alt">
      <div className="container">
        <span className="kk-section__eyebrow">Dashboard</span>
        <h1 className="kk-section__title mb-1">
          <Link className="text-body text-decoration-none" to="/questions">
            {titleName || data.title.business_title}
          </Link>
        </h1>
        <p className="text-muted mb-4">
          {[data.title.industry, data.title.location].filter(Boolean).join(' · ')}
        </p>

        {titleEntitlements && (
          <div className="kk-card p-4 mb-4">
            <div className="row g-3 text-center align-items-start">
              <div className="col-6 col-lg-3 border-end">
                <div className="h3 mb-0 text-primary">{titleEntitlements.remaining}</div>
                <div className="small text-muted">questions left</div>
                <div className="small text-muted">for this {titleEntitlements.tierName} business</div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="h3 mb-0">{stats.question_count}</div>
                <div className="small text-muted">questions written</div>
                <div className="small text-muted">for this business</div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="h3 mb-0">{stats.answer_count}</div>
                <div className="small text-muted">answers saved</div>
                <div className="small text-muted">for this business</div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="h3 mb-0">{stats.graded_count}</div>
                <div className="small text-muted">graded</div>
                <div className="small text-muted">for this business</div>
              </div>
            </div>

            {!paid && (
              <div className="alert alert-warning mt-4 mb-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <span>
                  Free tier: {titleEntitlements.quota} questions for 3 days. Grade, Rate, and Average are
                  for Member and Pro.
                </span>
                <button className="btn btn-gold btn-sm px-3" onClick={() => navigate('/price')}>
                  Buy Now
                </button>
              </div>
            )}
          </div>
        )}

        <div className="row g-4">
          {CARDS.map((card) => {
            const locked = !paid && ['Grade', 'Rated', 'Average'].includes(card.label);
            return (
              <div className="col-md-6 col-lg-4" key={card.to}>
                <Link
                  to={locked ? '/price' : card.to}
                  className={`kk-card kk-card--link h-100 p-4 d-block text-decoration-none text-body ${
                    card.gold ? 'kk-card__top kk-card__top--gold' : 'kk-card__top'
                  }`}
                >
                  <h2 className="h5 mb-2">
                    {card.label}
                    {locked && <span className="badge bg-secondary ms-2">Member</span>}
                  </h2>
                  <p className="text-muted mb-0">{card.text}</p>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
