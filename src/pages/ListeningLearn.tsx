import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLearning } from '../contexts/LearningContext';
import { listeningTopics } from '../data/listeningTopics';
import { ListeningTopic } from '../types/topics';
import Arrow from '../components/icons/Arrow';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface ListeningExercise {
  audioUrl: string;
  transcript: string;
  questions: Question[];
}

const ListeningLearn: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { settings } = useSettings();
  const { selectedTopic, setSelectedTopic } = useLearning();
  const [topic, setTopic] = useState<ListeningTopic | null>(null);
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const currentTopic = listeningTopics.find(t => t.id === topicId);
    if (currentTopic) {
      setTopic(currentTopic);
      setSelectedTopic(currentTopic);
      
      // TODO: Fetch actual exercise data
      setExercise({
        audioUrl: '/path/to/audio.mp3',
        transcript: 'This is a sample transcript of the audio...',
        questions: [
          {
            id: 1,
            text: 'What is the main topic of the conversation?',
            options: [
              'Business meeting',
              'Project deadline',
              'Office relocation',
              'Budget planning'
            ],
            correctAnswer: 2
          },
          {
            id: 2,
            text: 'When will the project be completed?',
            options: [
              'Next week',
              'Next month',
              'In two months',
              'By the end of the year'
            ],
            correctAnswer: 1
          }
        ]
      });
    }
  }, [topicId, setSelectedTopic]);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerIndex
      }));
    }
  };

  const handleSubmit = () => {
    if (!exercise) return;
    
    let correctAnswers = 0;
    exercise.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const calculatedScore = Math.round((correctAnswers / exercise.questions.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);
  };

  const getAnswerClass = (questionId: number, answerIndex: number) => {
    if (!isSubmitted) {
      return selectedAnswers[questionId] === answerIndex
        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
        : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]';
    }

    const question = exercise?.questions.find(q => q.id === questionId);
    if (!question) return '';

    if (question.correctAnswer === answerIndex) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-500';
    }
    if (selectedAnswers[questionId] === answerIndex) {
      return 'bg-red-100 dark:bg-red-900/30 border-red-500';
    }
    return 'border-[var(--border-color)] opacity-50';
  };

  if (!topic || !exercise) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-primary)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/learn/listening')}
              className="p-2 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label="Quay lại"
            >
              <Arrow className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Listening Practice</h1>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {topic.title}
            </h2>
          </div>
        </div>
        <div className="h-px w-full bg-[var(--border-color)] opacity-30"></div>
      </div>

      {/* Score display when submitted */}
      {isSubmitted && (
        <div className={`sticky top-[64px] z-30 w-full bg-[var(--bg-primary)] p-4 border-b ${
          score >= 80 ? 'bg-green-100/50 dark:bg-green-900/20 border-green-500' : 
          score >= 60 ? 'bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-500' : 
          'bg-red-100/50 dark:bg-red-900/20 border-red-500'
        }`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Điểm: {score}/100
            </h2>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* Audio Player */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Audio Player
            </h3>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-blue-500 hover:text-blue-600"
            >
              {showTranscript ? 'Ẩn transcript' : 'Hiện transcript'}
            </button>
          </div>
          
          <audio
            ref={audioRef}
            src={exercise.audioUrl}
            controls
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {showTranscript && (
            <div className="mt-4 p-4 bg-[var(--bg-primary)] rounded border border-[var(--border-color)]">
              <p className="text-[var(--text-primary)]">{exercise.transcript}</p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {exercise.questions.map((question) => (
            <div key={question.id} className="space-y-4">
              <p className="text-[var(--text-primary)]">
                {question.id}. {question.text}
              </p>
              <div className="space-y-2 pl-6">
                {question.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg border transition-all ${
                      getAnswerClass(question.id, index)
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={selectedAnswers[question.id] === index}
                      onChange={() => handleAnswerSelect(question.id, index)}
                      className="w-4 h-4 text-blue-500"
                      disabled={isSubmitted}
                    />
                    <span className="text-[var(--text-primary)]">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== exercise.questions.length}
              className={`px-6 py-2 rounded-lg transition-colors ${
                Object.keys(selectedAnswers).length === exercise.questions.length
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              Nộp bài
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningLearn; 