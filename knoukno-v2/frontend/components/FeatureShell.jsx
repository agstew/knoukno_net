import Head from 'next/head';

import MemberShell from './MemberShell';
import { useProtectedPage } from '../lib/useProtectedPage';

export default function FeatureShell({ title, children }) {
  const { user, loading } = useProtectedPage();

  return (
    <>
      <Head>
        <title>{title} | KnoUKno.net</title>
      </Head>

      <MemberShell title={title} user={user}>
        {loading ? <div className="auth-card">Loading...</div> : null}
        {!loading && user ? children : null}
      </MemberShell>
    </>
  );
}
