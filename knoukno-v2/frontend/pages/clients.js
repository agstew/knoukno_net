import Head from 'next/head';
import Image from 'next/image';

import MemberShell from '../components/MemberShell';
import { useProtectedPage } from '../lib/useProtectedPage';

const clientSections = [
  'Registered account setup',
  'Business start checklist',
  'Single-image client handoff',
];

export default function ClientsPage() {
  const { user, loading } = useProtectedPage();

  return (
    <>
      <Head>
        <title>Clients | Kno U Kno</title>
      </Head>

      <MemberShell title="Clients" user={user}>
        {loading ? <div className="auth-card">Loading...</div> : null}
        {!loading && user ? (
          <section className="panel-grid">
            <article className="auth-card image-card">
              <Image src="/image_3583b72.png" alt="Client entry" width={280} height={312} className="client-image" />
            </article>
            <article className="auth-card stacked-list">
              {clientSections.map((item) => (
                <section key={item} className="section-row">
                  <span>{item}</span>
                </section>
              ))}
            </article>
          </section>
        ) : null}
      </MemberShell>
    </>
  );
}
