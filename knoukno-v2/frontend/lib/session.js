export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem('knoukno_token') || '';
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('knoukno_token');
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload;
}

export async function fetchCurrentUser() {
  const payload = await apiRequest('/api/auth/me');
  return payload.user;
}
