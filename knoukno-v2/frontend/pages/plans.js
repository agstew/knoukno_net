import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import MemberShell from '../components/MemberShell';
import { apiRequest } from '../lib/session';
import { useProtectedPage } from '../lib/useProtectedPage';

const tierItems = [
  {
    key: 'member',
    label: 'Member Tier',
    basePlanId: 'member',
    baseAmount: '$39',
    combinedPlanId: 'memberCombined',
    combinedAmount: '$139',
    details: '50 questions base, optional +100 bonus questions',
  },
  {
    key: 'pro',
    label: 'Pro Tier',
    basePlanId: 'pro',
    baseAmount: '$436',
    combinedPlanId: 'proCombined',
    combinedAmount: '$536',
    details: '75 questions base, optional +100 bonus questions',
  },
];

export default function PlansPage() {
  const router = useRouter();
  const { user, loading, setUser } = useProtectedPage();
  const handledReturnOrderIdRef = useRef('');
  const [creating, setCreating] = useState('');
  const [bonusByTier, setBonusByTier] = useState({ member: true, pro: true });
  const [payment, setPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && user) {
      apiRequest('/api/payments')
        .then((payload) => {
          setPayments(payload.payments);
        })
        .catch(() => {
          setPayments([]);
        });
    }
  }, [loading, user]);

  useEffect(() => {
    const orderId = typeof router.query.token === 'string' ? router.query.token : '';

    if (!loading && user && orderId && handledReturnOrderIdRef.current !== orderId) {
      handledReturnOrderIdRef.current = orderId;
      handleConfirm(orderId).finally(() => {
        router.replace('/plans', undefined, { shallow: true });
      });
    }
  }, [loading, user, router.query.token]);

  useEffect(() => {
    const planQuery = typeof router.query.plan === 'string' ? router.query.plan : '';

    if (planQuery === 'member') {
      setBonusByTier((current) => ({ ...current, member: false }));
    }

    if (planQuery === 'pro') {
      setBonusByTier((current) => ({ ...current, pro: false }));
    }

    if (planQuery === 'memberCombined') {
      setBonusByTier((current) => ({ ...current, member: true }));
    }

    if (planQuery === 'proCombined') {
      setBonusByTier((current) => ({ ...current, pro: true }));
    }
  }, [router.query.plan]);

  async function handleCheckout(planId) {
    setCreating(planId);
    setMessage('');

    try {
      const payload = await apiRequest('/api/payments/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });

      setPayment(payload.payment);
      setPayments((current) => [payload.payment, ...current]);
      window.location.assign(payload.payment.approvalUrl);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCreating('');
    }
  }

  async function handleConfirm(orderId) {
    setMessage('');

    try {
      const payload = await apiRequest('/api/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });

      setUser(payload.user);
      setPayment(payload.payment);
      setPayments((current) => current.map((item) => (item.orderId === orderId ? payload.payment : item)));
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <Head>
        <title>Plans | Kno U Kno</title>
      </Head>

      <MemberShell title="Plans" user={user}>
        {loading ? <div className="auth-card">Loading...</div> : null}
        {!loading && user ? (
          <>
            <section className="panel-grid panel-grid--three">
              {tierItems.map((item) => {
                const withBonus = Boolean(bonusByTier[item.key]);
                const targetPlanId = withBonus ? item.combinedPlanId : item.basePlanId;
                const amountLabel = withBonus ? item.combinedAmount : item.baseAmount;

                return (
                <article key={item.key} className="auth-card action-card">
                  <span>{item.label}</span>
                  <strong>{amountLabel}</strong>
                  <small>{item.details}</small>
                  <label htmlFor={`plan-bonus-${item.key}`}>
                    <input
                      id={`plan-bonus-${item.key}`}
                      name={`plan-bonus-${item.key}`}
                      type="checkbox"
                      checked={withBonus}
                      onChange={(event) => setBonusByTier((current) => ({ ...current, [item.key]: event.target.checked }))}
                    />
                    {' '}Add bonus (+$100)
                  </label>
                  <button className="btn auth-button" type="button" onClick={() => handleCheckout(targetPlanId)} disabled={creating === targetPlanId}>
                    {creating === targetPlanId ? 'Creating...' : 'Pay with PayPal'}
                  </button>
                </article>
                );
              })}
            </section>

            {payment ? (
              <section className="auth-card payment-card">
                <span>{payment.planName}</span>
                <span>{payment.orderId}</span>
                <div className="inline-actions">
                  <a className="btn auth-button" href={payment.approvalUrl} target="_blank" rel="noreferrer">
                    Open PayPal
                  </a>
                  <button className="btn auth-button auth-button--secondary" type="button" onClick={() => handleConfirm(payment.orderId)}>
                    Confirm Payment
                  </button>
                </div>
              </section>
            ) : null}

            {message ? <p className="auth-error">{message}</p> : null}

            <section className="auth-card payments-list">
              {payments.map((item) => (
                <article key={item.orderId} className="payment-row">
                  <span>{item.planName}</span>
                  <span>{item.amount} {item.currency}</span>
                  <span>{item.status}</span>
                </article>
              ))}
            </section>
          </>
        ) : null}
      </MemberShell>
    </>
  );
}
