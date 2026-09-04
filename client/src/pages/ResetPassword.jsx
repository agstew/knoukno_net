import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Alert } from '../components/Loader.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('The two passwords do not match');

    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password }, { auth: false });
      navigate('/login', { replace: true });
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
              <h1 className="h3 mb-4">Set a new password</h1>

              <Alert>{error}</Alert>
              {!token && <Alert kind="warning">This link is missing its reset token.</Alert>}

              <form onSubmit={submit} noValidate>
                <label className="form-label" htmlFor="password">New password</label>
                <PasswordInput
                  id="password"
                  className="form-control mb-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <label className="form-label" htmlFor="confirm">Confirm password</label>
                <PasswordInput
                  id="confirm"
                  className="form-control mb-3"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button className="btn btn-primary w-100 py-2 fw-bold" disabled={busy || !token}>
                  {busy ? 'Saving…' : 'Save password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
