import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Loader, { Alert } from '../components/Loader.jsx';
import Pagination from '../components/Pagination.jsx';

const TIERS = ['free', 'member', 'pro'];

function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!stats) return <Loader label="Loading stats…" />;

  const cards = [
    ['Users', stats.users],
    ['Paid users', stats.paid_users],
    ['Business titles', stats.titles],
    ['Questions', stats.questions],
    ['Answers', stats.answers],
    ['Grades', stats.grades],
    ['Ratings', stats.ratings],
    ['Prints', stats.prints],
    ['Emails sent', stats.emails],
    ['Revenue', `$${stats.revenue}`],
  ];

  return (
    <div className="row g-3">
      {cards.map(([label, value]) => (
        <div className="col-6 col-md-3" key={label}>
          <div className="kk-card p-3 text-center">
            <div className="h4 mb-1">{value}</div>
            <div className="small text-muted">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersPanel() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = (nextPage = page, search = q) => {
    api
      .get(`/admin/users?page=${nextPage}&q=${encodeURIComponent(search)}`)
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const changeTier = async (id, tier, bonus) => {
    setBusyId(id);
    try {
      await api.put(`/admin/users/${id}/tier`, { tier, bonus });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Loader label="Loading users…" />;

  const pages = Math.max(1, Math.ceil(data.pagination.total / data.pagination.limit));

  return (
    <div>
      <form
        className="d-flex gap-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load(1, q);
        }}
      >
        <input
          className="form-control"
          placeholder="Search by email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Tier</th>
              <th>Bonus</th>
              <th>Quota</th>
              <th>Expires</th>
              <th>Change tier</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{[u.first_name, u.last_name].filter(Boolean).join(' ')}</td>
                <td className="text-capitalize">{u.tier}</td>
                <td>{u.bonus ? 'Yes' : 'No'}</td>
                <td>{u.question_quota}</td>
                <td>{u.tier_expires_at ? new Date(u.tier_expires_at).toLocaleDateString() : '—'}</td>
                <td className="d-flex gap-1">
                  {TIERS.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      className={`btn btn-sm ${u.tier === tier ? 'btn-gold' : 'btn-outline-secondary'}`}
                      disabled={busyId === u.id}
                      onClick={() => changeTier(u.id, tier, Boolean(u.bonus))}
                    >
                      {tier}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={data.pagination.page}
        pages={pages}
        onChange={(next) => {
          setPage(next);
          load(next, q);
        }}
      />
    </div>
  );
}

function PaymentsPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/payments').then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Loader label="Loading payments…" />;
  if (!data.payments.length) return <p className="text-muted">No payments yet.</p>;

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Email</th>
            <th>Amount</th>
            <th>Provider</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.payments.map((p) => (
            <tr key={p.id}>
              <td>{p.email}</td>
              <td>${p.amount}</td>
              <td className="text-capitalize">{p.provider}</td>
              <td className="text-capitalize">{p.status}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmailsPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/emails').then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Loader label="Loading emails…" />;
  if (!data.emails.length) return <p className="text-muted">No emails logged yet.</p>;

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>To</th>
            <th>Template</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.emails.map((e) => (
            <tr key={e.id}>
              <td>{e.to_email}</td>
              <td>{e.template}</td>
              <td>{e.subject}</td>
              <td className={e.status === 'failed' ? 'text-danger' : 'text-capitalize'}>
                {e.status === 'failed' ? e.error || 'Failed' : e.status}
              </td>
              <td>{new Date(e.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  ['stats', 'Stats', StatsPanel],
  ['users', 'Users', UsersPanel],
  ['payments', 'Payments', PaymentsPanel],
  ['emails', 'Emails', EmailsPanel],
];

export default function Admin() {
  const [tab, setTab] = useState('stats');
  const Panel = TABS.find(([key]) => key === tab)[2];

  return (
    <section className="kk-section">
      <div className="container">
        <h1 className="h3 mb-4">Admin</h1>

        <ul className="nav nav-tabs mb-4">
          {TABS.map(([key, label]) => (
            <li className="nav-item" key={key}>
              <button
                type="button"
                className={`nav-link ${tab === key ? 'active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <Panel />
      </div>
    </section>
  );
}
