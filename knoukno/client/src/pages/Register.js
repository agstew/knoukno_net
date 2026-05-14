import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

const TIER_OPTIONS = [
  { value: 'free', label: 'Free Trial — 5 questions for 3 days', price: 0 },
  { value: 'member', label: 'Member — 50 questions ($39)', price: 39, oldPrice: 49, discount: '20%' },
  { value: 'pro', label: 'Pro — 75 questions ($436)', price: 436, oldPrice: 675, discount: '35%' },
  { value: 'bonus', label: 'Bonus — 100 questions ($100)', price: 100 },
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tier: 'free',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        tier: form.tier,
      });

      const { token, user, checkoutUrl } = res.data;

      if (form.tier !== 'free' && checkoutUrl) {
        // Store token temporarily so user lands on dashboard after Stripe
        login(token, user);
        window.location.href = checkoutUrl;
        return;
      }

      login(token, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedTier = TIER_OPTIONS.find((t) => t.value === form.tier);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">Kno U <span>Kno</span></div>
        <div className="auth-tagline">Register first, then subscribe</div>

        <h2>Register for Kno U Kno</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tier">Select your tier</label>
            <select
              id="tier"
              name="tier"
              className="form-control"
              value={form.tier}
              onChange={handleChange}
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {selectedTier?.price && (
              <p style={{ fontSize: '0.82rem', color: 'var(--gray)', marginTop: '0.35rem' }}>
                You must register. Paid tiers redirect to Stripe when Stripe keys are configured.
                {selectedTier.oldPrice && ` Discount: ${selectedTier.discount} off $${selectedTier.oldPrice}.`}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading
              ? 'Creating account…'
              : selectedTier?.price
              ? `Create Account & Subscribe $${selectedTier.price} →`
              : 'Create Free Trial'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
