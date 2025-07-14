import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { ThemeType, GeminiModelVersion, CustomColors, EnglishStandardType } from '../types/settings';
import Arrow from '../components/icons/Arrow';
import ThemeSettings from '../components/setting/ThemeSettings';
import ApiSettings from '../components/setting/ApiSettings';
import EnglishStandardSettings from '../components/setting/EnglishStandardSettings';
import DataManagement from '../components/setting/DataManagement';

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
    if (model === 'custom') {
      updateSettings({ geminiModel: model });
    } else {
      updateSettings({ geminiModel: model, customGeminiModel: undefined });
    }
  };

  const handleCustomModelChange = (model: string) => {
    updateSettings({ customGeminiModel: model });
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
      const data = {
        settings: {
          ...settings,
          geminiKey: undefined
        },
        collections: JSON.parse(localStorage.getItem('vocabularyCollections') || '[]'),
        savedVocabulary: JSON.parse(localStorage.getItem('savedVocabulary') || '[]'),
        vocabulary: JSON.parse(localStorage.getItem('vocabulary') || '[]')
      };
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `juliec-backup-${timestamp}.json`;
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
        if (!data || typeof data !== 'object') {
          throw new Error('File không đúng định dạng');
        }
        if (data.settings) {
          const { geminiKey, ...otherSettings } = data.settings;
          try {
            updateSettings(otherSettings);
          } catch (e) {
            console.error('Lỗi khi cập nhật settings:', e);
            hasError = true;
          }
        }
        if (Array.isArray(data.collections)) {
          try {
            localStorage.setItem('vocabularyCollections', JSON.stringify(data.collections));
          } catch (e) {
            console.error('Lỗi khi cập nhật collections:', e);
            hasError = true;
          }
        }
        if (Array.isArray(data.savedVocabulary)) {
          try {
            localStorage.setItem('savedVocabulary', JSON.stringify(data.savedVocabulary));
          } catch (e) {
            console.error('Lỗi khi cập nhật savedVocabulary:', e);
            hasError = true;
          }
        }
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
        <ThemeSettings
          theme={settings.theme}
          customColors={customColors}
          setCustomColors={setCustomColors}
          onThemeChange={handleThemeChange}
          showCustomTheme={showCustomTheme}
          setShowCustomTheme={setShowCustomTheme}
          applyCustomTheme={applyCustomTheme}
        />
        <ApiSettings
          geminiKey={settings.geminiKey}
          showApiKey={showApiKey}
          setShowApiKey={setShowApiKey}
          onApiKeyChange={handleApiKeyChange}
          geminiModel={settings.geminiModel}
          onModelChange={handleModelChange}
          customGeminiModel={settings.customGeminiModel}
          onCustomModelChange={handleCustomModelChange}
        />
        <EnglishStandardSettings
          englishStandard={settings.englishStandard}
          onEnglishStandardChange={handleEnglishStandardChange}
        />
        <DataManagement
          onExportData={handleExportData}
          onImportData={handleImportData}
        />
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