import { useCallback, useEffect, useState } from 'react';

const KEY = 'kk_active_title';

/** Remembers which business title the inside pages (Dashboard, Grade, Rated, Average) are working on. */
export function useActiveTitle() {
  const [titleId, setTitleId] = useState(() => localStorage.getItem(KEY) || null);
  const [titleName, setTitleName] = useState(() => localStorage.getItem(`${KEY}_name`) || '');

  const select = useCallback((id, name = '') => {
    if (id) {
      localStorage.setItem(KEY, id);
      localStorage.setItem(`${KEY}_name`, name);
    } else {
      localStorage.removeItem(KEY);
      localStorage.removeItem(`${KEY}_name`);
    }
    setTitleId(id);
    setTitleName(name);
  }, []);

  useEffect(() => {
    const sync = () => setTitleId(localStorage.getItem(KEY) || null);
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return { titleId, titleName, select };
}
