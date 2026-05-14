import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <h1>Know Your Business.<br />Know Yourself.</h1>
        <p>
          Kno U Kno gives business owners the knowledge framework they need to start,
          manage, grow, and fund their businesses — one deep question at a time.
        </p>
        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Start Free Trial</Link>
              <Link to="/about" className="btn btn-secondary btn-lg">Learn More</Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Everything You Need to Build a Stronger Business</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>25 Deep-Dive Questions</h3>
            <p>
              Real-world business scenarios covering finances, operations, employees, and growth —
              not trivia, but the hard questions that separate thriving businesses from struggling ones.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Self-Assessment Tools</h3>
            <p>
              Grade your own answers, rate the relevance to your business, and track your progress
              across every topic over time.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Your Knowledge Gaps</h3>
            <p>
              See your average scores, identify weak areas, and save answers to revisit and
              improve as your business grows.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>Tiered Access Plans</h3>
            <p>
              Start free with 5 foundational questions. Upgrade to Members (50 questions) or
              Pro (75 questions) to unlock the full curriculum.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗂️</div>
            <h3>Organized by Business Area</h3>
            <p>
              Questions are organized by business category — finances, starting up, managing
              operations, employees, and growth — so you can focus where you need it most.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Learn at Your Own Pace</h3>
            <p>
              One question at a time, on your schedule. Save your answers and come back to
              continue any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: 'var(--color-primary)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.75rem' }}>
            Ready to Know Your Business Better?
          </h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '1.75rem', fontSize: '1.05rem' }}>
            Start your 3-day free trial today. No credit card required.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">Open Dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Start Free — 3 Days</Link>
                <Link to="/price" className="btn btn-outline btn-lg">See Pricing</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
