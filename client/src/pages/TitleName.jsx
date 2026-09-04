import { useNavigate } from 'react-router-dom';
import { useActiveTitle } from '../hooks/useActiveTitle.js';

/** titleName.js — the list of business titles. Click one and you go to the Dashboard. */
export default function TitleName({ titles, onDeleted }) {
  const navigate = useNavigate();
  const { select } = useActiveTitle();

  if (!titles.length) {
    return (
      <div className="kk-card p-4 text-center text-muted">
        No business title yet. Write one above and it will show up here.
      </div>
    );
  }

  const open = (title) => {
    select(title.id, title.business_title);
    navigate('/dashboard');
  };

  return (
    <div className="row g-3">
      {titles.map((title) => (
        <div className="col-md-6" key={title.id}>
          <div
            className="kk-card kk-card--link kk-card__top h-100 p-4"
            role="button"
            tabIndex={0}
            onClick={() => open(title)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open(title)}
          >
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h3 className="h5 mb-1">{title.business_title}</h3>
                <p className="text-muted small mb-0">
                  {[title.industry, title.location].filter(Boolean).join(' · ') || 'No details yet'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleted(title.id);
                }}
                aria-label={`Delete ${title.business_title}`}
              >
                Delete
              </button>
            </div>

            <div className="d-flex gap-4 mt-3 small">
              <span>
                <strong className="text-primary">{title.question_count}</strong>{' '}
                {Number(title.question_count) === 1 ? 'question' : 'questions'} written
              </span>
              <span>
                <strong className="text-primary">{title.answer_count}</strong>{' '}
                {Number(title.answer_count) === 1 ? 'answer' : 'answers'} saved
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
