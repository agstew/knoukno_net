import React from 'react';
import { Link } from 'react-router-dom';

const SAMPLE_QUESTIONS = [
  {
    num: 'Q14',
    text: 'What is your unique value proposition — and how is it measurably different from your top three competitors?',
  },
  {
    num: 'Q27',
    text: 'If your primary revenue stream disappeared tomorrow, what is your fallback plan and how long could your business survive?',
  },
  {
    num: 'Q41',
    text: 'Do you have a documented cash flow projection for the next 12 months? What assumptions does it rely on?',
  },
  {
    num: 'Q58',
    text: 'What does your customer acquisition cost look like, and at what point does a customer become profitable?',
  },
  {
    num: 'Q72',
    text: 'Have you identified the single biggest risk to your business right now? What is your mitigation strategy?',
  },
];

const PEOPLE = [
  {
    icon: '🚀',
    title: 'Aspiring Entrepreneurs',
    desc: 'You have the idea and the drive — but do you have the answers? Kno U Kno reveals the gaps in your plan before investors or the market does.',
  },
  {
    icon: '🏢',
    title: 'Existing Business Owners',
    desc: 'Running a business doesn\'t mean you know your business deeply. Stress-test your operations, financials, and strategy with our 175-question framework.',
  },
  {
    icon: '💡',
    title: 'Startup Founders',
    desc: 'Speed is the enemy of depth. Our Pro and Bonus tiers are designed for founders who want to build on solid ground, not guesswork.',
  },
  {
    icon: '💼',
    title: 'Side Hustlers',
    desc: 'Turning your side hustle into a real business requires real answers. Know where you stand before you make the leap.',
  },
  {
    icon: '📊',
    title: 'Investors Evaluating Deals',
    desc: 'Before writing a check, use Kno U Kno to systematically evaluate whether a founder truly knows their business inside and out.',
  },
];

const HAPPENINGS = [
  { initials: 'JT', name: 'James T.', text: 'completed his Pro assessment with a B+ average on "TechScale Ventures"', time: '2 hours ago' },
  { initials: 'MR', name: 'Maria R.', text: 'just upgraded from Member to Pro to unlock 75 deeper questions', time: '5 hours ago' },
  { initials: 'DW', name: 'David W.', text: 'scored an A on his Bonus tier assessment — "Ready to Pitch"', time: 'Yesterday' },
  { initials: 'SC', name: 'Sarah C.', text: 'completed her first Free assessment and is reviewing her grade report', time: '2 days ago' },
  { initials: 'KL', name: 'Kevin L.', text: 'started a new assessment for his food truck business concept', time: '3 days ago' },
];

const TIERS = [
  {
    name: 'Free',
    price: '0',
    period: ' / 3 days',
    questions: 5,
    featured: false,
    features: ['Must register', '5 foundational questions', 'Save page', 'Print page'],
  },
  {
    name: 'Member',
    price: '39',
    period: '',
    questions: 50,
    featured: false,
    features: ['50 business-critical questions', 'Business title', 'Print, save, grade, rate, average', 'Discount from $49'],
  },
  {
    name: 'Pro',
    price: '436',
    period: '',
    questions: 75,
    featured: true,
    badge: 'Most Popular',
    features: ['75 deep-dive questions', 'All Member tier features', 'Rate & rank your answers', 'Discount from $675'],
  },
  {
    name: 'Bonus',
    price: '100',
    period: '',
    questions: 100,
    featured: false,
    features: ['100 bonus questions', 'Buy now add-on', 'Full business pressure test', 'Extra examples and ratings'],
  },
];

export default function Landing() {
  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Kno U <span>Kno</span></Link>
        <div className="navbar-links">
          <Link to="/home">Home</Link>
          <Link to="/register">Registered</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
          <Link to="/price">Price</Link>
          <Link to="/register" className="btn-nav">Subscribe</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow">Business Readiness Platform</div>
        <h1>
          <span className="accent">Kno U Kno</span><br />
          Do You Know Your Business?
        </h1>
        <p>
          Stop guessing. Start knowing. Our business framework asks hard questions about
          starting, managing, money, law, employees, learning, and the pressure of real ownership.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary btn-lg">Start Your Assessment</Link>
          <Link to="/about" className="btn btn-outline-gold btn-lg">Learn More</Link>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section section-alt" id="about">
        <div className="container">
          <h2 className="section-title">Most Business Owners Can't Answer These Questions</h2>
          <p className="section-subtitle">And that's exactly the problem.</p>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <p style={{ lineHeight: 1.8, fontSize: '1.02rem' }}>
                <strong>Kno U Kno is the platform that asks the questions most business owners are afraid to answer.</strong> We
                don't just test your business plan — we test <em>you</em>. We test your depth of knowledge, your preparation,
                and your willingness to confront the hard truths about your venture.
              </p>
            </div>
            <div className="card">
              <p style={{ lineHeight: 1.8, color: 'var(--gray)', fontSize: '0.97rem' }}>
                Most entrepreneurs spend months building pitch decks but can't answer a fundamental question about their customer
                acquisition cost. They know their product inside out but have never stress-tested their financial model. They've
                dreamed about their business for years but haven't mapped the competitive landscape.
              </p>
            </div>
            <div className="card">
              <p style={{ lineHeight: 1.8, color: 'var(--gray)', fontSize: '0.97rem' }}>
                 Our question framework was built by business strategists, investors, and operators who have seen businesses
                succeed and fail. Every question is designed to surface a real vulnerability — or confirm a genuine strength.
                When you're done, you'll have a complete picture of where you stand and exactly what needs work.
              </p>
            </div>
            <div className="card">
              <p style={{ lineHeight: 1.8, color: 'var(--gray)', fontSize: '0.97rem' }}>
                The grade you give yourself is a mirror. Most people grade themselves higher than the evidence supports. That gap —
                between perceived readiness and actual readiness — is where businesses fail. Kno U Kno closes that gap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE QUESTIONS */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Hard-Hitting Business Questions</h2>
          <p className="section-subtitle">Here's a taste of what awaits you. Can you answer these confidently?</p>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {SAMPLE_QUESTIONS.map((q) => (
              <div key={q.num} className="sample-question-card">
                <div className="q-num">{q.num}</div>
                <p>{q.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <Link to="/register" className="btn btn-primary">See All Questions →</Link>
          </div>
        </div>
      </section>

      {/* PEOPLE WE HELP */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Built for Serious Business Builders</h2>
          <p className="section-subtitle">Whether you're starting out or scaling up, Kno U Kno meets you where you are.</p>
          <div className="card-grid">
            {PEOPLE.map((p) => (
              <div key={p.title} className="feature-card">
                <div className="feature-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HAPPENINGS */}
      <section className="section section-dark">
        <div className="container">
          <h2 className="section-title">Community Happenings</h2>
          <p className="section-subtitle">See what other business builders are doing right now.</p>
          <div className="happenings-feed">
            {HAPPENINGS.map((h, i) => (
              <div key={i} className="happening-item">
                <div className="happening-avatar">{h.initials}</div>
                <div>
                  <div className="happening-text">
                    <strong>{h.name}</strong> {h.text}
                  </div>
                  <div className="happening-time">{h.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="container">
          <h2 className="section-title">Choose Your Level of Depth</h2>
          <p className="section-subtitle">Register first. Free has 5 questions for 3 days. Paid tiers unlock deeper business work.</p>
          <div className="card-grid" style={{ alignItems: 'start' }}>
            {TIERS.map((t) => (
              <div key={t.name} className={`tier-card${t.featured ? ' featured' : ''}`}>
                {t.badge && <div className="tier-badge-top">{t.badge}</div>}
                <div className="tier-name">{t.name}</div>
                <div className="tier-price">
                  ${t.price}<span>{t.period || ' free'}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>
                  {t.questions} questions
                </div>
                <ul>
                  {t.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link to="/register" className={`btn ${t.featured ? 'btn-primary' : 'btn-outline'} btn-block`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="section section-alt" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '1rem' }}>
            Ready to know what you don't know?
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Join thousands of business builders who've used Kno U Kno to build stronger, smarter ventures.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">Create Your Free Account</Link>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Kno U Kno. All rights reserved. &nbsp;·&nbsp; <Link to="/login">Login</Link></p>
      </footer>
    </div>
  );
}
