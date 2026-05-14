import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      logout();
      navigate('/', { replace: true });
    }, 900);
    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div className="loading-page">
      <div className="spinner" />
      <p>Logging you out…</p>
    </div>
  );
}
