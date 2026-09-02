import { StagePill } from '../components/Loader.jsx';

/**
 * AnswersList.js — every answer for the active business title.
 * Grade.js and Rated.js both render it, each supplying its own trailing control.
 */
export default function AnswersList({ answers, renderLead, renderTrail, emptyText }) {
  if (!answers.length) {
    return (
      <div className="kk-card p-5 text-center text-muted">
        {emptyText || 'No answers yet. Answer a question first.'}
      </div>
    );
  }

  return (
    <div className="d-grid gap-3">
      {answers.map((answer, index) => (
        <article className="kk-card kk-card__top p-4" key={answer.answer_id || answer.id}>
          <div className="d-flex gap-3 align-items-start">
            {renderLead && renderLead(answer, index)}

            <div className="flex-grow-1">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <StagePill stage={answer.stage} />
                <span className="small text-muted">Question {answer.position}</span>
              </div>

              <p className="fw-semibold mb-2 no-print">{answer.prompt}</p>
              <p className="mb-0 text-body-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                {answer.body}
              </p>
            </div>

            {renderTrail && <div className="flex-shrink-0">{renderTrail(answer, index)}</div>}
          </div>
        </article>
      ))}
    </div>
  );
}
