import React, { useState } from 'react';
import { apiFetch } from '../api/client';

export default function Apply() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const change = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      const res = await apiFetch('/api/hiring/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not submit application.');
      setStatus('submitted');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (status === 'submitted') {
    return (
      <section className="live-section">
        <div className="live-section-inner">
          <div className="live-section-copy">
            <h2>Thank You</h2>
            <p>Your application has been received. Check your email for a confirmation, and we'll be in touch if your background is a match.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="live-section">
      <div className="live-section-inner">
        <div className="live-section-copy" style={{ width: '100%' }}>
          <p className="live-section-label">Join the team</p>
          <h2>Apply for a role</h2>
          <p>Tell us about yourself and the role you're interested in.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full name</label>
              <input id="name" name="name" className="form-control" value={form.name} onChange={change} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={change} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone (optional)</label>
              <input id="phone" name="phone" className="form-control" value={form.phone} onChange={change} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="position">Position you're applying for</label>
              <input id="position" name="position" className="form-control" value={form.position} onChange={change} placeholder="e.g. Customer Support" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="message">Tell us about yourself</label>
              <textarea id="message" name="message" className="form-control" rows={6} value={form.message} onChange={change} placeholder="Relevant experience, why you want to join, links to your resume or portfolio\u2026" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Submitting\u2026' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
