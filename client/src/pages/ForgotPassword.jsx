import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Alert } from '../components/Loader.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const data = await api.post('/auth/forgot-password', { email }, { auth: false });
      setMessage(data.message);
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
              <h1 className="h3 mb-1">Forgot my password</h1>
              <p className="text-muted mb-4">
                Enter your email and we will send a reset link. It works on its own — nobody has to
                send it for you.
              </p>

              <Alert>{error}</Alert>
              <Alert kind="success">{message}</Alert>

              <form onSubmit={submit} noValidate>
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control mb-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <button className="btn btn-primary w-100 py-2 fw-bold" disabled={busy}>
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="small mt-4 mb-0">
                <Link to="/login">Back to login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
