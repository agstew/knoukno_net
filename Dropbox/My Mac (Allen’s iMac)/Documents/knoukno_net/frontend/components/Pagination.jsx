export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="d-flex gap-2 align-items-center mt-3">
      <button className="btn btn-outline-secondary btn-sm" onClick={onPrev} disabled={page <= 1}>
        Prev
      </button>
      <span>
        Page {page} / {totalPages}
      </span>
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
