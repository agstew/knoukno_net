import { useEffect, useState } from 'react';

import FeatureShell from '../components/FeatureShell';
import { loadWorkspace, saveWorkspace } from '../lib/clientStore';

export default function TitlePage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const state = loadWorkspace();
    setTitle(state.businessTitle || '');
  }, []);

  function handleSave() {
    const state = loadWorkspace();
    saveWorkspace({
      ...state,
      businessTitle: title
    });
    setMessage('Title saved.');
  }

  return (
    <FeatureShell title="Title">
      <section className="panel-grid">
        <article className="auth-card">
          <h2>Title for the Business</h2>
          <input id="businessTitle" name="businessTitle" className="form-control auth-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Business title" />
          <button type="button" className="btn auth-button" onClick={handleSave}>Save Title</button>
          {message ? <p className="auth-note">{message}</p> : null}
        </article>
        <article className="auth-card image-card">
          <img src="/image_3583b72.png" alt="KnoUKno logo" className="client-image" />
        </article>
      </section>
    </FeatureShell>
  );
}
