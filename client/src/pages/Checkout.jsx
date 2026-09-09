import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Alert } from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const isRealClientKey = (key) =>
  Boolean(key) && !/replace|change|your[-_]?key|xxx/i.test(key);

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const hasPaypal = isRealClientKey(paypalClientId);
const PAID_TIERS = ['member', 'member_bonus', 'pro', 'pro_bonus'];
const TIER_NAMES = {
  member: 'Member Tier',
  member_bonus: 'Member-Bonus Tier',
  pro: 'Pro Tier',
  pro_bonus: 'Pro-Bonus Tier',
};

function PayPalButton({ tier, bonus, onDone, onError }) {
  const holder = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasPaypal) return;

    // Checking window.paypal (not just the <script> tag) avoids a StrictMode race:
    // the tag can exist from a prior mount before the SDK has actually finished loading.
    if (window.paypal) return setReady(true);

    const existing = document.querySelector('script[data-kk-paypal]');
    if (existing) {
      existing.addEventListener('load', () => setReady(true));
      existing.addEventListener('error', () => onError('PayPal could not be loaded.'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=USD`;
    script.dataset.kkPaypal = 'true';
    script.onload = () => setReady(true);
    script.onerror = () => onError('PayPal could not be loaded.');
    document.body.appendChild(script);
  }, [onError]);

  useEffect(() => {
    if (!ready || !window.paypal || !holder.current) return;
    holder.current.innerHTML = '';

    window.paypal
      .Buttons({
        style: { color: 'gold', shape: 'rect', label: 'paypal', height: 45 },
        createOrder: async () => {
          const data = await api.post('/payments/paypal/order', { tier, bonus });
          return data.id;
        },
        onApprove: async (data) => {
          await api.post('/payments/paypal/capture', { orderId: data.orderID });
          onDone();
        },
        onError: () => onError('PayPal could not complete the payment.'),
      })
      .render(holder.current);
  }, [ready, tier, bonus, onDone, onError]);

  if (!hasPaypal) return null;
  return <div ref={holder} />;
}

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const requestedTier = params.get('tier');
  const tier = PAID_TIERS.includes(requestedTier) ? requestedTier : 'member';
  const bonus = false;

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The price is shown even when no payment provider is wired up yet.
    api
      .get('/payments/pricing', { auth: false })
      .then((data) => {
        const plan = data.tiers.find((t) => t.key === tier);
        if (!plan) return;
        setAmount((Number(plan.price) + (bonus ? Number(data.bonus.price) : 0)).toFixed(2));
      })
      .catch(() => {});

  }, [tier, bonus]);

  const finish = useCallback(async () => {
    await refresh();
    setDone(true);
    setTimeout(() => navigate('/title'), 1800);
  }, [navigate, refresh]);

  if (done) {
    return (
      <section className="kk-section text-center">
        <div className="container">
          <h1 className="kk-section__title">Payment received</h1>
          <p className="lead">Your questions are unlocked. Taking you to your business title…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="kk-section kk-section--alt">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="kk-card kk-card__top p-4 p-md-5">
              <h1 className="h3 mb-1">Checkout</h1>
              <p className="text-muted mb-4">
                {TIER_NAMES[tier]}
                {amount ? ` — $${amount}` : ''}
              </p>

              <Alert>{error}</Alert>

              {hasPaypal && (
                <PayPalButton tier={tier} bonus={bonus} onDone={finish} onError={setError} />
              )}

              {!hasPaypal && (
                <Alert kind="warning">
                  PayPal is not set up yet. Add <code>VITE_PAYPAL_CLIENT_ID</code> to your .env,
                  then restart, to take payments here.
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
