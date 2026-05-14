import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, F: 0 };
const TIER_DENOMINATORS = { free: 5, member: 50, pro: 75, bonus: 100 };

function GradeBadge({ grade }) {
  if (!grade) return <span className="grade-badge grade-none">—</span>;
  return <span className={`grade-badge grade-${grade}`}>{grade}</span>;
}

function calcOverall(totalPoints, maxPoints) {
  if (maxPoints === 0) return '—';
  const pct = (totalPoints / maxPoints) * 100;
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

export default function Grade() {
  const { titleId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState([]);
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [calcDone, setCalcDone] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const tier = user?.tier || 'free';
  const denominator = TIER_DENOMINATORS[tier];
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
        setError('Failed to load grade data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [titleId]);

  const totalPoints = answers.reduce((sum, a) => sum + (GRADE_POINTS[a.grade] ?? 0), 0);
  const overallGrade = calcOverall(totalPoints, maxPoints);
  const percentage = maxPoints > 0 ? ((totalPoints / maxPoints) * 100).toFixed(1) : '0.0';

  const handleCalculate = async () => {
    setCalculating(true);
    setError('');
    try {
      await axios.post('/api/grades/calculate', { titleId }, authHeaders);
      setCalcDone(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Calculation failed.');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-brand"><Link to="/dashboard">Kno U <span>Kno</span></Link></div>
        <div className="navbar-links">
          <Link to={`/questions/${titleId}`}>← Back to Questions</Link>
          <Link to={`/average/${titleId}`} className="btn btn-outline btn-sm">View Average</Link>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Grade Report</h1>
            {title?.name && <p className="subtext">{title.name}</p>}
          </div>
          <div className="overall-grade-display">
            <GradeBadge grade={overallGrade} />
            <div className="overall-label">Overall</div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {calcDone && <div className="success-banner">✓ Final grade saved to your record!</div>}

        {/* Summary cards */}
        <div className="grade-summary-grid">
          <div className="summary-card">
            <div className="summary-number">{totalPoints}</div>
            <div className="summary-label">Points Earned</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{maxPoints}</div>
            <div className="summary-label">Max Possible ({tier} × {denominator} × 5)</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{percentage}%</div>
            <div className="summary-label">Score</div>
          </div>
          <div className="summary-card">
            <GradeBadge grade={overallGrade} />
            <div className="summary-label">Letter Grade</div>
          </div>
        </div>

        {/* Grade scale legend */}
        <div className="grade-legend">
          <span className="grade-badge grade-A">A = 5 pts</span>
          <span className="grade-badge grade-B">B = 4 pts</span>
          <span className="grade-badge grade-C">C = 3 pts</span>
          <span className="grade-badge grade-D">D = 2 pts</span>
          <span className="grade-badge grade-F">F = 0 pts</span>
        </div>

        {/* Answer table */}
        <div className="grade-table-wrap">
          <table className="grade-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Grade</th>
                <th>Points</th>
                <th>Running Total</th>
              </tr>
            </thead>
            <tbody>
              {answers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No answers yet. <Link to={`/questions/${titleId}`}>Go answer some questions →</Link></td></tr>
              ) : (
                (() => {
                  let running = 0;
                  return answers.map((a, i) => {
                    const pts = GRADE_POINTS[a.grade] ?? 0;
                    running += pts;
                    return (
                      <tr key={a._id || i}>
                        <td>{a.questionId}</td>
                        <td className="question-cell">{a.questionText || `Question ${a.questionId}`}</td>
                        <td><GradeBadge grade={a.grade} /></td>
                        <td>{pts}</td>
                        <td>{running}</td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={2}><strong>TOTAL</strong></td>
                <td><GradeBadge grade={overallGrade} /></td>
                <td><strong>{totalPoints}</strong></td>
                <td><strong>{totalPoints} / {maxPoints}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grade-actions">
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            disabled={calculating || answers.length === 0}
          >
            {calculating ? 'Saving…' : calcDone ? '✓ Grade Saved' : 'Calculate Final Grade'}
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>🖨 Print Report</button>
          <Link to={`/average/${titleId}`} className="btn btn-gold">View Average →</Link>
          <Link to="/titles" className="btn btn-outline">Back to Titles</Link>
        </div>
      </div>
    </div>
  );
}
