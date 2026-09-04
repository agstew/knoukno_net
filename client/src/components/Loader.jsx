export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="text-center py-5 my-5">
      <div className="spinner-border text-primary" role="status" aria-hidden="true" />
      <p className="mt-3 mb-0 text-muted">{label}</p>
    </div>
  );
}

export function Alert({ kind = 'danger', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${kind} ${onClose ? 'alert-dismissible' : ''}`} role="alert">
      {children}
      {onClose && <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />}
    </div>
  );
}

export function StagePill({ stage }) {
  return <span className={`kk-stage-pill kk-stage-pill--${stage}`}>{stage}</span>;
}
