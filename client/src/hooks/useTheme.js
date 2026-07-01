import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('resumeintel_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove both, then add the correct one
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    try {
      localStorage.setItem('resumeintel_theme', theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle, isDark: theme === 'dark' };
}
