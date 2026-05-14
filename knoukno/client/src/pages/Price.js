import React from 'react';
import { Link } from 'react-router-dom';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    note: '3 days',
    questions: 5,
    features: ['Register required', '5 business-start questions', 'Save page', 'Print page']
  },
  {
    name: 'Member',
    price: '$39',
    note: '20% discount from $49, save $10',
    questions: 50,
    features: ['Business title', 'Print', 'Save', 'Grade', 'Rate', 'Average']
  },
  {
    name: 'Pro',
    price: '$436',
    note: '35% discount from $675, save $239',
    questions: 75,
    featured: true,
    features: ['Everything in Member', 'Deeper money and management questions', 'Harder readiness grading', 'Priority business review']
  },
  {
    name: 'Bonus',
    price: '$100',
    note: 'Buy now add-on',
    questions: 100,
    features: ['100 bonus questions', 'More examples', 'More rating depth', 'Extra pressure-test answers']
  }
];

export default function Price() {
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
            <h1>Price</h1>
            <p className="subtext">Register first. Subscribe to unlock the business questions you need.</p>
          </div>
        </div>

        <div className="card-grid" style={{ alignItems: 'start' }}>
          {TIERS.map((tier) => (
            <div key={tier.name} className={`tier-card${tier.featured ? ' featured' : ''}`}>
              {tier.featured && <div className="tier-badge-top">Best Value</div>}
              <div className="tier-name">{tier.name}</div>
              <div className="tier-price">{tier.price}<span>{tier.note}</span></div>
              <div style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '0.75rem' }}>
                {tier.questions} questions
              </div>
              <ul>
                {tier.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <Link to="/register" className={`btn ${tier.featured ? 'btn-primary' : 'btn-outline'} btn-block`}>
                Register & Subscribe
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
