import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import PublicLayout from '../components/PublicLayout';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Login failed.');
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
      [name]: value,
    }));
  }

  return (
    <PublicLayout title="KnoUKno.net | Login">
      <Head>
        <title>Login | Kno U Kno</title>
      </Head>

      <main className="auth-shell">
        <section className="auth-section auth-section--compact">
          <form className="auth-card" onSubmit={handleSubmit}>
            <h1>Login</h1>
            <input
              className="form-control auth-input"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            <div className="password-field">
              <input
                className="form-control auth-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

            <button className="btn auth-button" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </section>
      </main>
    </PublicLayout>
  );
}
