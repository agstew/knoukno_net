import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Kno U <span>Kno</span></Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/register">Registered</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
          <Link to="/price">Price</Link>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>About Kno U Kno</h1>
            <p className="subtext">Hard questions for people who want a real business, not a guess.</p>
          </div>
        </div>

        <div className="card long-copy">
          <p>
            Kno U Kno is built for the person standing at the edge of business ownership and asking,
            "What do I really need to know before I spend my money, hire employees, sign a lease, or
            promise customers something I cannot yet deliver?" A business is not only an idea. It is
            money moving in and out, legal duties, customer trust, employee responsibility, learning,
            operations, time pressure, and decisions that must be made before all the facts are known.
            Many people want to be owners, but they have never been forced to answer the questions
            that reveal whether the business can actually work.
          </p>
          <p>
            This website separates every question so the client must slow down and answer one truth
            at a time. The questions cover starting a business, managing the business, protecting the
            money, learning the market, training employees, pricing, risk, law, customers, suppliers,
            records, taxes, profit, and what happens when the plan breaks. Each question includes an
            example, because examples help turn a hard idea into something the client can understand
            and answer. The answer is saved to the database, graded, averaged, rated, printed, and
            connected back to the business title the client created.
          </p>
          <p>
            Kno U Kno helps people before they become owners and after they become owners. It helps
            beginners see what is missing. It helps members organize fifty core answers. It helps pro
            clients go deeper into money, management, and legal readiness. It helps serious builders
            use bonus questions when they need more pressure and more clarity. The goal is simple:
            ask the question that is hard to answer now, so the business does not answer it later
            with lost money, confused employees, broken promises, or closed doors.
          </p>
        </div>
      </div>
    </div>
  );
}
