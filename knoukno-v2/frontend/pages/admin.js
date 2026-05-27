import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import MemberShell from '../components/MemberShell';
import { apiRequest } from '../lib/session';
import { useProtectedPage } from '../lib/useProtectedPage';

export default function AdminPage() {
  const router = useRouter();
  const { collection: selectedCollection = 'payment' } = router.query;
  const { user, loading, forbidden } = useProtectedPage({ requiredRole: 'admin', redirectOnForbidden: false });
  const [collections, setCollections] = useState([]);
  const [records, setRecords] = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!loading && user) {
      apiRequest('/api/admin/collections')
        .then((payload) => {
          setCollections(payload.collections);
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user && selectedCollection) {
      apiRequest(`/api/admin/collection/${selectedCollection}`)
        .then((payload) => {
          setRecords(payload.items);
          setRecordCount(payload.count);
          setErrorMessage('');
        })
        .catch((error) => {
          setRecords([]);
          setRecordCount(0);
          setErrorMessage(error.message);
        });
    }
  }, [loading, selectedCollection, user]);

  async function handleAdminAction(path, successLabel) {
    try {
      setErrorMessage('');
      const payload = await apiRequest(path, { method: 'POST' });
      setActionMessage(`${successLabel}: ${payload.count || payload.scheduledCount || 0}`);

      const collectionsPayload = await apiRequest('/api/admin/collections');
      setCollections(collectionsPayload.collections);

      if (selectedCollection) {
        const detailPayload = await apiRequest(`/api/admin/collection/${selectedCollection}`);
        setRecords(detailPayload.items);
        setRecordCount(detailPayload.count);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <>
      <Head>
        <title>Admin | Kno U Kno</title>
      </Head>

      <MemberShell title="Admin Dashboard" user={user}>
        {loading ? <div className="auth-card">Loading...</div> : null}
        {!loading && forbidden ? (
          <section className="auth-card">
            <h2>Admin access required</h2>
            <p>This account is not an admin. Use the button below to go to Dashboard.</p>
            <div className="inline-actions">
              <Link href="/dashboard" className="btn auth-button">Go to Dashboard</Link>
            </div>
          </section>
        ) : null}
        {!loading && user ? (
          <section className="admin-grid">
            <article className="auth-card stacked-list">
              <button className="btn auth-button" type="button" onClick={() => handleAdminAction('/api/admin/questions/seed', 'Questions seeded')}>
                Seed 300 Questions
              </button>
              <button className="btn auth-button auth-button--secondary" type="button" onClick={() => handleAdminAction('/api/admin/email-schedules/backfill', 'Emails scheduled')}>
                Schedule AI Emails
              </button>
              {actionMessage ? <p className="auth-note">{actionMessage}</p> : null}

              {collections.map((item) => (
                <Link
                  key={item.name}
                  href={`/admin?collection=${item.name}`}
                  className={`collection-link${selectedCollection === item.name ? ' collection-link--active' : ''}`}
                >
                  <span>{item.name}</span>
                  <span>{item.count}</span>
                </Link>
              ))}
            </article>

            <article className="auth-card admin-records">
              <section className="section-row">
                <span>{selectedCollection}</span>
                <span>{recordCount}</span>
              </section>

              {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

              {!records.length && !errorMessage ? <section className="section-row"><span>No records yet</span></section> : null}

              {records.map((item) => (
                <section key={item._id} className="record-card">
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                </section>
              ))}
            </article>
          </section>
        ) : null}
      </MemberShell>
    </>
  );
}
