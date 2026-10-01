import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';

function getPageRange(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push('...');
    out.push(n);
    prev = n;
  }
  return out;
}

const API = (path, token, opts = {}) =>
  apiFetch(path, {
    ...opts,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers }
  });

// Answers are graded on a 0-100 point scale (A=100, B=85, C=70, D=55, F=0); thresholds are the midpoints between those values.
const pointsToLetter = (points) => {
  if (points >= 92.5) return 'A';
  if (points >= 77.5) return 'B';
  if (points >= 62.5) return 'C';
  if (points >= 27.5) return 'D';
  return 'F';
};

const gradeLabel = (grade) => {
  if (grade == null) return '—';
  const points = Number(grade);
  if (!Number.isFinite(points)) return '—';
  return `${pointsToLetter(points)} (${points})`;
};

const ALL_USERS_ID = '__all__';

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
  const [applications, setApplications] = useState([]);
  const [apPage, setAPPage] = useState(1);
  const [apTotalPages, setAPTotalPages] = useState(1);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  // Question form
  const [qForm, setQForm] = useState({ businessTitle: '', questionText: '', example: '', category: 'money', tierAccess: 'free', questionNumber: '' });
  const [editingQ, setEditingQ] = useState(null);

  // Email-to-client panel
  const [emailPanelUserId, setEmailPanelUserId] = useState(null);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [emailHistory, setEmailHistory] = useState({});
  const [sendingEmail, setSendingEmail] = useState(false);

  // Scheduled emails
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [pendingEmailCount, setPendingEmailCount] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ subject: '', message: '', sendAt: '' });
  const [schedulingEmail, setSchedulingEmail] = useState(false);

  const flash = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3500);
  };

  useEffect(() => {
    if (tab === 'stats') fetchStats();
    if (tab === 'users') { fetchUsers(); fetchScheduledEmails(); }
    if (tab === 'questions') fetchQuestions(qPage);
    if (tab === 'answers') fetchAnswers(aPage);
    if (tab === 'applications') fetchApplications(apPage);
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

  const changePlan = async (userId, tier) => {
    try {
      const res = await API(`/api/admin/users/${userId}/plan`, token, { method: 'PUT', body: JSON.stringify({ tier }) });
      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => (u._id === updated._id ? updated : u)));
      } else {
        const data = await res.json();
        alert(data.message || 'Could not change plan.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
  };

  const changeBonus = async (userId, bonusQuestions) => {
    try {
      const res = await API(`/api/admin/users/${userId}/bonus`, token, { method: 'PUT', body: JSON.stringify({ bonusQuestions }) });
      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => (u._id === updated._id ? updated : u)));
        flash('Bonus questions updated.');
      } else {
        const data = await res.json();
        flash(data.message || 'Could not update bonus questions.', 'danger');
      }
    } catch {
      flash('Network error updating bonus questions.', 'danger');
    }
  };

  const deleteUser = async (userId, email) => {
    if (!window.confirm(`Delete ${email} and all their saved answers and businesses? This cannot be undone.`)) return;
    try {
      const res = await API(`/api/admin/users/${userId}`, token, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        flash('User deleted.');
      } else {
        flash(data.message || 'Could not delete user.', 'danger');
      }
    } catch {
      flash('Network error deleting user.', 'danger');
    }
  };

  const toggleEmailPanel = async (userId) => {
    if (emailPanelUserId === userId) {
      setEmailPanelUserId(null);
      return;
    }
    setEmailPanelUserId(userId);
    setEmailForm({ subject: '', message: '' });
    if (userId !== ALL_USERS_ID && !emailHistory[userId]) {
      try {
        const res = await API(`/api/admin/users/${userId}/messages`, token);
        if (res.ok) {
          const data = await res.json();
          setEmailHistory(prev => ({ ...prev, [userId]: data.messages || [] }));
        }
      } catch {}
    }
  };

  const sendEmailToUser = async (userId) => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      flash('Subject and message are required.', 'danger');
      return;
    }
    setSendingEmail(true);
    try {
      const path = userId === ALL_USERS_ID ? '/api/admin/users/broadcast' : `/api/admin/users/${userId}/messages`;
      const res = await API(path, token, { method: 'POST', body: JSON.stringify(emailForm) });
      const data = await res.json();
      if (res.ok) {
        flash(userId === ALL_USERS_ID ? data.message : 'Email sent.');
        setEmailForm({ subject: '', message: '' });
        if (userId !== ALL_USERS_ID) {
          setEmailHistory(prev => ({ ...prev, [userId]: [data.record, ...(prev[userId] || [])] }));
        }
      } else {
        flash(data.message || 'Could not send email.', 'danger');
        if (data.record) setEmailHistory(prev => ({ ...prev, [userId]: [data.record, ...(prev[userId] || [])] }));
      }
    } catch {
      flash('Network error sending email.', 'danger');
    }
    setSendingEmail(false);
  };

  const fetchScheduledEmails = async () => {
    try {
      const res = await API('/api/admin/scheduled-emails', token);
      if (res.ok) {
        const data = await res.json();
        setScheduledEmails(data.scheduledEmails || []);
        setPendingEmailCount(data.pendingCount || 0);
      }
    } catch {}
  };

  const createScheduledEmail = async () => {
    if (!scheduleForm.subject.trim() || !scheduleForm.message.trim() || !scheduleForm.sendAt) {
      flash('Subject, message, and send time are required.', 'danger');
      return;
    }
    setSchedulingEmail(true);
    try {
      const res = await API('/api/admin/scheduled-emails', token, {
        method: 'POST',
        body: JSON.stringify({ ...scheduleForm, sendAt: new Date(scheduleForm.sendAt).toISOString() })
      });
      const data = await res.json();
      if (res.ok) {
        flash('Email scheduled.');
        setScheduleForm({ subject: '', message: '', sendAt: '' });
        setShowScheduleModal(false);
        setScheduledEmails(prev => [data.scheduledEmail, ...prev]);
      } else {
        flash(data.message || 'Could not schedule email.', 'danger');
      }
    } catch {
      flash('Network error scheduling email.', 'danger');
    }
    setSchedulingEmail(false);
  };

  const cancelScheduledEmail = async (id) => {
    if (!window.confirm('Cancel this scheduled email?')) return;
    try {
      const res = await API(`/api/admin/scheduled-emails/${id}`, token, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setScheduledEmails(prev => prev.map(s => (s._id === id ? data.scheduledEmail : s)));
        flash('Scheduled email cancelled.');
      } else {
        flash(data.message || 'Could not cancel.', 'danger');
      }
    } catch {
      flash('Network error cancelling scheduled email.', 'danger');
    }
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

  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API(`/api/admin/applications?page=${page}&limit=15`, token);
      if (res.ok) {
        const d = await res.json();
        setApplications(d.applications);
        setAPTotalPages(d.pages);
        setAPPage(page);
      }
    } catch {}
    setLoading(false);
  };

  const changeApplicationStatus = async (id, status) => {
    try {
      const res = await API(`/api/admin/applications/${id}/status`, token, { method: 'PUT', body: JSON.stringify({ status }) });
      if (res.ok) {
        const updated = await res.json();
        setApplications(prev => prev.map(a => (a._id === updated._id ? updated : a)));
        setStatusDrafts(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        flash(`Status updated to "${status}".`);
      } else {
        const data = await res.json();
        flash(data.message || 'Could not update status.', 'danger');
      }
    } catch {
      flash('Network error updating status.', 'danger');
    }
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
        {['stats', 'users', 'questions', 'answers', 'applications'].map(t => (
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
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => toggleEmailPanel(ALL_USERS_ID)}>Email All Users</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowScheduleModal(true)}>Schedule Email</button>
          </div>

          {scheduledEmails.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
              <h4 style={{ marginTop: 0, fontSize: '0.9rem' }}>
                Scheduled Emails
                {pendingEmailCount > 0 && <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}> &mdash; {pendingEmailCount} pending total, showing next 10 + recent history</span>}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {scheduledEmails.map((s) => (
                  <li key={s._id} style={{ borderTop: '1px solid var(--color-border)', padding: '0.5rem 0', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div>
                      <strong>{s.subject}</strong>{' '}
                      <span className={`badge badge-${s.status === 'sent' ? 'active' : s.status === 'pending' ? 'members' : 'danger'}`}>{s.status}</span>
                      <div style={{ color: 'var(--color-muted)' }}>
                        {s.status === 'pending' ? `Sends at ${new Date(s.sendAt).toLocaleString()}` : `Processed ${new Date(s.processedAt).toLocaleString()} \u2014 ${s.sentCount}/${s.totalRecipients} sent`}
                      </div>
                    </div>
                    {s.status === 'pending' && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => cancelScheduledEmail(s._id)}>Cancel</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                    <th>Bonus</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Avg Grade</th>
                    <th>Email Client</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                      <td>
                        <select
                          className="form-control form-select"
                          style={{ minWidth: '7.5rem', padding: '0.3rem 0.5rem' }}
                          value={u.tier}
                          onChange={(e) => changePlan(u._id, e.target.value)}
                          aria-label={`Plan for ${u.email}`}
                        >
                          <option value="free">free</option>
                          <option value="members">members</option>
                          <option value="pro">pro</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          style={{ width: '5.5rem', padding: '0.3rem 0.5rem' }}
                          defaultValue={u.bonusQuestions || 0}
                          aria-label={`Bonus questions for ${u.email}`}
                          onBlur={(e) => {
                            const value = Number(e.target.value);
                            if (value !== (u.bonusQuestions || 0)) changeBonus(u._id, value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.target.blur();
                          }}
                        />
                      </td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>{u.averageGrade > 0 ? `${pointsToLetter(u.averageGrade)} (${u.averageGrade.toFixed(2)})` : '—'}</td>
                      <td>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleEmailPanel(u._id)}>Email</button>
                      </td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" disabled={u._id === user?.id || u._id === user?._id || u.role === 'admin'} onClick={() => deleteUser(u._id, u.email)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Email Modal */}
      {emailPanelUserId && (() => {
        const isBroadcast = emailPanelUserId === ALL_USERS_ID;
        const emailUser = isBroadcast ? null : users.find(u => u._id === emailPanelUserId);
        return (
          <div className="modal-overlay" onClick={() => setEmailPanelUserId(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{isBroadcast ? 'Email All Users' : `Email ${emailUser?.email}`}</h3>
                <button type="button" className="modal-close" aria-label="Close" onClick={() => setEmailPanelUserId(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    className="form-control"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Subject"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={emailForm.message}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={isBroadcast ? `Write a message to all ${users.length} users\u2026` : `Write a message to ${emailUser?.email}\u2026`}
                  />
                </div>
                <button type="button" className="btn btn-primary btn-sm" disabled={sendingEmail} onClick={() => sendEmailToUser(emailPanelUserId)}>
                  {sendingEmail ? 'Sending\u2026' : isBroadcast ? `Send to All ${users.length} Users` : 'Send Email'}
                </button>

                {!isBroadcast && (
                  <>
                    <h4 style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Sent history</h4>
                    {!emailHistory[emailPanelUserId] || emailHistory[emailPanelUserId].length === 0 ? (
                      <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>No emails sent yet.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {emailHistory[emailPanelUserId].map((m) => (
                          <li key={m._id} style={{ borderTop: '1px solid var(--color-border)', padding: '0.5rem 0', fontSize: '0.85rem' }}>
                            <strong>{m.subject}</strong>{' '}
                            <span className={`badge badge-${m.status === 'sent' ? 'active' : 'danger'}`}>{m.status}</span>
                            <div style={{ color: 'var(--color-muted)' }}>{new Date(m.sentAt).toLocaleString()}</div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                            {m.error && <div style={{ color: 'var(--color-danger, #c0392b)' }}>{m.error}</div>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Schedule Email Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Email to All Users</h3>
              <button type="button" className="modal-close" aria-label="Close" onClick={() => setShowScheduleModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  className="form-control"
                  value={scheduleForm.subject}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subject"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={scheduleForm.message}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write the message to send to all users&hellip;"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Send at</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={scheduleForm.sendAt}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, sendAt: e.target.value }))}
                />
              </div>
              <button type="button" className="btn btn-primary btn-sm" disabled={schedulingEmail} onClick={createScheduledEmail}>
                {schedulingEmail ? 'Scheduling\u2026' : 'Schedule Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Viewer Modal */}
      {viewingApplication && (
        <div className="modal-overlay" onClick={() => setViewingApplication(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application from {viewingApplication.name}</h3>
              <button type="button" className="modal-close" aria-label="Close" onClick={() => setViewingApplication(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Email:</strong> {viewingApplication.email}</p>
              <p><strong>Phone:</strong> {viewingApplication.phone || '—'}</p>
              <p><strong>Position:</strong> {viewingApplication.position}</p>
              <p><strong>Status:</strong> {viewingApplication.status}</p>
              <p><strong>Submitted:</strong> {new Date(viewingApplication.submittedAt).toLocaleString()}</p>
              <p><strong>Message:</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{viewingApplication.message || <em>No message</em>}</p>
            </div>
          </div>
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
                      <th>Question</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No questions found.</td></tr>
                    ) : questions.map(q => (
                      <tr key={q._id}>
                        <td style={{ color: 'var(--color-muted)', fontSize: '0.82rem', width: '50px' }}>{q.questionNumber || '—'}</td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                          {q.questionText}
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
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchQuestions(1)} disabled={qPage <= 1} aria-label="First page">|‹</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchQuestions(qPage - 1)} disabled={qPage <= 1}>‹ Prev</button>
                  {getPageRange(qPage, qTotalPages).map((value, idx) => (
                    value === '...'
                      ? <span key={`qe${idx}`} className="pagination-info">…</span>
                      : <button key={value} type="button" className={`pagination-btn${value === qPage ? ' active' : ''}`} onClick={() => fetchQuestions(value)}>{value}</button>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchQuestions(qPage + 1)} disabled={qPage >= qTotalPages}>Next ›</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchQuestions(qTotalPages)} disabled={qPage >= qTotalPages} aria-label="Last page">›|</button>
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
                        <td>{gradeLabel(a.grade)}</td>
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
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchAnswers(1)} disabled={aPage <= 1} aria-label="First page">|‹</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchAnswers(aPage - 1)} disabled={aPage <= 1}>‹ Prev</button>
                  {getPageRange(aPage, aTotalPages).map((value, idx) => (
                    value === '...'
                      ? <span key={`ae${idx}`} className="pagination-info">…</span>
                      : <button key={value} type="button" className={`pagination-btn${value === aPage ? ' active' : ''}`} onClick={() => fetchAnswers(value)}>{value}</button>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchAnswers(aPage + 1)} disabled={aPage >= aTotalPages}>Next ›</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchAnswers(aTotalPages)} disabled={aPage >= aTotalPages} aria-label="Last page">›|</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {tab === 'applications' && (
        <div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner"></div></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Position</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No applications found.</td></tr>
                    ) : applications.map(a => (
                      <tr key={a._id}>
                        <td>{a.name}</td>
                        <td style={{ fontSize: '0.85rem' }}>{a.email}</td>
                        <td style={{ fontSize: '0.85rem' }}>{a.phone || '—'}</td>
                        <td>{a.position}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', maxWidth: '220px' }}>
                          {a.message ? a.message.substring(0, 80) + '…' : <em>No message</em>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <select
                              className="form-control form-select"
                              style={{ minWidth: '7.5rem', padding: '0.3rem 0.5rem' }}
                              value={statusDrafts[a._id] ?? a.status}
                              onChange={(e) => setStatusDrafts(prev => ({ ...prev, [a._id]: e.target.value }))}
                              aria-label={`Status for ${a.email}`}
                            >
                              <option value="new">new</option>
                              <option value="reviewed">reviewed</option>
                              <option value="contacted">contacted</option>
                              <option value="rejected">rejected</option>
                              <option value="hired">hired</option>
                            </select>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={(statusDrafts[a._id] ?? a.status) === a.status}
                              onClick={() => changeApplicationStatus(a._id, statusDrafts[a._id] ?? a.status)}
                            >
                              Save
                            </button>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(a.submittedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewingApplication(a)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {apTotalPages > 1 && (
                <div className="pagination">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchApplications(1)} disabled={apPage <= 1} aria-label="First page">|‹</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchApplications(apPage - 1)} disabled={apPage <= 1}>‹ Prev</button>
                  {getPageRange(apPage, apTotalPages).map((value, idx) => (
                    value === '...'
                      ? <span key={`pe${idx}`} className="pagination-info">…</span>
                      : <button key={value} type="button" className={`pagination-btn${value === apPage ? ' active' : ''}`} onClick={() => fetchApplications(value)}>{value}</button>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchApplications(apPage + 1)} disabled={apPage >= apTotalPages}>Next ›</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchApplications(apTotalPages)} disabled={apPage >= apTotalPages} aria-label="Last page">›|</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
