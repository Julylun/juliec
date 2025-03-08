import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLearning } from '../contexts/LearningContext';
import { readingTopics, Topic } from '../data/readingTopics';

const Reading: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { setSelectedTopic } = useLearning();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedTopic, setLocalSelectedTopic] = useState<Topic | null>(null);
  const [showCustomTopicModal, setShowCustomTopicModal] = useState(false);
  const [customTopicTitle, setCustomTopicTitle] = useState('');
  const [customTopicDifficulty, setCustomTopicDifficulty] = useState<Topic['difficulty']>('medium');

  console.log("Reading page rendering");

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    return readingTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleStartLearning = () => {
    if (localSelectedTopic) {
      console.log("Setting selected topic in context:", localSelectedTopic);
      setSelectedTopic(localSelectedTopic);
      
      // Chuyển hướng đến trang học với topicId trong URL
      console.log("Navigating to learning page with topicId:", localSelectedTopic.id);
      navigate(`/learn/reading/${localSelectedTopic.id}`);
    }
  };

  const handleCreateCustomTopic = () => {
    if (!customTopicTitle.trim()) return;

    const customTopic: Topic = {
      id: `custom-${Date.now()}`,
      title: customTopicTitle,
      description: 'Custom topic created by user',
      difficulty: customTopicDifficulty,
      questionsCount: 4
    };

    setLocalSelectedTopic(customTopic);
    setSelectedTopic(customTopic);
    setShowCustomTopicModal(false);
    navigate(`/learn/reading/${customTopic.id}`);
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Reading Topics</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Select a topic to practice TOEIC reading skills
        </p>

        {/* Search bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search topics..."
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
                Tự tạo chủ đề bài đọc theo ý muốn
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
                <span className="text-[var(--text-secondary)]">
                  {topic.questionsCount} questions
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

export default Reading; 