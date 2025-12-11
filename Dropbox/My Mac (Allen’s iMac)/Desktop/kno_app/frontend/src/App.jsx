import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import QuestionsPage from './QuestionsPage';
import EditQuestionPage from './EditQuestionPage';
import NotFound from './NotFound';
import './App.css';
import { ToastProvider } from './Toast';
import { useEffect } from 'react';
import { setCsrfToken } from './api';

export default function App() {
  useEffect(() => {
    // Fetch and cache CSRF token on app load so UI requests work immediately
    (async () => {
      try {
        // Determine runtime API base so we don't hit the static preview host
        let base = '';
        try {
          if (typeof window !== 'undefined') {
            const port = window.location.port;
            if (port && port !== '' && port !== '3000') base = 'http://localhost:3000';
          }
        } catch (e) {
          base = '';
        }

        const res = await fetch(base + '/auth/csrf-token', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.csrfToken) setCsrfToken(data.csrfToken);
      } catch (e) {
        // ignore — ensureCsrf will fetch lazily on demand
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
      <header className="app-header">
        <div className="brand">Kno U Kno</div>
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/about">About</Link>
          <Link to="/price">Price</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <div className="home-card">
                <h1>Kno U Kno</h1>
                <p>
                  Kno U Kno helps professionals transition into business by asking
                  structured questions, grading responses, and providing actionable
                  insights. Answer targeted prompts, get graded feedback, and see
                  aggregated ratings to identify strengths and opportunities as you
                  prepare to start or grow your business.
                </p>
              </div>
            }
          />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/questions/:id/edit" element={<EditQuestionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/about" element={<div style={{ padding: 20 }}>About page (placeholder)</div>} />
          <Route path="/price" element={<div style={{ padding: 20 }}>Price page (placeholder)</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      </ToastProvider>
    </BrowserRouter>
  );
}
