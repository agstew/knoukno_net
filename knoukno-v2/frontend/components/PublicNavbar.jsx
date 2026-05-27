import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { clearToken } from '../lib/session';

export default function PublicNavbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(Boolean(localStorage.getItem('knoukno_token')));
    }
  }, [router.asPath]);

  function handleLogout() {
    clearToken();
    setIsLoggedIn(false);
    router.push('/login');
  }

  return (
    <header className="site-header">
      <nav className="container nav-row">
        <Link href="/" className="brand-mark">KnoUKno.net</Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/price" className="nav-link">Price</Link>
          <Link href="/login" className="nav-link">Login</Link>
          <Link href="/register" className="nav-link">Register</Link>
          {isLoggedIn ? <Link href="/dashboard" className="nav-link nav-link--dark">Dashboard</Link> : null}
          {isLoggedIn ? <button type="button" className="nav-link nav-link--button" onClick={handleLogout}>Logout</button> : null}
        </div>
      </nav>
    </header>
  );
}
