import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { ThemeType, GeminiModelVersion, CustomColors, EnglishStandardType } from '../types/settings';
import Arrow from '../components/icons/Arrow';

const THEME_OPTIONS: { id: ThemeType; name: string; icon: string; }[] = [
  { id: 'light', name: 'Sáng', icon: '☀️' },
  { id: 'dark', name: 'Tối', icon: '🌙' },
  { id: 'mint', name: 'Bạc hà', icon: '🌿' },
  { id: 'lavender', name: 'Oải hương', icon: '💜' },
  { id: 'peach', name: 'Đào', icon: '🍑' },
  { id: 'sky', name: 'Biển', icon: '🌊' },
  { id: 'custom', name: 'Tùy chỉnh', icon: '🎨' }
];

const GEMINI_MODELS: { id: GeminiModelVersion; name: string; description: string; }[] = [
  { 
    id: 'gemini-2.0-flash', 
    name: 'Gemini Flash', 
    description: 'Phiên bản nhanh và nhẹ, phù hợp cho hầu hết các tác vụ'
  },
  { 
    id: 'gemini-2.0-flash-lite', 
    name: 'Gemini Flash Lite', 
    description: 'Phiên bản siêu nhẹ, tối ưu cho thiết bị yếu'
  },
  { 
    id: 'gemini-2.0-pro-exp-02-05', 
    name: 'Gemini Pro', 
    description: 'Phiên bản cao cấp với độ chính xác cao nhất (có thể bị giới hạn quota)'
  }
];

const ENGLISH_STANDARDS: { id: EnglishStandardType; name: string; description: string; isBeta?: boolean; }[] = [
  { 
    id: 'toeic', 
    name: 'TOEIC', 
    description: 'Test of English for International Communication - Phù hợp cho môi trường làm việc'
  },
  { 
    id: 'ielts', 
    name: 'IELTS', 
    description: 'International English Language Testing System - Tiêu chuẩn quốc tế cho du học, định cư',
    isBeta: true
  },
  { 
    id: 'cefr', 
    name: 'CEFR', 
    description: 'Common European Framework of Reference - Khung tham chiếu ngôn ngữ chung của châu Âu',
    isBeta: true
  }
];

const DEFAULT_CUSTOM_COLORS: CustomColors = {
  primary: '#3B82F6', // blue-500
  secondary: '#6B7280', // gray-500
  accent: '#10B981', // emerald-500
  background: '#FFFFFF', // white
  text: '#111827', // gray-900
};

const Setting: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [customColors, setCustomColors] = useState<CustomColors>(
    settings.customColors || DEFAULT_CUSTOM_COLORS
  );

  const handleThemeChange = (theme: ThemeType) => {
    if (theme === 'custom') {
      setShowCustomTheme(true);
    } else {
      updateSettings({ theme });
      setShowCustomTheme(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ geminiKey: e.target.value });
  };

  const handleModelChange = (model: GeminiModelVersion) => {
    updateSettings({ geminiModel: model });
  };

  const handleEnglishStandardChange = (standard: EnglishStandardType) => {
    updateSettings({ englishStandard: standard });
  };

  const handleCustomColorChange = (colorKey: keyof CustomColors, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const applyCustomTheme = () => {
    updateSettings({
      theme: 'custom',
      customColors
    });
  };

  const handleExportData = () => {
    try {
      // Thu thập tất cả dữ liệu cần xuất
      const data = {
        settings: {
          ...settings,
          geminiKey: undefined // Không xuất API key vì lý do bảo mật
        },
        collections: JSON.parse(localStorage.getItem('vocabularyCollections') || '[]'),
        savedVocabulary: JSON.parse(localStorage.getItem('savedVocabulary') || '[]'),
        vocabulary: JSON.parse(localStorage.getItem('vocabulary') || '[]')
      };

      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `juliec-backup-${timestamp}.json`;

      // Tạo và tải file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Xuất dữ liệu thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất dữ liệu:', error);
      alert('Có lỗi khi xuất dữ liệu. Vui lòng thử lại.');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        let hasError = false;

        // Kiểm tra cấu trúc dữ liệu
        if (!data || typeof data !== 'object') {
          throw new Error('File không đúng định dạng');
        }

        // Cập nhật settings (trừ API key)
        if (data.settings) {
          const { geminiKey, ...otherSettings } = data.settings;
          try {
            updateSettings(otherSettings);
          } catch (e) {
            console.error('Lỗi khi cập nhật settings:', e);
            hasError = true;
          }
        }

        // Cập nhật collections
        if (Array.isArray(data.collections)) {
          try {
            localStorage.setItem('vocabularyCollections', JSON.stringify(data.collections));
          } catch (e) {
            console.error('Lỗi khi cập nhật collections:', e);
            hasError = true;
          }
        }

        // Cập nhật savedVocabulary
        if (Array.isArray(data.savedVocabulary)) {
          try {
            localStorage.setItem('savedVocabulary', JSON.stringify(data.savedVocabulary));
          } catch (e) {
            console.error('Lỗi khi cập nhật savedVocabulary:', e);
            hasError = true;
          }
        }

        // Cập nhật vocabulary
        if (Array.isArray(data.vocabulary)) {
          try {
            localStorage.setItem('vocabulary', JSON.stringify(data.vocabulary));
          } catch (e) {
            console.error('Lỗi khi cập nhật vocabulary:', e);
            hasError = true;
          }
        }

        if (hasError) {
          alert('Nhập dữ liệu thành công một phần. Một số dữ liệu có thể bị lỗi.');
        } else {
          alert('Nhập dữ liệu thành công! Trang sẽ được tải lại để áp dụng các thay đổi.');
          window.location.reload();
        }
      } catch (error) {
        console.error('Lỗi khi nhập dữ liệu:', error);
        alert('Có lỗi khi nhập dữ liệu. Vui lòng kiểm tra file và thử lại.');
      }
    };

    reader.onerror = () => {
      alert('Có lỗi khi đọc file. Vui lòng thử lại.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label="Quay lại"
            >
              <Arrow className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Cài đặt</h1>
          </div>
        </div>
        <div className="h-px w-full bg-[var(--border-color)] opacity-30"></div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-8 pt-4">
        {/* Theme Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Giao diện</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  settings.theme === theme.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                }`}
              >
                <div className="flex items-center justify-center">
                  <div className="text-xl mr-2">{theme.icon}</div>
                  <span className="text-[var(--text-primary)]">{theme.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Theme Settings */}
          {showCustomTheme && (
            <div className="mt-4 space-y-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
              <h3 className="text-lg font-medium text-[var(--text-primary)]">Tùy chỉnh màu sắc</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Màu chính
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Màu phụ
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Màu nhấn
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Màu nền
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Màu chữ
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColors.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                    />
                  </div>
                </div>
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

        {/* API Settings */}
        <div className="mb-8 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">API Key</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[var(--text-secondary)] mb-2">
                Gemini API Key:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.geminiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Nhập API key của bạn..."
                  className="flex-1 p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                API key được sử dụng để dịch và tạo từ vựng tự động.{' '}
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Lấy API key
                </a>
              </p>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-2">
                Model:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {GEMINI_MODELS.map(model => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      settings.geminiModel === model.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                    }`}
                  >
                    <div className="font-medium text-[var(--text-primary)]">{model.name}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{model.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* English Standard Settings */}
        <div className="mb-8 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Tiêu chuẩn tiếng Anh</h2>
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Chọn tiêu chuẩn tiếng Anh bạn muốn sử dụng để học và luyện tập
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ENGLISH_STANDARDS.map(standard => (
                <button
                  key={standard.id}
                  onClick={() => handleEnglishStandardChange(standard.id)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    settings.englishStandard === standard.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                  }`}
                >
                  <div className="font-medium text-[var(--text-primary)] flex items-center">
                    {standard.name}
                    {standard.isBeta && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded">
                        Beta
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">{standard.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-8 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Quản lý dữ liệu</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleExportData}
                className="w-full p-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-primary)] hover:border-[var(--text-secondary)] transition-colors"
              >
                Xuất dữ liệu
              </button>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Tải xuống tất cả dữ liệu của bạn dưới dạng file JSON
              </p>
            </div>

            <div>
              <label className="w-full">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <div className="w-full p-3 rounded-lg border border-[var(--border-color)] text-center text-[var(--text-primary)] bg-[var(--bg-primary)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer">
                  Nhập dữ liệu
                </div>
              </label>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Nhập dữ liệu từ file JSON đã xuất trước đó
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="w-full p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting; 