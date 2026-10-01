import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Nav from './components/Nav';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Price from './pages/Price';
import Apply from './pages/Apply';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TitleList from './pages/TitleList';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  if (authLoading) return <div className="spinner-wrap"><div className="spinner"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  if (authLoading) return <div className="spinner-wrap"><div className="spinner"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [announcementVisible, setAnnouncementVisible] = useState(() => (
    sessionStorage.getItem('kk-announcement-dismissed') !== 'true'
  ));

  const dismissAnnouncement = () => {
    sessionStorage.setItem('kk-announcement-dismissed', 'true');
    setAnnouncementVisible(false);
  };

  return (
    <div className={`app${announcementVisible ? ' app-with-announcement' : ''}`}>
      {announcementVisible && (
        <aside className="announcement-banner" aria-label="Announcement">
          <p>Start your business with Kno U Kno. Begin your free 3-day trial.</p>
          <Link to="/register" className="announcement-link">Start free</Link>
          <button type="button" className="announcement-dismiss" onClick={dismissAnnouncement} aria-label="Dismiss announcement">
            <X size={18} aria-hidden="true" />
          </button>
        </aside>
      )}
      <Nav />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/price" element={<Price />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/questions" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/title" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/list" element={<ProtectedRoute><TitleList /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}

export default App;
