export default function PaginationControls({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pager-row">
      <button type="button" className="btn auth-button auth-button--secondary" onClick={onPrev} disabled={page <= 1}>Previous</button>
      <span className="pager-label">Page {page} / {totalPages}</span>
      <button type="button" className="btn auth-button auth-button--secondary" onClick={onNext} disabled={page >= totalPages}>Next</button>
    </div>
  );
}
