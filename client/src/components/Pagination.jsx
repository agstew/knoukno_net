export default function Pagination({ page, pages, onChange, alwaysShow = false }) {
  if (pages <= 1 && !alwaysShow) return null;

  const numbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav aria-label="Questions" className="no-print">
      <ul className="pagination justify-content-center flex-wrap mb-0">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>
        </li>

        {numbers.map((n) => (
          <li className={`page-item ${n === page ? 'active' : ''}`} key={n}>
            <button className="page-link" type="button" onClick={() => onChange(n)}>
              {n}
            </button>
          </li>
        ))}

        <li className={`page-item ${page >= pages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page >= pages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
