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