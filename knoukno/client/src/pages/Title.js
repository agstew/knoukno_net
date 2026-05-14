import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import List from "../components/List";

const TIER_LIMITS = { free: 5, member: 50, pro: 75, bonus: 100 };

export default function Title() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchTitles();
  }, []);

  async function fetchTitles() {
    try {
      const res = await axios.get("/api/titles", authHeaders);
      setTitles(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Please enter a name.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await axios.post(
        "/api/titles",
        {
          name: newName.trim(),
          tier: user.tier,
        },
        authHeaders
      );
      setTitles([res.data, ...titles]);
      setNewName("");
      setShowModal(false);
      navigate(`/questions/${res.data._id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create assessment.");
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (title) => navigate(`/questions/${title._id}`);

  const tierLimit = TIER_LIMITS[user?.tier] || 5;

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard">
            Kno U <span>Kno</span>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/logout" className="btn btn-outline btn-sm">
            Log Out
          </Link>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>My Assessments</h1>
            <p className="subtext">
              Each assessment is tied to your <strong>{user?.tier}</strong> tier
              ({tierLimit} questions).
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            ＋ New Assessment
          </button>
        </div>

        {loading ? (
          <div className="page-loading">
            <div className="spinner" />
          </div>
        ) : titles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>No assessments yet. Create your first one!</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Start Your First Assessment
            </button>
          </div>
        ) : (
          <List titles={titles} onSelect={handleSelect} />
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Assessment</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Assessment Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. My Bakery Business Plan"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setError("");
                  }}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Tier</label>
                <div className="tier-badge-sm" data-tier={user?.tier}>
                  {user?.tier?.toUpperCase()}
                </div>
                <p className="form-hint">
                  {tierLimit} questions will be unlocked for this assessment.
                </p>
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? "Creating…" : "Create & Start →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
