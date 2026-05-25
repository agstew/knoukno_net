"use client";

export default function Print() {
  return (
    <section className="info-card mb-4">
      <h3>Print.jsx</h3>
      <p>Prepare your title, question list, and answers before printing.</p>
      <button className="btn btn-dark" onClick={() => window.print()}>
        Print Page
      </button>
    </section>
  );
}
