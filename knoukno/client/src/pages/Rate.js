import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";

const TIER_SCALES = { free: 5, member: 50, pro: 75, bonus: 100 };
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, F: 0 };

export default function Rate() {
  const { titleId } = useParams();
  const { token, user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [rateList, setRateList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [error, setError] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const tier = user?.tier || "free";
  const scale = TIER_SCALES[tier];

  useEffect(() => {
    async function load() {
      try {
        const [qRes, aRes, tRes] = await Promise.all([
          axios.get("/api/questions", authHeaders),
          axios.get(`/api/answers/${titleId}`, authHeaders),
          axios.get(`/api/titles/${titleId}`, authHeaders),
        ]);
        const qs = qRes.data?.questions || qRes.data || [];
        const as = aRes.data || [];
        setQuestions(qs);
        setAnswers(as);
        setTitle(tRes.data);

        // Build initial rate list sorted by grade (best first)
        const ansMap = {};
        as.forEach((a) => {
          ansMap[a.questionId] = a;
        });
        const list = qs.slice(0, scale).map((q, i) => ({
          questionId: q.id,
          questionText: q.text,
          grade: ansMap[q.id]?.grade || "",
          points: GRADE_POINTS[ansMap[q.id]?.grade] ?? 0,
          rank: i + 1,
          hasAnswer: !!ansMap[q.id]?.answerText,
        }));
        // Sort by grade points descending
        list.sort((a, b) => b.points - a.points);
        list.forEach((item, i) => {
          item.rank = i + 1;
        });
        setRateList(list);
      } catch (e) {
        setError("Failed to load rate data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [titleId]);

  const handleDragStart = (idx) => setDragIdx(idx);

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newList = [...rateList];
    const [dragged] = newList.splice(dragIdx, 1);
    newList.splice(idx, 0, dragged);
    newList.forEach((item, i) => {
      item.rank = i + 1;
    });
    setRateList(newList);
    setDragIdx(idx);
  };

  const handleDrop = () => setDragIdx(null);

  const moveUp = (idx) => {
    if (idx === 0) return;
    const newList = [...rateList];
    [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    newList.forEach((item, i) => {
      item.rank = i + 1;
    });
    setRateList(newList);
  };

  const moveDown = (idx) => {
    if (idx === rateList.length - 1) return;
    const newList = [...rateList];
    [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
    newList.forEach((item, i) => {
      item.rank = i + 1;
    });
    setRateList(newList);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await axios.post(
        "/api/rates/save",
        {
          titleId,
          rates: rateList.map((item) => ({
            questionId: item.questionId,
            ratePosition: item.rank,
          })),
        },
        authHeaders
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Failed to save rankings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard">
            Kno U <span>Kno</span>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to={`/average/${titleId}`}>← Average</Link>
          <span className="tier-badge-sm" data-tier={tier}>
            {tier.toUpperCase()}
          </span>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Rate Your Answers</h1>
            {title?.name && <p className="subtext">{title.name}</p>}
            <p className="subtext">
              Scale: 1 – {scale} · Drag or use arrows to reorder by confidence
            </p>
          </div>
          <div className="scale-badge">
            {tier === "member" && "1–50"}
            {tier === "pro" && "1–75"}
            {tier === "bonus" && "1–100"}
            {tier === "free" && "1–5"}
            <div style={{ fontSize: "0.7rem", marginTop: 2 }}>
              {tier.toUpperCase()} scale
            </div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {saved && <div className="success-banner">✓ Rankings saved!</div>}

        <div className="rate-legend">
          <span className="grade-badge grade-A">A=5</span>
          <span className="grade-badge grade-B">B=4</span>
          <span className="grade-badge grade-C">C=3</span>
          <span className="grade-badge grade-D">D=2</span>
          <span className="grade-badge grade-F">F=0</span>
          <span
            style={{
              marginLeft: "1rem",
              color: "var(--gray)",
              fontSize: "0.85rem",
            }}
          >
            Drag rows or use ↑↓ to reorder
          </span>
        </div>

        <div className="rate-list">
          {rateList.map((item, idx) => (
            <div
              key={item.questionId}
              className={`rate-row ${dragIdx === idx ? "dragging" : ""} ${
                item.hasAnswer ? "has-answer" : "no-answer"
              }`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={handleDrop}
            >
              <div className="rate-rank">{item.rank}</div>
              <span className={`grade-badge grade-${item.grade || "none"}`}>
                {item.grade || "—"}
              </span>
              <div className="rate-question-text">
                <strong>Q{item.questionId}</strong> {item.questionText}
              </div>
              <div className="rate-controls">
                <button
                  className="rate-arrow"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className="rate-arrow"
                  onClick={() => moveDown(idx)}
                  disabled={idx === rateList.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
              </div>
              <div className="rate-pts">{item.points}pt</div>
            </div>
          ))}
        </div>

        <div className="grade-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save Rankings"}
          </button>
          <Link to={`/average/${titleId}`} className="btn btn-outline">
            ← Back to Average
          </Link>
          <Link to="/titles" className="btn btn-outline">
            All Assessments
          </Link>
        </div>
      </div>
    </div>
  );
}
