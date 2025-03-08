import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const ThemeToggle: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors shadow-lg"
      aria-label="Toggle theme"
    >
      <div className="text-xl">
        {settings.theme === 'light' ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

export default ThemeToggle; 