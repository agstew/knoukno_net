import Link from 'next/link';
import { useState } from 'react';
import PublicLayout from '../components/PublicLayout';

const pricingCards = [
  {
    key: 'free',
    title: 'Free tier 5 QUESTIONS (3 days)',
    ctaLabel: 'Start Free',
    ctaHref: '/register',
    points: [
      'Pagination: 1 - 5 Questions',
      'Title for the Business',
      'questions 5, from questions page',
      'answers 5, from text-area',
      'save page and print page',
      'Price $0 (3 days)',
      'No Bonus'
    ]
  },
  {
    key: 'member',
    title: 'Member Tier',
    ctaLabel: 'Pay Member Tier with PayPal',
    ctaBaseHref: '/plans?plan=member',
    ctaBonusHref: '/plans?plan=memberCombined',
    bonusLabel: 'Add bonus (+100 questions for +$100)',
    points: [
      'Title for the Business',
      'Print page, save page, Grade page, Rate page, average page',
      'Base tier: 50 questions for $39.00',
      'With bonus: 150 questions for $139.00',
      'Click checkbox if you want the bonus added to payment'
    ]
  },
  {
    key: 'pro',
    title: 'Pro Tier',
    ctaLabel: 'Pay Pro Tier with PayPal',
    ctaBaseHref: '/plans?plan=pro',
    ctaBonusHref: '/plans?plan=proCombined',
    bonusLabel: 'Add bonus (+100 questions for +$100)',
    points: [
      'Title for the Business',
      'Print page, Save page, Grade page, Rate page, Average page',
      'Base tier: 75 questions for $436.00',
      'With bonus: 175 questions for $536.00',
      'Click checkbox if you want the bonus added to payment'
    ]
  }
];

export default function PricePage() {
  const [bonusSelection, setBonusSelection] = useState({
    member: true,
    pro: true,
  });

  function toggleBonus(tierKey, checked) {
    setBonusSelection((current) => ({
      ...current,
      [tierKey]: checked,
    }));
  }

  return (
    <PublicLayout title="KnoUKno.net | Price">
      <main className="site-main">
        <section className="container">
          <article className="home-card">
            <h1>Price</h1>
            <p>KnoUKno.net supports Free, Member, and Pro workflows with bonus question packs for heavy execution teams.</p>
            <div className="inline-actions">
              <Link href="/register" className="btn auth-button">Register</Link>
              <Link href="/plans" className="btn auth-button auth-button--secondary">Open PayPal Plans</Link>
            </div>
          </article>
        </section>

        <section className="container section-cards section-cards--three">
          {pricingCards.map((card, index) => (
            <article key={card.title} className="section-card">
              <img src={`https://picsum.photos/seed/price-${index + 1}/900/520`} alt="Pricing tier illustration" loading="lazy" />
              <h2>{card.title}</h2>
              <ul className="price-list">
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {card.bonusLabel ? (
                <label className="bonus-toggle" htmlFor={`bonus-${card.key}`}>
                  <input
                    id={`bonus-${card.key}`}
                    name={`bonus-${card.key}`}
                    type="checkbox"
                    checked={Boolean(bonusSelection[card.key])}
                    onChange={(event) => toggleBonus(card.key, event.target.checked)}
                  />
                  {' '}{card.bonusLabel}
                </label>
              ) : null}

              <div className="price-cta">
                <Link
                  href={card.ctaBaseHref ? (bonusSelection[card.key] ? card.ctaBonusHref : card.ctaBaseHref) : card.ctaHref}
                  className="btn auth-button"
                >
                  {card.ctaBaseHref
                    ? bonusSelection[card.key]
                      ? `${card.ctaLabel} (with Bonus)`
                      : `${card.ctaLabel} (Base)`
                    : card.ctaLabel}
                </Link>
                {card.ctaBaseHref ? <small className="auth-note">Toggle checkbox to include or remove bonus from payment.</small> : null}
              </div>
            </article>
          ))}
        </section>
      </main>
    </PublicLayout>
  );
}
