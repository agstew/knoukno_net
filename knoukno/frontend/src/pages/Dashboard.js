import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = (path, token, opts = {}) =>
  fetch(path, { ...opts, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers } });

function StarRating({ value, onChange, readonly }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          className={`star ${(hover || value) >= s ? 'filled' : ''}`}
          onClick={() => !readonly && onChange && onChange(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          role={readonly ? undefined : 'button'}
          title={`${s} star${s !== 1 ? 's' : ''}`}
        >★</span>
      ))}
    </div>
  );
}

function TierBanner({ tier, tierExpiry, isAdmin }) {
  const tierLabel = tier === 'pro' ? 'Pro' : tier === 'members' ? 'Members' : 'Free';
  const expiryDate = tierExpiry ? new Date(tierExpiry) : null;
  const daysLeft = expiryDate ? Math.ceil((expiryDate - Date.now()) / 86400000) : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  if (isAdmin) return null;

  return (
    <div className="tier-banner">
      <div className="tier-info">
        <strong>Plan: {tierLabel}</strong>
        {tier === 'free' && daysLeft !== null && !isExpired && (
          <span style={{ marginLeft: '0.75rem', color: daysLeft <= 1 ? 'var(--color-danger)' : 'inherit' }}>
            · {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining in free trial
          </span>
        )}
        {isExpired && (
          <span style={{ marginLeft: '0.75rem', color: 'var(--color-danger)', fontWeight: 700 }}>
            · Free trial expired
          </span>
        )}
      </div>
      {(tier === 'free') && (
        <Link to="/price" className="btn btn-primary btn-sm">Upgrade Plan</Link>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, tier, tierExpiry, isAdmin } = useAuth();
  const token = localStorage.getItem('token');
  const location = useLocation();

  const [tab, setTab] = useState('questions');
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [question, setQuestion] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQ, setTotalQ] = useState(0);
  const [loadingQ, setLoadingQ] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [stats, setStats] = useState({ averageGrade: 0, averageRating: 0, totalAnswers: 0 });
  const [answerText, setAnswerText] = useState('');
  const [grade, setGrade] = useState('');
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'success') {
      setSuccessMsg('🎉 Payment successful! Your plan has been upgraded.');
    }
    fetchTitles();
    fetchStats();
    fetchAnswers();
  }, []);

  const fetchTitles = async () => {
    try {
      const res = await fetch('/api/questions/titles');
      if (res.ok) setTitles(await res.json());
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const res = await API('/api/answers/average', token);
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  const fetchAnswers = async () => {
    try {
      const res = await API('/api/answers/my', token);
      if (res.ok) setAnswers(await res.json());
    } catch {}
  };

  const fetchQuestion = useCallback(async (p = 1, title = selectedTitle) => {
    setLoadingQ(true);
    setFeedback('');
    try {
      const params = new URLSearchParams({ page: p, limit: 1 });
      if (title) params.set('businessTitle', title);
      const res = await API(`/api/questions?${params}`, token);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const q = data.questions[0];
          setQuestion(q);
          setTotalPages(data.pages);
          setTotalQ(data.total);
          setPage(p);
          // Pre-fill saved answer if exists
          const saved = answers.find(a => a.questionId && a.questionId._id === q._id);
          setAnswerText(saved?.answerText || '');
          setGrade(saved?.grade != null ? String(saved.grade) : '');
          setRating(saved?.rating || 0);
        } else {
          setQuestion(null);
          setTotalPages(data.pages || 1);
          setTotalQ(data.total || 0);
        }
      } else {
        const d = await res.json();
        setFeedback(d.message || 'Could not load question.');
      }
    } catch {
      setFeedback('Network error loading question.');
    } finally {
      setLoadingQ(false);
    }
  }, [token, selectedTitle, answers]);

  useEffect(() => {
    if (tab === 'questions') {
      fetchQuestion(1, selectedTitle);
    }
  }, [tab, selectedTitle]);

  const saveAnswer = async () => {
    if (!question) return;
    setSaving(true);
    try {
      const res = await API('/api/answers/save', token, {
        method: 'POST',
        body: JSON.stringify({ questionId: question._id, answerText })
      });
      if (res.ok) {
        setFeedback('✅ Answer saved!');
        fetchAnswers();
        fetchStats();
      } else {
        const d = await res.json();
        setFeedback(d.message || 'Could not save answer.');
      }
    } catch {
      setFeedback('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const saveGrade = async () => {
    if (!question || grade === '') return;
    const g = parseInt(grade);
    if (isNaN(g) || g < 0 || g > 100) { setFeedback('Grade must be 0–100.'); return; }
    setSaving(true);
    try {
      const res = await API('/api/answers/grade', token, {
        method: 'POST',
        body: JSON.stringify({ questionId: question._id, grade: g })
      });
      if (res.ok) {
        setFeedback('✅ Grade saved!');
        fetchAnswers();
        fetchStats();
      } else {
        const d = await res.json();
        setFeedback(d.message || 'Could not save grade.');
      }
    } catch {
      setFeedback('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const saveRating = async (r) => {
    if (!question) return;
    setRating(r);
    try {
      const res = await API('/api/answers/rate', token, {
        method: 'POST',
        body: JSON.stringify({ questionId: question._id, rating: r })
      });
      if (res.ok) {
        setFeedback('✅ Rating saved!');
        fetchAnswers();
        fetchStats();
      }
    } catch {}
  };

  const deleteAnswer = async (id) => {
    if (!window.confirm('Delete this saved answer?')) return;
    try {
      const res = await API(`/api/answers/${id}`, token, { method: 'DELETE' });
      if (res.ok) {
        fetchAnswers();
        fetchStats();
      }
    } catch {}
  };

  const tierLimits = { free: 5, members: 50, pro: 75 };
  const maxQ = isAdmin ? totalQ : (tierLimits[tier] || 5);

  return (
    <div className="dashboard">
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>
      )}

      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'Business Owner'}</h1>
        <p>Track your business knowledge, grade your answers, and grow your expertise.</p>
      </div>

      <TierBanner tier={tier} tierExpiry={tierExpiry} isAdmin={isAdmin} />

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{stats.totalAnswers}</div>
          <div className="stat-label">Answers Saved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.averageGrade > 0 ? `${stats.averageGrade}%` : '—'}</div>
          <div className="stat-label">Avg. Grade</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}</div>
          <div className="stat-label">Avg. Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{maxQ}</div>
          <div className="stat-label">Questions Available</div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="tab-nav">
        <button className={`tab-btn${tab === 'questions' ? ' active' : ''}`} onClick={() => setTab('questions')}>
          Questions
        </button>
        <button className={`tab-btn${tab === 'saved' ? ' active' : ''}`} onClick={() => setTab('saved')}>
          My Saved Answers ({answers.length})
        </button>
      </div>

      {/* Questions Tab */}
      {tab === 'questions' && (
        <div className="dashboard-grid">
          {/* Sidebar — Business Titles */}
          <aside className="sidebar">
            <h3>Topics</h3>
            <button
              className={`sidebar-item${!selectedTitle ? ' active' : ''}`}
              onClick={() => { setSelectedTitle(''); setPage(1); }}
            >
              All Topics
            </button>
            {titles.map(t => (
              <button
                key={t}
                className={`sidebar-item${selectedTitle === t ? ' active' : ''}`}
                onClick={() => { setSelectedTitle(t); setPage(1); }}
              >
                {t}
              </button>
            ))}
          </aside>

          {/* Main Question Area */}
          <div>
            {feedback && (
              <div className={`alert ${feedback.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1rem' }}>
                {feedback}
              </div>
            )}

            {loadingQ ? (
              <div className="spinner-wrap"><div className="spinner"></div></div>
            ) : question ? (
              <div className="question-card">
                <div className="question-meta">
                  <span className="question-number">Q{page} of {Math.min(totalQ, maxQ)}</span>
                  <span className={`question-category ${question.category}`}>{question.category}</span>
                  <span className={`badge badge-${question.tierAccess}`}>{question.tierAccess}</span>
                </div>

                <div className="question-title">{question.businessTitle}</div>
                <p className="question-text">{question.questionText}</p>

                {question.example && (
                  <div className="question-example">
                    <strong>Example Scenario</strong>
                    {question.example}
                  </div>
                )}

                {/* Answer Section */}
                <div className="answer-section">
                  <label htmlFor="answer-text">Your Answer</label>
                  <textarea
                    id="answer-text"
                    className="form-control"
                    rows={6}
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    placeholder="Write your detailed answer here. Be as specific as possible — the more detail you include, the more accurately you can self-grade."
                  />
                </div>

                <div className="question-actions">
                  <button className="btn btn-primary" onClick={saveAnswer} disabled={saving || !answerText.trim()}>
                    {saving ? 'Saving…' : 'Save Answer'}
                  </button>

                  <div className="grade-input-row">
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Self-Grade (0–100):</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0" max="100"
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      placeholder="0–100"
                    />
                    <button className="btn btn-secondary btn-sm" onClick={saveGrade} disabled={saving || grade === ''}>
                      Save Grade
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-light)' }}>Relevance:</span>
                    <StarRating value={rating} onChange={saveRating} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No questions available</h3>
                <p>
                  {tier === 'free'
                    ? 'Your free trial access may have expired, or no questions match this filter.'
                    : 'No questions found for this filter.'}
                </p>
                {tier === 'free' && <Link to="/price" className="btn btn-primary" style={{ marginTop: '1rem' }}>Upgrade Plan</Link>}
              </div>
            )}

            {/* Pagination */}
            {totalQ > 0 && !loadingQ && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => fetchQuestion(page - 1)}
                  disabled={page <= 1}
                  title="Previous"
                >‹</button>

                {Array.from({ length: Math.min(totalPages, maxQ) }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === Math.min(totalPages, maxQ) || Math.abs(p - page) <= 2)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="pagination-info">…</span>}
                      <button
                        className={`pagination-btn${p === page ? ' active' : ''}`}
                        onClick={() => fetchQuestion(p)}
                      >{p}</button>
                    </React.Fragment>
                  ))}

                <button
                  className="pagination-btn"
                  onClick={() => fetchQuestion(page + 1)}
                  disabled={page >= Math.min(totalPages, maxQ)}
                  title="Next"
                >›</button>

                <span className="pagination-info">
                  {page} / {Math.min(totalPages, maxQ)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Answers Tab */}
      {tab === 'saved' && (
        <div>
          {answers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No saved answers yet</h3>
              <p>Go to the Questions tab, write your answers, and save them here.</p>
            </div>
          ) : (
            <div>
              {answers.map(ans => (
                <div key={ans._id} className="card" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-dark)', marginBottom: '0.3rem' }}>
                        {ans.questionId?.businessTitle || ans.businessTitle || 'Unknown'}
                      </div>
                      {ans.questionId?.questionText && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '0.6rem', lineHeight: 1.5 }}>
                          {ans.questionId.questionText.substring(0, 180)}…
                        </p>
                      )}
                      {ans.answerText && (
                        <div style={{ background: 'var(--color-snow)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '0.6rem' }}>
                          {ans.answerText.substring(0, 300)}{ans.answerText.length > 300 ? '…' : ''}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                        {ans.grade != null && (
                          <span><strong>Grade:</strong> {ans.grade}/100</span>
                        )}
                        {ans.rating != null && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <strong>Relevance:</strong>
                            <StarRating value={ans.rating} readonly />
                          </span>
                        )}
                        <span style={{ color: 'var(--color-muted)' }}>
                          {new Date(ans.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteAnswer(ans._id)}
                      title="Delete answer"
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
