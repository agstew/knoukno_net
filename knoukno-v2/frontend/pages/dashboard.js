import Head from 'next/head';
import Link from 'next/link';
import MemberShell from '../components/MemberShell';
import { useProtectedPage } from '../lib/useProtectedPage';

export default function DashboardPage() {
  const { user, loading } = useProtectedPage();
  const toolLinks = [
    '/Title',
    '/List',
    '/Questions',
    '/Example',
    '/Answers',
    '/Grade',
    '/GradeList',
    '/Rated',
    '/RatedList',
    '/Average',
    '/AverageList',
    '/Print'
  ];

  return (
    <>
      <Head>
        <title>Dashboard | Kno U Kno</title>
      </Head>

      <MemberShell title="Dashboard" user={user}>
        {loading ? <div className="auth-card">Loading...</div> : null}
        {!loading && user ? (
          <section className="panel-grid">
            <article className="auth-card dashboard-card">
              <div className="dashboard-grid">
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span>{user.plan}</span>
              </div>
            </article>
            <article className="auth-card dashboard-card">
              <div className="dashboard-grid">
                <span>Registered-only access</span>
                <span>Plans and PayPal flow</span>
                <span>Client start section</span>
              </div>
            </article>
            <article className="auth-card">
              <h3>Frontend Pages</h3>
              <div className="link-grid">
                {toolLinks.map((href) => (
                  <Link key={href} href={href} className="member-link">{href.replace('/', '')}</Link>
                ))}
              </div>
            </article>
          </section>
        ) : null}
      </MemberShell>
    </>
  );
}

