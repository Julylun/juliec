import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLearning } from '../contexts/LearningContext';
import { listeningTopics } from '../data/listeningTopics';
import { ListeningTopic } from '../types/topics';

const Listening: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { setSelectedTopic } = useLearning();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedTopic, setLocalSelectedTopic] = useState<ListeningTopic | null>(null);
  const [showCustomTopicModal, setShowCustomTopicModal] = useState(false);
  const [customTopicTitle, setCustomTopicTitle] = useState('');
  const [customTopicDifficulty, setCustomTopicDifficulty] = useState<ListeningTopic['difficulty']>('medium');

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    return listeningTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleStartLearning = () => {
    if (localSelectedTopic) {
      setSelectedTopic(localSelectedTopic);
      navigate(`/learn/listening/${localSelectedTopic.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)]">Listening Practice</h1>
          <p className="text-[var(--text-secondary)]">Luyện tập nghe với các bài nghe TOEIC</p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
          />
        </div>

        {/* Topics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setLocalSelectedTopic(topic)}
              className={`p-4 rounded-lg transition-all ${
                localSelectedTopic?.id === topic.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)]'
              }`}
            >
              <h3 className={`text-lg font-semibold ${
                localSelectedTopic?.id === topic.id ? 'text-white' : 'text-[var(--text-primary)]'
              }`}>
                {topic.title}
              </h3>
              <p className={`text-sm mt-1 ${
                localSelectedTopic?.id === topic.id ? 'text-white/80' : 'text-[var(--text-secondary)]'
              }`}>
                {topic.description}
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${
                  localSelectedTopic?.id === topic.id ? 'text-white/80' : 'text-[var(--text-secondary)]'
                }`}>
                  Độ khó: {topic.difficulty}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation buttons */}
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

export default Listening; 