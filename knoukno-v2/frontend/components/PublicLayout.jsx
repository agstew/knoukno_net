import Head from 'next/head';

import PublicNavbar from './PublicNavbar';

export default function PublicLayout({ title, children }) {
  const year = new Date().getFullYear();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <PublicNavbar />
      {children}
      <footer className="site-footer">
        <section className="container-full footer-shell">
          <div className="container footer-grid">
            <article className="footer-card">
              <h3>KnoUKno.net</h3>
              <p>Business planning and execution workspace for startup teams and growth operators.</p>
            </article>

            <article className="footer-card">
              <h4>Navigation</h4>
              <nav className="footer-links">
                <a href="/">Home</a>
                <a href="/price">Price</a>
                <a href="/login">Login</a>
                <a href="/register">Register</a>
              </nav>
            </article>

            <article className="footer-card">
              <h4>Platform</h4>
              <p>Questions, examples, answers, grading, rating, averages, print, and dashboard workflows.</p>
            </article>
          </div>

          <div className="container footer-legal">
            <span>© {year} KnoUKno.net</span>
            <span>Professional Business Workflow Platform</span>
          </div>
        </section>
      </footer>
    </>
  );
}
