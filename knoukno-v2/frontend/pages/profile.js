import Head from 'next/head';
import { useEffect, useState } from 'react';

import MemberShell from '../components/MemberShell';
import { apiRequest } from '../lib/session';
import { useProtectedPage } from '../lib/useProtectedPage';

export default function ProfilePage() {
  const { user, loading } = useProtectedPage();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!loading && user) {
      apiRequest('/api/payments')
        .then((payload) => {
          setPayments(payload.payments.slice(0, 3));
        })
        .catch(() => {
          setPayments([]);
        });
    }
  }, [loading, user]);

  return (
    <>
      <Head>
        <title>Profile | Kno U Kno</title>
      </Head>

      <MemberShell title="Profile" user={user}>
        {loading ? <div className="auth-card">Loading...</div> : null}
        {!loading && user ? (
          <section className="panel-grid">
            <article className="auth-card stacked-list">
              <section className="section-row"><span>{user.name}</span></section>
              <section className="section-row"><span>{user.email}</span></section>
              <section className="section-row"><span>{user.plan}</span></section>
            </article>
            <article className="auth-card stacked-list">
              {payments.length ? payments.map((item) => (
                <section key={item.orderId} className="section-row">
                  <span>{item.planName}</span>
                  <span>{item.status}</span>
                </section>
              )) : <section className="section-row"><span>No payments yet</span></section>}
            </article>
          </section>
        ) : null}
      </MemberShell>
    </>
  );
}
