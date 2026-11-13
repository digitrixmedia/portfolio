import { useState, useEffect, useCallback } from 'react';

export function useAppRouter() {
  const [pathname, setPathname] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, replace = false) => {
    const normalized = to.startsWith('/') ? to : `/${to}`;
    if (window.location.pathname === normalized) return;
    if (replace) {
      window.history.replaceState({}, '', normalized);
    } else {
      window.history.pushState({}, '', normalized);
    }
    setPathname(normalized);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return { pathname, navigate };
}
