import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader, { Alert } from '../components/Loader.jsx';
import { useActiveTitle } from '../hooks/useActiveTitle.js';

/** Print / save the whole workbook for the active business title. */
export default function Print() {
  const { titleId } = useActiveTitle();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!titleId) return;
    api
      .get(`/print/${titleId}?kind=print`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [titleId]);

  const savePage = async () => {
    try {
      await api.get(`/print/${titleId}?kind=save`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.title.business_title.replace(/\W+/g, '-').toLowerCase()}-knoukno.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!titleId) {
    return (
      <section className="kk-section kk-section--alt text-center">
        <div className="container">
          <h1 className="kk-section__title">Pick a business title first</h1>
          <Link className="btn btn-primary px-4" to="/title">Go to Title</Link>
        </div>
      </section>
    );
  }

  if (error) return <div className="container py-5"><Alert>{error}</Alert></div>;
  if (!data) return <Loader label="Building your workbook…" />;

  return (
    <section className="kk-section">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 no-print">
          <h1 className="kk-section__title mb-0">Print or save</h1>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary px-4" onClick={() => window.print()} type="button">
              Print page
            </button>
            <button className="btn btn-primary px-4" onClick={savePage} type="button">
              Save page
            </button>
          </div>
        </div>

        <div className="kk-card kk-print-sheet p-4 p-md-5">
          <header className="border-bottom pb-3 mb-4">
            <h2 className="h3 mb-1">{data.title.business_title}</h2>
            <p className="text-muted mb-0 small">
              {[data.title.industry, data.title.location].filter(Boolean).join(' · ')} ·{' '}
              {data.owner.name || data.owner.email} · {new Date(data.generatedAt).toLocaleDateString()}
            </p>
          </header>

          {data.items.map((item) => (
            <article className="mb-4 pb-4 border-bottom" key={item.position}>
              <p className="small text-uppercase fw-bold text-primary mb-1">
                {item.position}. {item.stage}
                {item.letter && <span className="ms-2 text-dark">Grade {item.letter}</span>}
                {item.rank_position && <span className="ms-2 text-muted">Rank {item.rank_position}</span>}
              </p>
              <p className="fw-semibold no-print">{item.prompt}</p>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {item.answer || <span className="text-muted fst-italic">Not answered yet.</span>}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
