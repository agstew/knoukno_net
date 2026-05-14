import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [overview, setOverview] = useState({ users: 0, titles: 0, answers: 0 });
  const [questionPage, setQuestionPage] = useState(1);
  const [answerPage, setAnswerPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await axios.get('/api/admin/overview', authHeaders);
        setOverview(res.data);
      } catch (e) {
        setError(e.response?.data?.message || 'Admin access required.');
      }
    }
    loadOverview();
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await axios.get(`/api/admin/questions?page=${questionPage}&limit=1`, authHeaders);
        setQuestions(res.data.questions || []);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load questions.');
      }
    }
    loadQuestions();
  }, [questionPage]);

  useEffect(() => {
    async function loadAnswers() {
      try {
        const res = await axios.get(`/api/admin/answers?page=${answerPage}&limit=5`, authHeaders);
        setAnswers(res.data.answers || []);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load answers.');
      }
    }
    loadAnswers();
  }, [answerPage]);

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">Kno U <span>Kno</span></Link>
        <div className="navbar-links">
          <Link to="/dashboard">Client Dashboard</Link>
          <Link to="/logout" className="btn btn-outline btn-sm">Log Out</Link>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtext">Questions, examples, client answers, grades, ratings, averages, save, print, and delete controls.</p>
          </div>
          <span className="tier-badge-sm" data-tier="pro">{user?.role || 'client'}</span>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="dashboard-actions">
          {['free', 'print', 'save', 'question', 'grade', 'rated', 'answers', 'average', 'save answers', 'save grade', 'save rated', 'save all'].map((label) => (
            <button key={label} className="btn btn-outline" onClick={() => label === 'print' ? window.print() : null}>{label}</button>
          ))}
          <button className="btn btn-danger">Delete</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-number">{overview.users}</div><div className="stat-label">Registered Clients</div></div>
          <div className="stat-card"><div className="stat-number">{overview.titles}</div><div className="stat-label">Business Titles</div></div>
          <div className="stat-card"><div className="stat-number">{overview.answers}</div><div className="stat-label">Saved Answers</div></div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">Make Questions — Pagination</div>
          {questions.map((q) => (
            <div key={q.id} className="sample-question-card">
              <div className="q-num">Q{q.id}</div>
              <p><strong>{q.text}</strong></p>
              <p className="example-text">{q.example}</p>
            </div>
          ))}
          <div className="grade-actions">
            <button className="btn btn-outline" onClick={() => setQuestionPage(Math.max(1, questionPage - 1))}>Prev</button>
            <span>Question page {questionPage}</span>
            <button className="btn btn-primary" onClick={() => setQuestionPage(questionPage + 1)}>Next</button>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">Answers — Pagination</div>
          {answers.length === 0 ? <p className="subtext">No client answers yet.</p> : answers.map((answer) => (
            <div key={answer._id} className="sample-question-card">
              <div className="q-num">Q{answer.questionId}</div>
              <p><strong>{answer.titleId?.name || 'Business Title'}</strong> — {answer.userId?.email}</p>
              <p>{answer.answerText || 'No text saved.'}</p>
              <p className="subtext">Grade: {answer.grade || 'none'} · Rate: {answer.ratePosition || 'none'}</p>
            </div>
          ))}
          <div className="grade-actions">
            <button className="btn btn-outline" onClick={() => setAnswerPage(Math.max(1, answerPage - 1))}>Prev</button>
            <span>Answer page {answerPage}</span>
            <button className="btn btn-primary" onClick={() => setAnswerPage(answerPage + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
