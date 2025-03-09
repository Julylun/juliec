import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLearning } from '../contexts/LearningContext';
import { translateTopics, Topic } from '../data/translateTopics';
import { GeminiService } from '../services/geminiService';

const Translate: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { setSelectedTopic } = useLearning();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedTopic, setLocalSelectedTopic] = useState<Topic | null>(null);
  const [showCustomTopicModal, setShowCustomTopicModal] = useState(false);
  const [customTopicTitle, setCustomTopicTitle] = useState('');
  const [customTopicDifficulty, setCustomTopicDifficulty] = useState<Topic['difficulty']>('medium');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [translateDirection, setTranslateDirection] = useState<'en-vi' | 'vi-en'>('en-vi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("Translate page rendering");

  // Kiểm tra xem tiêu chuẩn hiện tại có phải là beta không
  const isCurrentStandardBeta = settings.englishStandard === 'ielts' || settings.englishStandard === 'cefr';

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    return translateTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleStartLearning = () => {
    if (localSelectedTopic) {
      console.log("Setting selected topic in context:", localSelectedTopic);
      setSelectedTopic(localSelectedTopic);
      
      // Chuyển hướng đến trang học với topicId trong URL
      console.log("Navigating to translate page with topicId:", localSelectedTopic.id);
      navigate(`/learn/translate/${localSelectedTopic.id}`);
    }
  };

  const handleCreateCustomTopic = () => {
    if (!customTopicTitle.trim()) return;

    const customTopic: Topic = {
      id: `custom-${Date.now()}`,
      title: customTopicTitle,
      description: 'Custom topic created by user',
      difficulty: customTopicDifficulty
    };

    setLocalSelectedTopic(customTopic);
    setSelectedTopic(customTopic);
    setShowCustomTopicModal(false);
    navigate(`/learn/translate/${customTopic.id}`);
  };

  const getDifficultyColor = (difficulty: Topic['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-[var(--text-secondary)]';
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || !settings.geminiKey) return;
    
    setIsTranslating(true);
    setError(null);
    
    try {
      const geminiService = new GeminiService(settings.geminiKey, settings.geminiModel);
      
      // Tạo prompt với tiêu chuẩn tiếng Anh từ cài đặt
      const prompt = `
You are a professional English-Vietnamese translator specializing in ${settings.englishStandard.toUpperCase()} standards.
Please translate the following ${translateDirection === 'en-vi' ? 'English text to Vietnamese' : 'Vietnamese text to English'}.
The translation should be accurate, natural, and maintain the original meaning and tone.

${translateDirection === 'en-vi' 
  ? `For this TOEIC/IELTS/CEFR translation, pay special attention to:
- Correct terminology according to ${settings.englishStandard.toUpperCase()} standards
- Appropriate register and formality
- Natural expression in the target language`
  : `When translating to English, ensure:
- Appropriate vocabulary for ${settings.englishStandard.toUpperCase()} level
- Correct grammar and natural phrasing
- Equivalent expressions that sound natural to native speakers`
}

Text to translate:
"""
${inputText}
"""

Provide only the translation without any additional comments or explanations.`;
      
      const translatedText = await geminiService.generateContent(prompt);
      
      if (translatedText) {
        setOutputText(translatedText);
      } else {
        setError("Không thể dịch văn bản. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Lỗi khi dịch: " + (err as Error).message);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Translation Practice</h1>
        <p className="text-[var(--text-secondary)] mb-8 flex items-center">
          Select a topic to practice {settings.englishStandard.toUpperCase()} translation skills
          {isCurrentStandardBeta && (
            <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded">
              Beta
            </span>
          )}
        </p>

        {/* Search bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Tìm kiếm chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
          />
        </div>

        {/* Topics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Custom Topic Button */}
          <button
            onClick={() => setShowCustomTopicModal(true)}
            className="p-4 rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-primary)]">
              <span className="text-3xl mb-2">✨</span>
              <h3 className="text-xl font-semibold">Tạo chủ đề mới</h3>
              <p className="text-[var(--text-secondary)] text-center mt-2">
                Tự tạo chủ đề bài dịch theo ý muốn
              </p>
            </div>
          </button>

          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => {
                console.log("Topic selected:", topic);
                setLocalSelectedTopic(topic);
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                localSelectedTopic?.id === topic.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)]'
              }`}
            >
              <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
                {topic.title}
                {topic.id === 'random' && ' 🎲'}
              </h3>
              <p className="text-[var(--text-secondary)] mb-4">{topic.description}</p>
              <div className="flex justify-between text-sm">
                <span className={getDifficultyColor(topic.difficulty)}>
                  {topic.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Topic Modal */}
        {showCustomTopicModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                Tạo chủ đề mới
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-2">
                    Tên chủ đề:
                  </label>
                  <input
                    type="text"
                    value={customTopicTitle}
                    onChange={(e) => setCustomTopicTitle(e.target.value)}
                    placeholder="Nhập tên chủ đề..."
                    className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-2">
                    Độ khó:
                  </label>
                  <select
                    value={customTopicDifficulty}
                    onChange={(e) => setCustomTopicDifficulty(e.target.value as Topic['difficulty'])}
                    className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowCustomTopicModal(false)}
                    className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateCustomTopic}
                    disabled={!customTopicTitle.trim()}
                    className={`px-4 py-2 rounded-lg ${
                      customTopicTitle.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Tạo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/learn')}
            className="flex-1 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors"
          >
            <div className="flex items-center justify-center">
              <div className="text-xl mr-2">🔙</div>
              <span className="text-[var(--text-primary)]">Quay lại</span>
            </div>
          </button>
          <button
            onClick={handleStartLearning}
            disabled={!localSelectedTopic}
            className={`flex-1 p-4 rounded-lg transition-colors ${
              localSelectedTopic
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center justify-center">
              <div className="text-xl mr-2">🚀</div>
              <span>Bắt đầu học</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Translate; 