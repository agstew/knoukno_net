import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { api } from '../api/client.js';
import Loader, { Alert } from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const isRealClientKey = (key) =>
  Boolean(key) && !/replace|change|your[-_]?key|xxx/i.test(key);

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const stripePromise = isRealClientKey(stripeKey) ? loadStripe(stripeKey) : null;

const hasStripe = Boolean(stripePromise);
const hasPaypal = isRealClientKey(paypalClientId);

function StripeForm({ onDone }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');

    const { error: err } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: 'if_required',
    });

    if (err) setError(err.message);
    else onDone();
    setBusy(false);
  };

  return (
    <form onSubmit={submit}>
      <PaymentElement />
      <Alert>{error}</Alert>
      <button className="btn btn-primary w-100 py-2 fw-bold mt-3" disabled={!stripe || busy}>
        {busy ? 'Processing…' : 'Pay by card'}
      </button>
    </form>
  );
}

function PayPalButton({ tier, bonus, onDone, onError }) {
  const holder = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasPaypal) return;

    const existing = document.querySelector('script[data-kk-paypal]');
    if (existing) return setReady(true);

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
          return data.orderId;
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
  const tier = params.get('tier') === 'pro' ? 'pro' : 'member';
  const bonus = params.get('bonus') === '1';

  const [clientSecret, setClientSecret] = useState('');
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

    if (!hasStripe) return;
    api
      .post('/payments/stripe/intent', { tier, bonus })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setAmount(data.amount);
      })
      .catch((err) => setError(err.message));
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
                {tier === 'pro' ? 'Pro Tier' : 'Member Tier'}
                {bonus ? ' + Bonus 100 questions' : ''}
                {amount ? ` — $${amount}` : ''}
              </p>

              <Alert>{error}</Alert>

              {hasStripe &&
                (clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripeForm onDone={finish} />
                  </Elements>
                ) : (
                  <Loader label="Preparing card payment…" />
                ))}

              {hasStripe && hasPaypal && <div className="text-center text-muted my-4">or</div>}

              {hasPaypal && (
                <PayPalButton tier={tier} bonus={bonus} onDone={finish} onError={setError} />
              )}

              {!hasStripe && !hasPaypal && (
                <Alert kind="warning">
                  No payment provider is set up yet. Add <code>VITE_STRIPE_PUBLISHABLE_KEY</code> or{' '}
                  <code>VITE_PAYPAL_CLIENT_ID</code> to your .env, then restart, to take payments
                  here.
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
