import { useState } from 'react';

export default function PasswordInput({ id, className = 'form-control', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-group">
      <input id={id} type={visible ? 'text' : 'password'} className={className} {...props} />
      <button
        type="button"
        className="btn btn-outline-secondary"
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
