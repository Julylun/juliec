import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { ThemeType, GeminiModelVersion } from '../types/settings';
import Arrow from '../components/icons/Arrow';

const THEME_OPTIONS: { id: ThemeType; name: string; icon: string; }[] = [
  { id: 'light', name: 'Sáng', icon: '☀️' },
  { id: 'dark', name: 'Tối', icon: '🌙' },
  { id: 'mint', name: 'Bạc hà', icon: '🌿' },
  { id: 'lavender', name: 'Oải hương', icon: '💜' },
  { id: 'peach', name: 'Đào', icon: '🍑' },
  { id: 'sky', name: 'Biển', icon: '🌊' }
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

const APP_VERSION = '0.1';

const Setting: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleThemeChange = (theme: ThemeType) => {
    updateSettings({ theme });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ geminiKey: e.target.value });
  };

  const handleModelChange = (model: GeminiModelVersion) => {
    updateSettings({ geminiModel: model });
  };

  const handleExportData = () => {
    try {
      const data = {
        settings: {
          ...settings,
          geminiKey: undefined // Không xuất API key
        },
        vocabulary: JSON.parse(localStorage.getItem('vocabulary') || '[]'),
        savedVocabulary: JSON.parse(localStorage.getItem('savedVocabulary') || '[]')
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'juliec-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Có lỗi khi xuất dữ liệu');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Cập nhật settings (trừ API key)
        if (data.settings) {
          const { geminiKey, ...otherSettings } = data.settings;
          updateSettings(otherSettings);
        }

        // Cập nhật vocabulary
        if (data.vocabulary) {
          localStorage.setItem('vocabulary', JSON.stringify(data.vocabulary));
        }

        // Cập nhật savedVocabulary
        if (data.savedVocabulary) {
          localStorage.setItem('savedVocabulary', JSON.stringify(data.savedVocabulary));
        }

        alert('Nhập dữ liệu thành công');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Có lỗi khi nhập dữ liệu');
      }
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
        </div>

        {/* API Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Gemini AI</h2>
          
          {/* API Key Input */}
          <div className="space-y-2 mb-6">
            <label className="block text-[var(--text-secondary)]">API Key</label>
            <div className="flex">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.geminiKey || ''}
                onChange={handleApiKeyChange}
                placeholder="Nhập Gemini API Key"
                className="flex-1 p-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="ml-2 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              API key được sử dụng để tạo bài đọc và tra từ điển. Bạn có thể lấy API key tại{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                đây
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-[var(--text-secondary)] mb-2">Phiên bản Gemini</label>
            <div className="space-y-2">
              {GEMINI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    settings.geminiModel === model.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-[var(--text-primary)]">{model.name}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{model.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Quản lý dữ liệu</h2>
          <div className="flex gap-4">
            <button
              onClick={handleExportData}
              className="flex-1 p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-colors"
            >
              <div className="flex items-center justify-center">
                <div className="text-xl mr-2">📤</div>
                <span className="text-[var(--text-primary)]">Xuất dữ liệu</span>
              </div>
            </button>
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <div className="flex items-center justify-center p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer">
                <div className="text-xl mr-2">📥</div>
                <span className="text-[var(--text-primary)]">Nhập dữ liệu</span>
              </div>
            </label>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Xuất dữ liệu để sao lưu hoặc chuyển sang thiết bị khác. API key sẽ không được xuất ra.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setting; 