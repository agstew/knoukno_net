import React from 'react';
import './App.css';

export default function NotFound() {
  return (
    <main role="main" aria-labelledby="notfound-heading" className="notfound-wrapper">
      <section className="notfound-card" aria-describedby="notfound-desc">
        <span id="notfound-heading" className="notfound-code" aria-hidden="true">404</span>
        <p id="notfound-desc" className="notfound-message">The requested path could not be found.</p>
      </section>
    </main>
  );
}
