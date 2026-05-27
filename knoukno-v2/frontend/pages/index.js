import PublicLayout from '../components/PublicLayout';
import { heroImages, homeNarrative } from '../lib/aiContent';

const copySections = homeNarrative.split('\n\n');
const quoteLines = [
  'Start clear. Execute daily. Improve weekly.',
  'Questions create direction. Answers create movement.',
  'A system beats random effort every time.',
  'Business growth follows disciplined decisions.',
  'Margin and trust are built on consistency.',
  'Operate today with the company you want tomorrow.'
];

export default function HomePage() {
  return (
    <PublicLayout title="KnoUKno.net | Home">
      <main className="site-main">
        <section className="container-full copy-band copy-band--hero">
          <div className="container hero-wrap">
            <article className="home-card">
              <h1>KnoUKno.net</h1>
              <p className="home-lead">Business startup and forward-growth execution for industrial, trade, and sales teams.</p>
            </article>
          </div>
        </section>

        {copySections.map((paragraph, index) => (
          <section key={`copy-${index + 1}`} className="container-full copy-band">
            <div className="container">
              <article className={`home-card copy-row${index % 2 ? ' copy-row--flip' : ''}`}>
                <figure className="copy-figure">
                  <img
                    src={heroImages[index % heroImages.length]}
                    alt={`KnoUKno section image ${index + 1}`}
                    loading="lazy"
                    className="copy-image"
                  />
                </figure>

                <div className="copy-content">
                  <blockquote className="copy-quote">“{quoteLines[index % quoteLines.length]}”</blockquote>
                  <p>{paragraph}</p>
                </div>
              </article>
            </div>
          </section>
        ))}
      </main>
    </PublicLayout>
  );
}
