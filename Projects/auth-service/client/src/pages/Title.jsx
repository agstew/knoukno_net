import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Loader, { Alert } from '../components/Loader.jsx';
import TitleName from './TitleName.jsx';

const EMPTY = { businessTitle: '', industry: '', location: '', description: '' };

/** Title.js — the form that names the business, with the titleName list underneath. */
export default function Title() {
  const [form, setForm] = useState(EMPTY);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get('/titles');
      setTitles(data.titles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/titles', form);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this business title and everything under it?')) return;
    try {
      await api.del(`/titles/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="kk-section kk-section--alt">
      <div className="container">
        <span className="kk-section__eyebrow">Title</span>
        <h1 className="kk-section__title">Name the business</h1>
        <p className="lead mb-4" style={{ maxWidth: '46rem' }}>
          Everything starts here. The title, the trade, and where you want to be — the AI writes
          every question around what you type below.
        </p>

        <Alert onClose={() => setError('')}>{error}</Alert>

        <div className="kk-card kk-card__top kk-card__top--gold p-4 p-md-5 mb-5">
          <form onSubmit={submit} noValidate>
            <div className="row g-3">
              <div className="col-lg-6">
                <label className="form-label" htmlFor="businessTitle">Business title</label>
                <input
                  id="businessTitle"
                  name="businessTitle"
                  className="form-control form-control-lg"
                  value={form.businessTitle}
                  onChange={change}
                  placeholder="Kno U Kno Coffee House"
                  required
                />
              </div>
              <div className="col-lg-3">
                <label className="form-label" htmlFor="industry">Industry</label>
                <input
                  id="industry"
                  name="industry"
                  className="form-control form-control-lg"
                  value={form.industry}
                  onChange={change}
                  placeholder="Food and drink"
                />
              </div>
              <div className="col-lg-3">
                <label className="form-label" htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  className="form-control form-control-lg"
                  value={form.location}
                  onChange={change}
                  placeholder="Atlanta, GA"
                />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="description">What is the business?</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={change}
                  placeholder="Two sentences on what you sell and who buys it."
                />
              </div>
            </div>

            <button className="btn btn-primary px-4 py-2 fw-bold mt-4" disabled={busy}>
              {busy ? 'Saving…' : 'Save business title'}
            </button>
          </form>
        </div>

        <h2 className="h4 mb-3">Your business titles</h2>
        {loading ? <Loader label="Loading your titles…" /> : <TitleName titles={titles} onDeleted={remove} />}
      </div>
    </section>
  );
}
