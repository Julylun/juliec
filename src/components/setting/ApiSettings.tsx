import React, { useState } from 'react';
import { GeminiModelVersion } from '../../types/settings';
import { GeminiService } from '../../services/geminiService';

interface ApiSettingsProps {
  geminiKey: string;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  onApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  geminiModel: GeminiModelVersion;
  onModelChange: (model: GeminiModelVersion) => void;
}

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

const ApiSettings: React.FC<ApiSettingsProps> = ({
  geminiKey,
  showApiKey,
  setShowApiKey,
  onApiKeyChange,
  geminiModel,
  onModelChange
}) => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestApiKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await GeminiService.testApiKey(geminiKey);
      setTestResult(result.message);
    } catch (e) {
      setTestResult('Lỗi không xác định khi kiểm tra API key.');
    }
    setTesting(false);
  };

  return (
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
              value={geminiKey}
              onChange={onApiKeyChange}
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
                onClick={() => onModelChange(model.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${geminiModel === model.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                  }`}
              >
                <div className="font-medium text-[var(--text-primary)]">{model.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">{model.description}</div>
              </button>
            ))}
            <button
              onClick={handleTestApiKey}
              disabled={testing || !geminiKey}
              className={`p-2 bg-[var(--border-color)] rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] ${testing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {testing ? 'Đang kiểm tra...' : 'Test API Key'}
            </button>
          </div>
          {testResult && (
            <div className="mt-2 text-sm" style={{ color: testResult.includes('hợp lệ') ? 'green' : 'red' }}>
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiSettings; 