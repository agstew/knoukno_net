import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert } from '../components/Loader.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
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
        <div className="row justify-content-center align-items-center g-5">
          <div className="col-lg-5">
            <span className="kk-section__eyebrow">Everyone has to register</span>
            <h1 className="kk-section__title">Three days free. Five questions. No card.</h1>
            <p className="lead">
              Register, name your business, and the AI writes your first five questions around it —
              starting with the law that gets you open.
            </p>
            <img
              className="kk-section__img mt-3"
              src="/img/section-start.svg"
              alt="A founder planning a new business"
              decoding="async"
              width="1200"
              height="760"
            />
          </div>

          <div className="col-md-8 col-lg-5">
            <div className="kk-card kk-card__top kk-card__top--gold p-4 p-md-5">
              <h2 className="h4 mb-4">Register</h2>

              <Alert>{error}</Alert>

              <form onSubmit={submit} noValidate>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="firstName">First name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      className="form-control"
                      value={form.firstName}
                      onChange={change}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="lastName">Last name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      className="form-control"
                      value={form.lastName}
                      onChange={change}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="mt-3">
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

                <div className="mt-3">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={change}
                    autoComplete="new-password"
                    required
                  />
                  <div className="form-text">At least 8 characters, with a letter and a number.</div>
                </div>

                <button className="btn btn-primary w-100 py-2 fw-bold mt-4" disabled={busy}>
                  {busy ? 'Creating your account…' : 'Register free'}
                </button>
              </form>

              <p className="small text-muted mt-4 mb-0">
                Already registered? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
