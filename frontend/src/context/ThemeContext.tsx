import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tracex_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'light'; // Default Light Mode as requested
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('tracex_theme', theme);
  }, [theme]);

  // Global Keyboard Shortcut listener (Ctrl + Shift + D or Alt + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when typing in input fields or textareas
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      // Shortcut combinations: Ctrl+Shift+D, Cmd+Shift+D, or Alt+D
      const isCtrlShiftD = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'd');
      const isAltD = e.altKey && (e.key.toLowerCase() === 'd');

      if (isCtrlShiftD || isAltD) {
        e.preventDefault();
        setThemeState((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          showToast(`Theme switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode (Ctrl+Shift+D)`);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme, toggleTheme }}>
      {children}

      {/* Global Shortcut Keyboard Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[99999] bg-slate-900/95 text-white border border-teal-500/50 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
