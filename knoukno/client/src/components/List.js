import React from 'react';
import { Link } from 'react-router-dom';

const TIER_CLASS = {
  free: 'tier-free',
  member: 'tier-member',
  pro: 'tier-pro',
  bonus: 'tier-bonus',
};

const TIER_QUESTIONS = { free: 5, member: 50, pro: 75, bonus: 100 };

const GRADE_COLORS = {
  A: 'grade-A', B: 'grade-B', C: 'grade-C', D: 'grade-D', F: 'grade-F',
};

function getOverallGrade(avgPoints) {
  if (avgPoints >= 4.5) return 'A';
  if (avgPoints >= 3.5) return 'B';
  if (avgPoints >= 2.5) return 'C';
  if (avgPoints >= 1.5) return 'D';
  return 'F';
}

export default function List({ titles = [], onSelect }) {
  if (titles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--gray)' }}>
        <p style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>No assessments yet.</p>
        <p style={{ fontSize: '0.9rem' }}>Click <strong>New Assessment</strong> to get started.</p>
      </div>
    );
  }

  return (
    <ul className="title-list">
      {titles.map((title) => {
        const tier = title.tier || 'free';
        const maxQ = TIER_QUESTIONS[tier] || 5;
        const answered = title.answeredCount ?? 0;
        const pct = Math.round((answered / maxQ) * 100);
        const avgPoints = title.averageGradePoints ?? null;
        const overallGrade = avgPoints != null ? getOverallGrade(avgPoints) : null;
        const dateStr = title.createdAt
          ? new Date(title.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '';

        return (
          <li
            key={title._id || title.id}
            className="title-item"
            onClick={() => onSelect && onSelect(title)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect && onSelect(title)}
          >
            <div className="title-item-info">
              <h4>{title.name || title.title || 'Untitled Assessment'}</h4>
              <p>
                {answered}/{maxQ} questions answered
                {dateStr && ` · Created ${dateStr}`}
              </p>
              <div style={{ marginTop: '0.5rem', maxWidth: 220 }}>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
            <div className="title-item-meta">
              <span className={`tier-badge ${TIER_CLASS[tier]}`}>{tier}</span>
              {overallGrade && (
                <span className={`grade-badge ${GRADE_COLORS[overallGrade]}`}>{overallGrade}</span>
              )}
              {title.completed && (
                <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>✓ Complete</span>
              )}
              <Link
                to={`/questions/${title._id || title.id}`}
                className="btn btn-sm btn-outline"
                onClick={(e) => e.stopPropagation()}
              >
                Open
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
