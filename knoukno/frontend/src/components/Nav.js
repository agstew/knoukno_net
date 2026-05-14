import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { isAuthenticated, isAdmin, user, logout, tier } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const tierLabel = tier === 'pro' ? 'Pro' : tier === 'members' ? 'Members' : 'Free';
  const tierClass = tier === 'pro' ? 'pro' : tier === 'members' ? 'members' : '';

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          Kno<span>U</span>Kno
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/about" className={isActive('/about')}>About</Link>
          <Link to="/price" className={isActive('/price')}>Pricing</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                Dashboard
                {tierClass && (
                  <span className={`nav-tier-badge ${tierClass}`}>{tierLabel}</span>
                )}
              </Link>
              {isAdmin && (
                <Link to="/admin" className={isActive('/admin')}>Admin</Link>
              )}
              <button
                className="nav-link btn-nav"
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.45rem 1rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.92rem', color: '#2c3e50' }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/register" className="nav-link btn-nav">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
