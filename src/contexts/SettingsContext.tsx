import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings, DEFAULT_SETTINGS, ThemeType, CustomColors } from '../types/settings';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface ThemeColors {
  bgPrimary: string;
  textPrimary: string;
  bgSecondary: string;
  borderColor: string;
  textSecondary: string;
}

const THEME_COLORS: Record<Exclude<ThemeType, 'custom'>, ThemeColors> = {
  light: {
    bgPrimary: '#ffffff',
    textPrimary: '#000000',
    bgSecondary: '#f3f4f6',
    borderColor: '#e5e7eb',
    textSecondary: '#6b7280'
  },
  dark: {
    bgPrimary: '#1a1a1a',
    textPrimary: '#ffffff',
    bgSecondary: '#2d2d2d',
    borderColor: '#404040',
    textSecondary: '#9ca3af'
  },
  mint: {
    bgPrimary: '#f0faf4',
    textPrimary: '#065f46',
    bgSecondary: '#d1fae5',
    borderColor: '#a7f3d0',
    textSecondary: '#047857'
  },
  lavender: {
    bgPrimary: '#f5f3ff',
    textPrimary: '#5b21b6',
    bgSecondary: '#ede9fe',
    borderColor: '#ddd6fe',
    textSecondary: '#7c3aed'
  },
  peach: {
    bgPrimary: '#fff7ed',
    textPrimary: '#c2410c',
    bgSecondary: '#fed7aa',
    borderColor: '#ffedd5',
    textSecondary: '#ea580c'
  },
  sky: {
    bgPrimary: '#f0f9ff',
    textPrimary: '#0369a1',
    bgSecondary: '#e0f2fe',
    borderColor: '#bae6fd',
    textSecondary: '#0284c7'
  }
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (settings.theme === 'custom' && settings.customColors) {
      // Áp dụng màu sắc tùy chỉnh
      document.documentElement.style.setProperty('--bg-primary', settings.customColors.background);
      document.documentElement.style.setProperty('--text-primary', settings.customColors.text);
      document.documentElement.style.setProperty('--bg-secondary', settings.customColors.secondary);
      document.documentElement.style.setProperty('--border-color', settings.customColors.secondary);
      document.documentElement.style.setProperty('--text-secondary', settings.customColors.secondary);
      document.documentElement.style.setProperty('--primary-color', settings.customColors.primary);
      document.documentElement.style.setProperty('--accent-color', settings.customColors.accent);
    } else if (settings.theme !== 'custom') {
      // Áp dụng theme có sẵn
      const themeColors = THEME_COLORS[settings.theme];
      document.documentElement.style.setProperty('--bg-primary', themeColors.bgPrimary);
      document.documentElement.style.setProperty('--text-primary', themeColors.textPrimary);
      document.documentElement.style.setProperty('--bg-secondary', themeColors.bgSecondary);
      document.documentElement.style.setProperty('--border-color', themeColors.borderColor);
      document.documentElement.style.setProperty('--text-secondary', themeColors.textSecondary);
    }
  }, [settings.theme, settings.customColors]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}; 