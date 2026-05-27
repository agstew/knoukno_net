import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { clearToken } from '../lib/session';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/plans', label: 'Plans' },
  { href: '/clients', label: 'Clients' },
  { href: '/profile', label: 'Profile' },
];

export default function MemberShell({ title, user, children }) {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <main className="member-shell">
      <section className="member-layout">
        <aside className="member-sidebar">
          <Image src="/image_3583b72.png" alt="Kno U Kno" width={156} height={172} className="member-logo" priority />
          <nav className="member-nav">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`member-link${router.pathname === item.href ? ' member-link--active' : ''}`}>
                {item.label}
              </Link>
            ))}
            {user?.role === 'admin' ? (
              <Link href="/admin" className={`member-link${router.pathname === '/admin' ? ' member-link--active' : ''}`}>
                Admin
              </Link>
            ) : null}
          </nav>
          <div className="member-user">
            <span>{user?.name || 'Member'}</span>
            <span>{user?.plan || 'registered'}</span>
          </div>
          <button className="btn auth-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <section className="member-content">
          <section className="content-header">
            <h1>{title}</h1>
            <span>{user?.email || ''}</span>
          </section>
          {children}
        </section>
      </section>
    </main>
  );
}
