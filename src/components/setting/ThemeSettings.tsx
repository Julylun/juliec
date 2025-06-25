import React, { useState } from 'react';
import { ThemeType, CustomColors } from '../../types/settings';

interface ThemeSettingsProps {
  theme: ThemeType;
  customColors: CustomColors;
  setCustomColors: (colors: CustomColors) => void;
  onThemeChange: (theme: ThemeType) => void;
  showCustomTheme: boolean;
  setShowCustomTheme: (show: boolean) => void;
  applyCustomTheme: () => void;
}

const THEME_OPTIONS: { id: ThemeType; name: string; icon: string; }[] = [
  { id: 'light', name: 'Sáng', icon: '☀️' },
  { id: 'dark', name: 'Tối', icon: '🌙' },
  { id: 'mint', name: 'Bạc hà', icon: '🌿' },
  { id: 'lavender', name: 'Oải hương', icon: '💜' },
  { id: 'peach', name: 'Đào', icon: '🍑' },
  { id: 'sky', name: 'Biển', icon: '🌊' },
  { id: 'custom', name: 'Tùy chỉnh', icon: '🎨' }
];

const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  theme,
  customColors,
  setCustomColors,
  onThemeChange,
  showCustomTheme,
  setShowCustomTheme,
  applyCustomTheme
}) => {
  const handleCustomColorChange = (colorKey: keyof CustomColors, value: string) => {
    setCustomColors({
      ...customColors,
      [colorKey]: value
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Giao diện</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {THEME_OPTIONS.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => onThemeChange(themeOption.id)}
            className={`p-4 rounded-lg border transition-colors ${theme === themeOption.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
              }`}
          >
            <div className="flex items-center justify-center">
              <div className="text-xl mr-2">{themeOption.icon}</div>
              <span className="text-[var(--text-primary)]">{themeOption.name}</span>
            </div>
          </button>
        ))}
      </div>
      {showCustomTheme && (
        <div className="mt-4 space-y-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">Tùy chỉnh màu sắc</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['primary', 'secondary', 'accent', 'background', 'text'] as (keyof CustomColors)[]).map((colorKey) => (
              <div key={colorKey}>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  {colorKey === 'primary' && 'Màu chính'}
                  {colorKey === 'secondary' && 'Màu phụ'}
                  {colorKey === 'accent' && 'Màu nhấn'}
                  {colorKey === 'background' && 'Màu nền'}
                  {colorKey === 'text' && 'Màu chữ'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColors[colorKey]}
                    onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors[colorKey]}
                    onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowCustomTheme(false)}
              className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              Hủy
            </button>
            <button
              onClick={applyCustomTheme}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Áp dụng
            </button>
          </div>
          <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
              Xem trước
            </h4>
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: customColors.background,
                color: customColors.text,
                border: `1px solid ${customColors.secondary}`
              }}
            >
              <div className="flex gap-2 mb-2">
                <button
                  style={{
                    backgroundColor: customColors.primary,
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem'
                  }}
                >
                  Nút chính
                </button>
                <button
                  style={{
                    backgroundColor: customColors.accent,
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem'
                  }}
                >
                  Nút nhấn
                </button>
              </div>
              <p style={{ color: customColors.text }}>
                Văn bản mẫu với{' '}
                <span style={{ color: customColors.primary }}>màu chính</span> và{' '}
                <span style={{ color: customColors.secondary }}>màu phụ</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings; 