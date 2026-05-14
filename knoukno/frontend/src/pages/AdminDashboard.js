import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = (path, token, opts = {}) =>
  fetch(path, {
    ...opts,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers }
  });

export default function AdminDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qPage, setQPage] = useState(1);
  const [qTotalPages, setQTotalPages] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [aPage, setAPage] = useState(1);
  const [aTotalPages, setATotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  // Question form
  const [qForm, setQForm] = useState({ businessTitle: '', questionText: '', example: '', category: 'money', tierAccess: 'free', questionNumber: '' });
  const [editingQ, setEditingQ] = useState(null);

  const flash = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3500);
  };

  useEffect(() => {
    if (tab === 'stats') fetchStats();
    if (tab === 'users') fetchUsers();
    if (tab === 'questions') fetchQuestions(qPage);
    if (tab === 'answers') fetchAnswers(aPage);
  }, [tab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API('/api/admin/stats', token);
      if (res.ok) setStats(await res.json());
    } catch {}
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API('/api/admin/users', token);
      if (res.ok) setUsers(await res.json());
    } catch {}
    setLoading(false);
  };

  const fetchQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API(`/api/admin/questions?page=${page}&limit=15`, token);
      if (res.ok) {
        const d = await res.json();
        setQuestions(d.questions);
        setQTotalPages(d.pages);
        setQPage(page);
      }
    } catch {}
    setLoading(false);
  };

  const fetchAnswers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API(`/api/admin/answers?page=${page}&limit=15`, token);
      if (res.ok) {
        const d = await res.json();
        setAnswers(d.answers);
        setATotalPages(d.pages);
        setAPage(page);
      }
    } catch {}
    setLoading(false);
  };

  const handleQFormChange = (e) => {
    setQForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...qForm, questionNumber: qForm.questionNumber ? parseInt(qForm.questionNumber) : undefined };
    if (editingQ) {
      const res = await API(`/api/admin/questions/${editingQ._id}`, token, { method: 'PUT', body: JSON.stringify(payload) });
      if (res.ok) {
        flash('Question updated!');
        setEditingQ(null);
        setQForm({ businessTitle: '', questionText: '', example: '', category: 'money', tierAccess: 'free', questionNumber: '' });
        fetchQuestions(qPage);
      } else {
        const d = await res.json();
        flash(d.message || 'Update failed.', 'danger');
      }
    } else {
      const res = await API('/api/admin/questions', token, { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        flash('Question created!');
        setQForm({ businessTitle: '', questionText: '', example: '', category: 'money', tierAccess: 'free', questionNumber: '' });
        fetchQuestions(1);
      } else {
        const d = await res.json();
        flash(d.message || 'Create failed.', 'danger');
      }
    }
  };

  const startEdit = (q) => {
    setEditingQ(q);
    setQForm({
      businessTitle: q.businessTitle || '',
      questionText: q.questionText || '',
      example: q.example || '',
      category: q.category || 'money',
      tierAccess: q.tierAccess || 'free',
      questionNumber: q.questionNumber != null ? String(q.questionNumber) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Permanently delete this question?')) return;
    const res = await API(`/api/admin/questions/${id}`, token, { method: 'DELETE' });
    if (res.ok) { flash('Question deleted!'); fetchQuestions(qPage); }
    else flash('Delete failed.', 'danger');
  };

  const cancelEdit = () => {
    setEditingQ(null);
    setQForm({ businessTitle: '', questionText: '', example: '', category: 'money', tierAccess: 'free', questionNumber: '' });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, questions, and platform settings.</p>
      </div>

      {msg && (
        <div className={`alert alert-${msgType}`} style={{ marginBottom: '1rem' }}>{msg}</div>
      )}

      {/* Tab Nav */}
      <div className="tab-nav">
        {['stats', 'users', 'questions', 'answers'].map(t => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {tab === 'stats' && (
        <div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner"></div></div>
          ) : stats ? (
            <>
              <div className="stats-row" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalQuestions}</div>
                  <div className="stat-label">Active Questions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalAnswers}</div>
                  <div className="stat-label">Total Answers</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3 className="card-title">Users by Plan</h3></div>
                <div className="stats-row">
                  {[
                    { key: 'free', label: 'Free' },
                    { key: 'members', label: 'Members' },
                    { key: 'pro', label: 'Pro' }
                  ].map(p => (
                    <div key={p.key} className="stat-card">
                      <div className="stat-value">{stats.byTier?.[p.key] || 0}</div>
                      <div className="stat-label">{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--color-text-light)' }}>Could not load stats.</p>
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner"></div></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Avg Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                      <td><span className={`badge badge-${u.tier}`}>{u.tier}</span></td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>{u.averageGrade > 0 ? `${u.averageGrade.toFixed(1)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Questions Tab */}
      {tab === 'questions' && (
        <div>
          {/* Question Form */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title">{editingQ ? 'Edit Question' : 'Add New Question'}</h3>
            </div>
            <form onSubmit={handleQSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Business Title</label>
                  <input name="businessTitle" className="form-control" value={qForm.businessTitle} onChange={handleQFormChange} placeholder="e.g. Business Finances" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Question #</label>
                  <input name="questionNumber" type="number" className="form-control" value={qForm.questionNumber} onChange={handleQFormChange} placeholder="e.g. 26" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea name="questionText" className="form-control" rows={5} value={qForm.questionText} onChange={handleQFormChange} placeholder="Full question text…" required />
              </div>
              <div className="form-group">
                <label className="form-label">Example Scenario</label>
                <textarea name="example" className="form-control" rows={2} value={qForm.example} onChange={handleQFormChange} placeholder="Optional example scenario…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-control form-select" value={qForm.category} onChange={handleQFormChange}>
                    <option value="money">Money</option>
                    <option value="start">Start</option>
                    <option value="manage">Manage</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tier Access</label>
                  <select name="tierAccess" className="form-control form-select" value={qForm.tierAccess} onChange={handleQFormChange}>
                    <option value="free">Free</option>
                    <option value="members">Members</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingQ ? 'Update Question' : 'Create Question'}
                </button>
                {editingQ && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* Questions Table */}
          {loading ? (
            <div className="spinner-wrap"><div className="spinner"></div></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Tier</th>
                      <th>Question (preview)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No questions found.</td></tr>
                    ) : questions.map(q => (
                      <tr key={q._id}>
                        <td style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>{q.questionNumber || '—'}</td>
                        <td style={{ fontWeight: 600, fontSize: '0.88rem', maxWidth: '160px' }}>{q.businessTitle}</td>
                        <td><span className={`question-category ${q.category}`}>{q.category}</span></td>
                        <td><span className={`badge badge-${q.tierAccess}`}>{q.tierAccess}</span></td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', maxWidth: '300px' }}>
                          {q.questionText.substring(0, 100)}…
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(q)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteQuestion(q._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Question Pagination */}
              {qTotalPages > 1 && (
                <div className="pagination">
                  <button className="pagination-btn" onClick={() => fetchQuestions(qPage - 1)} disabled={qPage <= 1}>‹</button>
                  {Array.from({ length: qTotalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`pagination-btn${p === qPage ? ' active' : ''}`} onClick={() => fetchQuestions(p)}>{p}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => fetchQuestions(qPage + 1)} disabled={qPage >= qTotalPages}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Answers Tab */}
      {tab === 'answers' && (
        <div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner"></div></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Question</th>
                      <th>Answer (preview)</th>
                      <th>Grade</th>
                      <th>Rating</th>
                      <th>Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {answers.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No answers found.</td></tr>
                    ) : answers.map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{a.userId?.name || '—'}</td>
                        <td>{a.userId?.tier ? <span className={`badge badge-${a.userId.tier}`}>{a.userId.tier}</span> : '—'}</td>
                        <td style={{ fontSize: '0.82rem', maxWidth: '160px', color: 'var(--color-text-light)' }}>
                          {a.questionId?.businessTitle || a.businessTitle || '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', maxWidth: '220px' }}>
                          {a.answerText ? a.answerText.substring(0, 80) + '…' : <em>No text</em>}
                        </td>
                        <td>{a.grade != null ? `${a.grade}/100` : '—'}</td>
                        <td>{a.rating != null ? `${a.rating}★` : '—'}</td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(a.savedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Answers Pagination */}
              {aTotalPages > 1 && (
                <div className="pagination">
                  <button className="pagination-btn" onClick={() => fetchAnswers(aPage - 1)} disabled={aPage <= 1}>‹</button>
                  {Array.from({ length: aTotalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`pagination-btn${p === aPage ? ' active' : ''}`} onClick={() => fetchAnswers(p)}>{p}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => fetchAnswers(aPage + 1)} disabled={aPage >= aTotalPages}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
