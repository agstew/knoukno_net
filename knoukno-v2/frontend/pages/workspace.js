import Head from 'next/head';
import { useEffect, useState } from 'react';

import MemberShell from '../components/MemberShell';
import { apiRequest } from '../lib/session';
import { useProtectedPage } from '../lib/useProtectedPage';

const initialForm = {
  title: '',
  question: '',
  answer: '',
  grade: '0',
  rated: '0',
  to: '',
  message: '',
};

export default function WorkspacePage() {
  const { user, loading } = useProtectedPage();
  const [formData, setFormData] = useState(initialForm);
  const [summary, setSummary] = useState({});
  const [message, setMessage] = useState('');
  const [questionItems, setQuestionItems] = useState([]);
  const [questionOffset, setQuestionOffset] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      apiRequest('/api/workspace')
        .then((payload) => {
          setSummary(payload);
        })
        .catch((error) => {
          setMessage(error.message);
        });

      apiRequest('/api/questions/catalog?offset=0&limit=12')
        .then((payload) => {
          setQuestionItems(payload.items);
          setQuestionOffset(0);
        })
        .catch((error) => {
          setMessage(error.message);
        });
    }
  }, [loading, user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleAction(path) {
    try {
      setMessage('');
      await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const payload = await apiRequest('/api/workspace');
      setSummary(payload);
      setMessage('Saved');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleQuestionRefresh() {
    try {
      const nextOffset = (questionOffset + 12) % 300;
      const payload = await apiRequest(`/api/questions/catalog?offset=${nextOffset}&limit=12`);
      setQuestionItems(payload.items);
      setQuestionOffset(nextOffset);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleQuestionSelect(item) {
    setFormData((current) => ({
      ...current,
      title: item.title,
      question: item.question,
    }));
  }

  const average = summary.average?.value || {};

  return (
    <>
      <Head>
        <title>Workspace | Kno U Kno</title>
      </Head>

      <MemberShell title="Workspace" user={user}>
        {loading ? <div className="auth-card">Loading...</div> : null}
        {!loading && user ? (
          <section className="panel-grid">
            <article className="auth-card workspace-form">
              <input className="form-control auth-input" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
              <textarea className="form-control auth-input auth-textarea" name="question" placeholder="Question" value={formData.question} onChange={handleChange} required />
              <textarea className="form-control auth-input auth-textarea" name="answer" placeholder="Answer" value={formData.answer} onChange={handleChange} required />
              <input className="form-control auth-input" name="grade" type="number" min="0" max="100" placeholder="Grade" value={formData.grade} onChange={handleChange} />
              <input className="form-control auth-input" name="rated" type="number" min="0" max="5" placeholder="Rated" value={formData.rated} onChange={handleChange} />
              <input className="form-control auth-input" name="to" type="email" placeholder="Email recipient" value={formData.to} onChange={handleChange} />
              <textarea className="form-control auth-input auth-textarea" name="message" placeholder="Email message" value={formData.message} onChange={handleChange} />
              <div className="inline-actions">
                <button className="btn auth-button" type="button" onClick={() => handleAction('/api/workspace/save')}>Save</button>
                <button className="btn auth-button auth-button--secondary" type="button" onClick={() => handleAction('/api/workspace/print')}>Print</button>
                <button className="btn auth-button auth-button--secondary" type="button" onClick={() => handleAction('/api/workspace/email')}>Email</button>
              </div>
              {message ? <p className="auth-error auth-note">{message}</p> : null}
            </article>

            <article className="auth-card stacked-list">
              <div className="inline-actions">
                <button className="btn auth-button" type="button" onClick={handleQuestionRefresh}>
                  Next 12 Questions
                </button>
              </div>
              {questionItems.map((item) => (
                <button key={item.sequence} className="question-pick" type="button" onClick={() => handleQuestionSelect(item)}>
                  <span>{item.sequence}. {item.title}</span>
                  <small>{item.question}</small>
                </button>
              ))}
              <section className="section-row"><span>title</span><span>{summary.title?.length || 0}</span></section>
              <section className="section-row"><span>question</span><span>{summary.question?.length || 0}</span></section>
              <section className="section-row"><span>answers</span><span>{summary.answers?.length || 0}</span></section>
              <section className="section-row"><span>grade</span><span>{summary.grade?.length || 0}</span></section>
              <section className="section-row"><span>rated</span><span>{summary.rated?.length || 0}</span></section>
              <section className="section-row"><span>save</span><span>{summary.save?.length || 0}</span></section>
              <section className="section-row"><span>print</span><span>{summary.print?.length || 0}</span></section>
              <section className="section-row"><span>email</span><span>{summary.email?.length || 0}</span></section>
              <section className="section-row"><span>average grade</span><span>{average.avgGrade || 0}</span></section>
              <section className="section-row"><span>average rated</span><span>{average.avgRated || 0}</span></section>
            </article>
          </section>
        ) : null}
      </MemberShell>
    </>
  );
}