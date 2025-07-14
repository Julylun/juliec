import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { GeminiService } from '../services/geminiService';

const TutorAgent: React.FC = () => {
  const { settings } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestPrompt = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const res = await gemini.generateContent(prompt);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)]">Tutor Agent 🤖</h1>
        <p className="text-[var(--text-secondary)]">Tạo agent lên lịch trình học tập cá nhân hóa cho bạn</p>
      </div>
      <div className="w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 shadow">
        <p className="text-[var(--text-primary)] mb-4">
          Tính năng này sẽ giúp bạn tạo một agent AI để lên kế hoạch học tập TOEIC cá nhân hóa dựa trên mục tiêu, thời gian và trình độ của bạn.
        </p>
        <div className="mb-4">
          <label className="block mb-2 text-[var(--text-primary)] font-semibold">Test prompt với AI:</label>
          <textarea
            className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            rows={4}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Nhập prompt để test với AI..."
          />
          <button
            className="mt-2 px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
            onClick={handleTestPrompt}
            disabled={loading || !prompt.trim()}
          >
            {loading ? 'Đang gửi...' : 'Gửi prompt'}
          </button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-[var(--text-primary)] whitespace-pre-wrap">
            <strong>Kết quả AI:</strong>
            <div>{result}</div>
          </div>
        )}
        <div className="text-center text-[var(--text-secondary)] italic mt-6">
          (Tính năng đang phát triển...)
        </div>
      </div>
    </div>
  );
};

export default TutorAgent; 