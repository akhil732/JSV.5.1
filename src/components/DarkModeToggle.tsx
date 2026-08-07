import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const DarkModeToggle: React.FC = () => {
  const { isDark, setMode } = useTheme();

  const handleToggle = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        w-10 h-10 rounded-full
        flex items-center justify-center
        transition-all duration-300
        focus-ring
        ${isDark
          ? 'bg-ds-surface-variant hover:bg-ds-surface-container text-ds-primary'
          : 'bg-ds-surface hover:bg-ds-surface-variant text-ds-primary'
        }
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Moon className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default DarkModeToggle;
