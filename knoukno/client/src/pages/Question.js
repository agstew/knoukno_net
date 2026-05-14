import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';

const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, F: 0 };
const GRADES = ['A', 'B', 'C', 'D', 'F'];

export default function Question() {
  const { titleId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState(null);
  const [answers, setAnswers] = useState({});  // { questionId: { answerText, grade } }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    async function load() {
      try {
        const [qRes, aRes, tRes] = await Promise.all([
          axios.get('/api/questions', authHeaders),
          axios.get(`/api/answers/${titleId}`, authHeaders),
          axios.get(`/api/titles/${titleId}`, authHeaders),
        ]);
        setQuestions(qRes.data?.questions || qRes.data || []);
        setTitle(tRes.data?.title || tRes.data || {});
        // Map saved answers by questionId
        const savedAnswers = {};
        (aRes.data || []).forEach(a => {
          savedAnswers[a.questionId] = { answerText: a.answerText, grade: a.grade };
        });
        setAnswers(savedAnswers);
      } catch (e) {
        setError('Failed to load questions.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [titleId]);

  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? (answers[currentQ.id] || { answerText: '', grade: '' }) : { answerText: '', grade: '' };

  const updateCurrent = (field, value) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...(prev[currentQ.id] || {}), [field]: value },
    }));
  };

  const saveCurrentAnswer = useCallback(async (silent = false) => {
    if (!currentQ) return;
    const ans = answers[currentQ.id] || {};
    if (!ans.answerText && !ans.grade) return; // nothing to save
    if (!silent) setSaving(true);
    try {
      await axios.post('/api/answers', {
        titleId,
        questionId: currentQ.id,
        questionText: currentQ.text,
        answerText: ans.answerText || '',
        grade: ans.grade || '',
        gradePoints: GRADE_POINTS[ans.grade] ?? 0,
      }, authHeaders);
      if (!silent) {
        setSavedFlag(true);
        setTimeout(() => setSavedFlag(false), 2000);
      }
    } catch (e) {
      if (!silent) setError('Save failed. Please try again.');
      console.error(e);
    } finally {
      if (!silent) setSaving(false);
    }
  }, [currentQ, answers, titleId, token]);

  const goTo = async (newIndex) => {
    await saveCurrentAnswer(true);
    setCurrentIndex(newIndex);
    setSavedFlag(false);
  };

  const handleFinish = async () => {
    await saveCurrentAnswer(true);
    navigate(`/grade/${titleId}`);
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (error) return <div className="page-container"><div className="error-msg">{error}</div></div>;
  if (!questions.length) return <div className="page-container"><p>No questions found for your tier.</p></div>;

  const total = questions.length;
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const isLast = currentIndex === total - 1;
  const isFirst = currentIndex === 0;
  const answeredCount = Object.keys(answers).filter(k => answers[k]?.answerText).length;

  return (
    <div className="question-page">
      <nav className="navbar navbar-dark">
        <div className="navbar-brand"><Link to="/dashboard">Kno U <span>Kno</span></Link></div>
        <div className="navbar-links">
          <span className="tier-badge-sm" data-tier={user?.tier}>{user?.tier?.toUpperCase()}</span>
          <Link to={`/grade/${titleId}`} className="btn btn-outline btn-sm">View Grades</Link>
        </div>
      </nav>

      <div className="question-container">
        {/* Header / Progress */}
        <div className="question-progress-header">
          <div className="question-counter">
            Question <strong>{currentIndex + 1}</strong> of <strong>{total}</strong>
            {title?.name && <span className="title-name-chip"> · {title.name}</span>}
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-pct">{answeredCount}/{total} answered · {progress}% complete</div>
        </div>

        {/* Question card */}
        <div className="question-card">
          <div className="question-number-badge">Q{currentQ.id}</div>
          <h2 className="question-text">{currentQ.text}</h2>

          <div className="example-box">
            <div className="example-label">📖 EXAMPLE</div>
            <p className="example-text">{currentQ.example}</p>
          </div>

          <div className="answer-section">
            <label className="answer-label">YOUR ANSWER</label>
            <textarea
              className="answer-textarea"
              placeholder="Write your honest answer here…"
              value={currentAnswer.answerText}
              onChange={e => updateCurrent('answerText', e.target.value)}
              rows={8}
            />
          </div>

          <div className="grade-section">
            <label className="grade-label">GRADE THIS ANSWER</label>
            <div className="grade-buttons">
              {GRADES.map(g => (
                <button
                  key={g}
                  className={`grade-btn grade-btn-${g} ${currentAnswer.grade === g ? 'active' : ''}`}
                  onClick={() => updateCurrent('grade', g)}
                  title={`${g} = ${GRADE_POINTS[g]} points`}
                >
                  {g}
                  <span className="grade-pts">{GRADE_POINTS[g]}pt</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="question-nav">
            <button
              className="btn btn-outline"
              onClick={() => goTo(currentIndex - 1)}
              disabled={isFirst}
            >
              ← Prev
            </button>

            <button
              className="btn btn-save"
              onClick={() => saveCurrentAnswer(false)}
              disabled={saving}
            >
              {saving ? 'Saving…' : savedFlag ? '✓ Saved' : 'Save'}
            </button>

            {isLast ? (
              <button className="btn btn-primary btn-finish" onClick={handleFinish}>
                Complete Assessment →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => goTo(currentIndex + 1)}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Mini question map */}
        <div className="question-map">
          {questions.map((q, i) => {
            const ans = answers[q.id];
            const hasAnswer = ans?.answerText;
            const hasGrade = ans?.grade;
            return (
              <button
                key={q.id}
                className={`map-dot ${i === currentIndex ? 'current' : ''} ${hasAnswer ? 'answered' : ''} ${hasGrade ? 'graded' : ''}`}
                onClick={() => goTo(i)}
                title={`Q${q.id}: ${hasGrade ? ans.grade : 'no grade'}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
