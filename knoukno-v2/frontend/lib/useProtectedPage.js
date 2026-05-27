import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { clearToken, fetchCurrentUser, getToken } from './session';

export function useProtectedPage(options = {}) {
  const { requiredRole, redirectOnForbidden = true } = options;
  const router = useRouter();
  const nextPath = encodeURIComponent(router.asPath || '/dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace(`/login?next=${nextPath}`);
      return;
    }

    fetchCurrentUser()
      .then((currentUser) => {
        if (requiredRole && currentUser.role !== requiredRole) {
          setForbidden(true);
          if (redirectOnForbidden) {
            router.replace('/dashboard');
          }
          return;
        }

        setUser(currentUser);
      })
      .catch(() => {
        clearToken();
        router.replace(`/login?next=${nextPath}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [nextPath, redirectOnForbidden, requiredRole, router]);

  return { user, loading, setUser, forbidden };
}
