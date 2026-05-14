import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import List from "../components/List";

const TIER_LIMITS = { free: 5, member: 50, pro: 75, bonus: 100 };
const TIER_PRICES = { member: "$39", pro: "$436", bonus: "$100" };
const TIER_ORDER = { free: 0, member: 1, pro: 2, bonus: 3 };

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [titles, setTitles] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    bestGrade: "—",
    avgScore: "—",
  });
  const [loading, setLoading] = useState(true);
  const [upgraded, setUpgraded] = useState(
    searchParams.get("upgraded") === "true"
  );

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("/api/titles", authHeaders);
        const data = res.data || [];
        setTitles(data);
        const completed = data.filter(
          (t) =>
            t.completedQuestions >= t.totalQuestions && t.totalQuestions > 0
        );
        const grades = completed.map((t) => t.overallGrade).filter(Boolean);
        const gradeOrder = ["A", "B", "C", "D", "F"];
        const best = grades.length
          ? grades.sort(
              (a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b)
            )[0]
          : "—";
        const avgs = completed.map((t) => t.averageScore).filter((n) => n > 0);
        const avgScore = avgs.length
          ? (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1) + "%"
          : "—";
        setStats({
          total: data.length,
          completed: completed.length,
          bestGrade: best,
          avgScore,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    if (upgraded) setTimeout(() => setUpgraded(false), 5000);
  }, []);

  const handleSelect = (title) => navigate(`/questions/${title._id}`);

  const tierUp = user?.tier;
  const nextTier =
    tierUp === "free"
      ? "member"
      : tierUp === "member"
      ? "pro"
      : tierUp === "pro"
      ? "bonus"
      : null;

  const handleUpgrade = async () => {
    try {
      const res = await axios.post(
        "/api/stripe/create-checkout",
        { tier: nextTier },
        authHeaders
      );
      window.location.href = res.data.url;
    } catch (e) {
      alert(
        "Stripe checkout unavailable — configure STRIPE_SECRET_KEY in .env"
      );
    }
  };

  if (loading)
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <div className="navbar-brand">
          Kno U <span>Kno</span>
        </div>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/titles">My Assessments</Link>
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          <Link to="/logout" className="btn btn-outline btn-sm">
            Log Out
          </Link>
        </div>
      </nav>

      <div className="dashboard-container">
        {upgraded && (
          <div className="success-banner">
            🎉 Upgrade successful! Welcome to the {user?.tier} tier.
          </div>
        )}

        <div className="dashboard-header">
          <div>
            <h1>
              Welcome back,{" "}
              <span className="gold">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="subtext">
              Your business readiness journey continues here.
            </p>
          </div>
          <div className="tier-badge-lg" data-tier={user?.tier}>
            {user?.tier?.toUpperCase()} TIER
            <br />
            <small>{TIER_LIMITS[user?.tier]} questions</small>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Assessments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-number grade-text"
              data-grade={stats.bestGrade}
            >
              {stats.bestGrade}
            </div>
            <div className="stat-label">Best Grade</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.avgScore}</div>
            <div className="stat-label">Avg Score</div>
          </div>
        </div>

        {nextTier && (
          <div className="upgrade-banner">
            <div>
              <strong>Unlock more questions.</strong> Upgrade to{" "}
              <span className="tier-name">{nextTier}</span> for{" "}
              {TIER_LIMITS[nextTier]} questions at {TIER_PRICES[nextTier]}.
            </div>
            <button className="btn btn-gold" onClick={handleUpgrade}>
              Upgrade Now →
            </button>
          </div>
        )}

        <div className="dashboard-actions">
          <Link to="/titles" className="btn btn-primary">
            Business Title
          </Link>
          <Link to="/titles" className="btn btn-outline">
            List of Business Titles
          </Link>
          <button className="btn btn-outline" onClick={() => window.print()}>Print</button>
          <button className="btn btn-outline" onClick={() => alert("Dashboard saved.")}>Save</button>
          <Link to={titles[0]?._id ? `/questions/${titles[0]._id}` : "/titles"} className="btn btn-outline">Question</Link>
          <Link to={titles[0]?._id ? `/grade/${titles[0]._id}` : "/titles"} className="btn btn-outline">Grade</Link>
          <Link to={titles[0]?._id ? `/rate/${titles[0]._id}` : "/titles"} className="btn btn-outline">Rated</Link>
          <Link to={titles[0]?._id ? `/questions/${titles[0]._id}` : "/titles"} className="btn btn-outline">Answers</Link>
          <Link to={titles[0]?._id ? `/average/${titles[0]._id}` : "/titles"} className="btn btn-outline">Average</Link>
          <button className="btn btn-outline" onClick={() => alert("Answers, grade, rated list, and average are saved on their pages.")}>Save All</button>
          <button className="btn btn-danger" onClick={() => alert("Open a business title to delete saved records.")}>Delete</button>
        </div>

        <div className="section-heading">Recent Assessments</div>
        {titles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No assessments yet. Start your first one!</p>
            <Link to="/titles" className="btn btn-primary">
              Start Now
            </Link>
          </div>
        ) : (
          <List titles={titles.slice(0, 3)} onSelect={handleSelect} />
        )}
      </div>
    </div>
  );
}
