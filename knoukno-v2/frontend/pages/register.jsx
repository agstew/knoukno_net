import { useRouter } from 'next/router';
import { useState } from 'react';

import PublicLayout from '../components/PublicLayout';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setSubmitting(false);
      setErrorMessage('Password and confirm password must match.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Registration failed.');
      }

      localStorage.setItem('knoukno_token', payload.token);
      const nextPath = typeof router.query.next === 'string' ? router.query.next : '/dashboard';
      router.push(nextPath);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  return (
    <PublicLayout title="KnoUKno.net | Register">
      <main className="auth-shell">
        <section className="auth-section auth-section--compact">
          <form className="auth-card" onSubmit={handleSubmit}>
            <h1>Register</h1>
            <input className="form-control auth-input" name="name" placeholder="Name" value={formData.name} onChange={handleChange} autoComplete="name" required />
            <input className="form-control auth-input" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} autoComplete="email" required />
            <div className="password-field">
              <input
                className="form-control auth-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="password-field">
              <input
                className="form-control auth-input"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button className="password-toggle" type="button" onClick={() => setShowConfirmPassword((value) => !value)}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
            <button className="btn auth-button" type="submit" disabled={submitting}>{submitting ? 'Registering...' : 'Register'}</button>
          </form>
        </section>
      </main>
    </PublicLayout>
  );
}
