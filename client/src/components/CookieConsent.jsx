import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kk_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const respond = (value) => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="kk-cookie-banner no-print" role="dialog" aria-label="Cookie notice">
      <div className="container d-flex flex-column flex-md-row align-items-md-center gap-3 py-3">
        <p className="mb-0 flex-grow-1">
          We use cookies to keep you signed in and remember your preferences. See our{' '}
          <a href="/#cookies" className="text-gold">cookie policy</a> for details.
        </p>
        <div className="d-flex gap-2 flex-shrink-0">
          <button id="cookie-decline" name="cookie-decline" type="button" className="btn btn-outline-light btn-sm" onClick={() => respond('rejected')}>
            Decline
          </button>
          <button id="cookie-accept" name="cookie-accept" type="button" className="btn btn-gold btn-sm" onClick={() => respond('accepted')}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
