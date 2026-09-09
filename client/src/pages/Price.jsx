import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader, { Alert } from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Price() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(null);
  const [bonus, setBonus] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/payments/pricing', { auth: false })
      .then(setPricing)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="container py-5"><Alert>{error}</Alert></div>;
  if (!pricing) return <Loader label="Loading the price list…" />;

  const buy = (tier) => {
    if (tier.key === 'free') return user ? navigate('/title') : navigate('/register');
    const checkoutUrl = `/checkout?tier=${tier.key}&bonus=${bonus[tier.key] ? '1' : '0'}`;
    if (!user) return navigate('/register', { state: { from: checkoutUrl } });
    navigate(checkoutUrl);
  };

  return (
    <>
      <section className="kk-section kk-section--dark pb-4">
        <div className="container text-center">
          <span className="kk-section__eyebrow">Price</span>
          <h1 className="kk-section__title">Pick the number of questions you need</h1>
          <p className="mx-auto mb-0" style={{ maxWidth: '44rem' }}>
            Every plan writes questions around your own business title and keeps every answer you
            give. Paid plans include Grade, Rated, Average, Save, and Print for a two-year term.
          </p>
        </div>
      </section>

      <section className="kk-section pt-5">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            {pricing.tiers.map((tier) => {
              const withBonus = Boolean(bonus[tier.key]);
              const total = (
                Number(tier.price) + (withBonus ? Number(pricing.bonus.price) : 0)
              ).toFixed(2);

              return (
                <div className="col-md-6 col-lg-4" key={tier.key}>
                  <div className={`kk-price-card p-4 ${tier.key === 'pro' ? 'kk-price-card--featured' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h2 className="h4 mb-0">{tier.name}</h2>
                      {tier.discountPercent > 0 && (
                        <span className="kk-price__save">Save {tier.discountPercent}%</span>
                      )}
                    </div>

                    <p className="text-muted mb-3">
                      {withBonus && tier.bonusQuestions ? tier.bonusQuestions : tier.questions}{' '}
                      questions / {tier.period}
                    </p>

                    <div className="d-flex align-items-baseline gap-2 mb-1">
                      <span className="kk-price__amount">${total}</span>
                      {Number(tier.listPrice) > Number(tier.price) && (
                        <span className="kk-price__was">${tier.listPrice}</span>
                      )}
                    </div>
                    {Number(tier.savings) > 0 && (
                      <p className="small text-primary fw-semibold mb-3">
                        You get ${tier.savings} off
                      </p>
                    )}
                    {tier.key === 'free' && <p className="small text-muted mb-3">3 days, no card</p>}
                    {tier.term && <p className="small text-muted mb-3">{tier.term}</p>}

                    <ul className="list-unstyled d-grid gap-2 mb-3">
                      {tier.features.map((f) => (
                        <li key={f}>
                          <span className="text-primary fw-bold me-2">✓</span>
                          {f}
                        </li>
                      ))}
                      {tier.excluded.map((f) => (
                        <li key={f} className="text-muted">
                          <span className="me-2">✕</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {tier.bonusEligible && (
                      <div className="form-check border-top pt-3 mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`bonus-${tier.key}`}
                          name={`bonus-${tier.key}`}
                          checked={withBonus}
                          onChange={(e) =>
                            setBonus((b) => ({ ...b, [tier.key]: e.target.checked }))
                          }
                        />
                        <label className="form-check-label fw-semibold" htmlFor={`bonus-${tier.key}`}>
                          Bonus: {tier.bonusQuestions} questions for ${pricing.bonus.price}
                        </label>
                      </div>
                    )}

                    <button
                      type="button"
                      className={`btn w-100 py-2 fw-bold mt-auto ${
                        tier.key === 'pro' ? 'btn-gold' : 'btn-primary'
                      }`}
                      onClick={() => buy(tier)}
                    >
                      {tier.key === 'free' ? 'Start free' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-muted mt-4 mb-0">
            {pricing.providers.paypal
              ? 'Pay securely with PayPal at checkout.'
              : 'PayPal setup is in progress — checkout is not open yet.'}
          </p>
        </div>
      </section>
    </>
  );
}
