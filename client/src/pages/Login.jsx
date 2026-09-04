import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert } from '../components/Loader.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/title', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="kk-section kk-section--alt">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="kk-card kk-card__top p-4 p-md-5">
              <h1 className="h3 mb-1">Login</h1>
              <p className="text-muted mb-4">Welcome back. Pick up where you left off.</p>

              <Alert>{error}</Alert>

              <form onSubmit={submit} noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={change}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="password">Password</label>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={change}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button className="btn btn-primary w-100 py-2 fw-bold" disabled={busy}>
                  {busy ? 'Signing in…' : 'Login'}
                </button>
              </form>

              <div className="d-flex justify-content-between mt-4 small">
                <Link to="/forgot-password">Forgot my password</Link>
                <Link to="/register">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
