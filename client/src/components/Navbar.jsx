import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const OUTSIDE_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
  { to: '/price', label: 'Price' },
];

const INSIDE_LINKS = [
  { to: '/title', label: 'Title' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/questions', label: 'Questions' },
  { to: '/grade', label: 'Grade' },
  { to: '/rated', label: 'Rated' },
  { to: '/average', label: 'Average' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user
    ? user.role === 'admin'
      ? [...INSIDE_LINKS, { to: '/admin', label: 'Admin' }]
      : INSIDE_LINKS
    : OUTSIDE_LINKS;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark kk-navbar sticky-top no-print">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to={user ? '/dashboard' : '/'}>
          <img src="/img/logo-mark.svg" alt="" width="36" height="36" />
          Kno U <span>Kno</span>
        </NavLink>

        <button
          id="nav-toggle"
          name="nav-toggle"
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#kkNav"
          aria-controls="kkNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="kkNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink className="nav-link" to={link.to} end={link.end}>
                  {link.label}
                </NavLink>
              </li>
            ))}

            {user ? (
              <li className="nav-item ms-lg-3">
                <button id="logout" name="logout" type="button" className="btn btn-gold btn-sm px-3" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            ) : (
              <li className="nav-item ms-lg-3">
                <NavLink className="btn btn-gold btn-sm px-3" to="/register">
                  Start free
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
