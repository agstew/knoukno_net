import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearTokens, getRefreshToken, setTokens } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      setEntitlements(data.entitlements);
    } catch (err) {
      // A server hiccup must not sign the member out — only a rejected session does.
      if (err.status === 401) {
        clearTokens();
        setUser(null);
        setEntitlements(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getRefreshToken()) loadMe();
    else setLoading(false);
  }, [loadMe]);

  // Tier/quota changes (admin override, payment) land in the DB immediately;
  // re-check on focus so an open tab picks them up without a logout.
  useEffect(() => {
    const onFocus = () => {
      if (getRefreshToken()) loadMe();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [loadMe]);

  const register = useCallback(async (payload) => {
    const data = await api.post('/auth/register', payload, { auth: false });
    setTokens({ accessToken: data.accessToken });
    setUser(data.user);
    await loadMe();
    return data.user;
  }, [loadMe]);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password }, { auth: false });
    setTokens({ accessToken: data.accessToken });
    setUser(data.user);
    await loadMe();
    return data.user;
  }, [loadMe]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* the local session is cleared either way */
    }
    clearTokens();
    setUser(null);
    setEntitlements(null);
  }, []);

  const value = useMemo(
    () => ({ user, entitlements, loading, register, login, logout, refresh: loadMe }),
    [user, entitlements, loading, register, login, logout, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
