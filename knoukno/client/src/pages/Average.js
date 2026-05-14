import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, F: 0 };
const TIER_DENOMINATORS = { free: 5, member: 50, pro: 75, bonus: 100 };
const TIER_QUESTION_COUNTS = { free: 5, member: 50, pro: 75, bonus: 100 };

function letterFromPct(pct) {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

export default function Average() {
  const { titleId } = useParams();
  const { token, user } = useAuth();

  const [answers, setAnswers] = useState([]);
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const tier = user?.tier || 'free';
  const denominator = TIER_DENOMINATORS[tier];
  const questionCount = TIER_QUESTION_COUNTS[tier];
  const maxPoints = denominator * 5;

  useEffect(() => {
    async function load() {
      try {
        const [aRes, tRes] = await Promise.all([
          axios.get(`/api/answers/${titleId}`, authHeaders),
          axios.get(`/api/titles/${titleId}`, authHeaders),
        ]);
        setAnswers(aRes.data || []);
        setTitle(tRes.data?.title || tRes.data || {});
      } catch (e) {
        setError('Failed to load average data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [titleId]);

  const totalPoints = answers.reduce((sum, a) => sum + (GRADE_POINTS[a.grade] ?? 0), 0);
  const answeredCount = answers.filter(a => a.answerText).length;
  const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
  const pctDisplay = percentage.toFixed(1);
  const letterGrade = letterFromPct(percentage);

  // Grade distribution
  const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  answers.forEach(a => { if (a.grade && dist[a.grade] !== undefined) dist[a.grade]++; });

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-brand"><Link to="/dashboard">Kno U <span>Kno</span></Link></div>
        <div className="navbar-links">
          <Link to={`/grade/${titleId}`}>← Grade Report</Link>
          <Link to={`/rate/${titleId}`} className="btn btn-outline btn-sm">Rate View</Link>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Average Score</h1>
            {title?.name && <p className="subtext">{title.name}</p>}
          </div>
          <span className={`grade-badge-xl grade-${letterGrade}`}>{letterGrade}</span>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {/* Formula display */}
        <div className="formula-card">
          <div className="formula-title">How Your Average Is Calculated</div>
          <div className="formula-equation">
            <span className="formula-part">{totalPoints} pts earned</span>
            <span className="formula-div">÷</span>
            <span className="formula-part">{maxPoints} max pts</span>
            <span className="formula-eq">=</span>
            <span className="formula-result">{pctDisplay}%</span>
          </div>
          <div className="formula-note">
            {tier.charAt(0).toUpperCase() + tier.slice(1)} tier: {denominator} denominator × 5 points = {maxPoints} max possible
          </div>
        </div>

        {/* Big score display */}
        <div className="average-hero">
          <div className="average-pct">{pctDisplay}%</div>
          <div className="average-label">Your Business Readiness Score</div>
          <div className={`average-grade grade-${letterGrade}`}>{letterGrade}</div>
        </div>

        {/* Progress bar */}
        <div className="avg-progress-wrap">
          <div className="avg-progress-bar">
            <div
              className={`avg-progress-fill grade-fill-${letterGrade}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="avg-progress-labels">
            <span>0%</span>
            <span>F &lt;60</span>
            <span>D 60</span>
            <span>C 70</span>
            <span>B 80</span>
            <span>A 90+</span>
          </div>
        </div>

        {/* Stats */}
        <div className="avg-stats-grid">
          <div className="avg-stat">
            <div className="avg-stat-n">{answeredCount}</div>
            <div className="avg-stat-l">Questions Answered</div>
          </div>
          <div className="avg-stat">
            <div className="avg-stat-n">{questionCount}</div>
            <div className="avg-stat-l">Total in Tier</div>
          </div>
          <div className="avg-stat">
            <div className="avg-stat-n">{totalPoints}</div>
            <div className="avg-stat-l">Points Earned</div>
          </div>
          <div className="avg-stat">
            <div className="avg-stat-n">{maxPoints}</div>
            <div className="avg-stat-l">Max Possible</div>
          </div>
        </div>

        {/* Grade distribution */}
        <div className="dist-section">
          <h3>Grade Distribution</h3>
          <div className="dist-bars">
            {Object.entries(dist).map(([g, count]) => (
              <div key={g} className="dist-bar-item">
                <span className={`grade-badge grade-${g}`}>{g}</span>
                <div className="dist-bar-track">
                  <div
                    className={`dist-bar-fill grade-fill-${g}`}
                    style={{ width: answeredCount > 0 ? `${(count / answeredCount) * 100}%` : '0%' }}
                  />
                </div>
                <span className="dist-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grade-actions">
          <Link to={`/grade/${titleId}`} className="btn btn-outline">← Grade Report</Link>
          <Link to={`/rate/${titleId}`} className="btn btn-primary">Rate View →</Link>
          <Link to="/titles" className="btn btn-outline">All Assessments</Link>
        </div>
      </div>
    </div>
  );
}
