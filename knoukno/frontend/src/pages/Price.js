import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Price() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState('');
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'cancelled') {
      setMessage('Payment was cancelled. You can try again below.');
    }
    fetchPrices();
  }, [location.search]);

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/payment/prices');
      if (res.ok) {
        const data = await res.json();
        setPrices(data);
      }
    } catch (err) {
      // use defaults if API unavailable
    }
  };

  const handleCheckout = async (tierId) => {
    if (!isAuthenticated) {
      window.location.href = '/register';
      return;
    }
    const token = localStorage.getItem('token');
    setCheckoutLoading(tierId);
    try {
      const res = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tier: tierId })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.message || 'Could not start checkout. Please try again.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setCheckoutLoading('');
    }
  };

  const plans = prices.length > 0 ? prices : [
    { id: 'free', name: 'Free Trial', display: '$0', original: null, discount: null, questions: 5, features: ['5 foundational questions', '3-day access', 'Self-grading tools', 'Answer saving'] },
    { id: 'members', name: 'Members', display: '$39', original: '$49', discount: '20% off', questions: 50, features: ['50 questions across all topics', 'Lifetime access', 'Full progress tracking', 'Grade & rate answers', 'Save all answers'] },
    { id: 'pro', name: 'Pro', display: '$436', original: '$675', discount: '35% off', questions: 75, features: ['All 75 questions', 'Lifetime access', 'Full curriculum coverage', 'Advanced analytics', 'Priority access to new content', 'Bonus question eligibility'] },
  ];

  const enriched = plans.map(p => ({
    ...p,
    features: p.features || [
      `${p.questions} questions`,
      'Lifetime access',
      'Self-grading tools',
      'Answer saving',
      'Progress tracking'
    ]
  }));

  return (
    <div className="pricing-section">
      <h2>Simple, One-Time Pricing</h2>
      <p className="subtitle">Pay once. Access forever. No subscriptions, no renewals.</p>

      {message && (
        <div className="alert alert-warning" style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          {message}
        </div>
      )}

      <div className="pricing-grid">
        {enriched.map((plan, idx) => (
          <div key={plan.id} className={`pricing-card${idx === 1 ? ' featured' : ''}`}>
            {idx === 1 && <div className="pricing-badge">Most Popular</div>}
            <h3>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="pricing-price">{plan.display}</span>
              {plan.original && (
                <>
                  <span className="pricing-original">{plan.original}</span>
                  <span className="pricing-discount">{plan.discount}</span>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '0.4rem' }}>
              {plan.questions} questions • One-time payment
            </p>

            <ul className="pricing-features">
              {plan.features.map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <Link to="/register" className="btn btn-secondary btn-block">
                Start Free Trial
              </Link>
            ) : (
              <button
                className="btn btn-primary btn-block"
                onClick={() => handleCheckout(plan.id)}
                disabled={checkoutLoading === plan.id}
              >
                {checkoutLoading === plan.id ? 'Redirecting…' : `Get ${plan.name}`}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div style={{ overflowX: 'auto', marginTop: '3rem' }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free</th>
              <th>Questions</th>
              <th>Members</th>
              <th>Pro</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Questions</td><td>5</td><td>—</td><td>50</td><td>75</td></tr>
            <tr><td>Access Period</td><td>3 days</td><td>—</td><td>Lifetime</td><td>Lifetime</td></tr>
            <tr><td>Save Answers</td><td>✓</td><td>—</td><td>✓</td><td>✓</td></tr>
            <tr><td>Print</td><td>✓</td><td>—</td><td>✓</td><td>✓</td></tr>
            <tr><td>Grade</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
            <tr><td>Rate</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
            <tr><td>Average</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
            <tr><td>Bonus +100</td><td>—</td><td>100</td><td>$100</td><td>$100</td></tr>
          </tbody>
        </table>
      </div>

      {/* Bonus Section */}
      <div className="card" style={{ marginTop: '3rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
          Need More? Add Bonus Questions
        </h3>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.25rem', fontSize: '0.92rem' }}>
          Purchase 100 additional questions for $100 — available to Members and Pro subscribers.
        </p>
        {isAuthenticated ? (
          <button
            className="btn btn-outline"
            onClick={() => handleCheckout('bonus')}
            disabled={checkoutLoading === 'bonus'}
          >
            {checkoutLoading === 'bonus' ? 'Redirecting…' : 'Add 100 Bonus Questions — $100'}
          </button>
        ) : (
          <Link to="/register" className="btn btn-outline">Sign Up to Purchase Bonuses</Link>
        )}
      </div>

      {/* FAQ */}
      <div style={{ marginTop: '3rem', maxWidth: '680px', margin: '3rem auto 0' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Frequently Asked Questions
        </h3>
        {[
          { q: 'Is this a subscription?', a: 'No. Kno U Kno uses one-time pricing. Pay once and access your questions forever.' },
          { q: 'What happens after the free trial?', a: 'After 3 days, free trial access expires. Your account remains and you can upgrade to continue.' },
          { q: 'Can I get a refund?', a: 'We offer a 7-day money-back guarantee if you are not satisfied. Contact us with your purchase email.' },
          { q: 'How do I access my questions?', a: 'Once registered and logged in, go to your Dashboard. Questions unlock based on your plan immediately after payment.' },
        ].map(faq => (
          <div key={faq.q} style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--color-dark)', marginBottom: '0.35rem' }}>{faq.q}</p>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.92rem', lineHeight: 1.6 }}>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
