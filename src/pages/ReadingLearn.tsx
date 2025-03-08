import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLearning } from '../contexts/LearningContext';
import { GeminiService } from '../services/geminiService';
import { generateReadingPrompt, ReadingTest } from '../data/readingPrompt';
import { generateVocabularyPrompt, VocabularyInfo } from '../data/vocabularyPrompt';
import { readingTopics, Topic } from '../data/readingTopics';
import VocabularyPopup from '../components/VocabularyPopup';
import Arrow from '../components/icons/Arrow';

const ReadingLearn: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { settings } = useSettings();
  const { setSelectedTopic } = useLearning();
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [readingTest, setReadingTest] = useState<ReadingTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(0);
  
  // State cho từ điển popup
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [vocabularyInfo, setVocabularyInfo] = useState<VocabularyInfo | null>(null);
  const [isLoadingVocabulary, setIsLoadingVocabulary] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [savedVocabulary, setSavedVocabulary] = useState<VocabularyInfo[]>([]);

  // Tìm topic dựa vào topicId từ URL - chỉ chạy một lần khi component mount
  useEffect(() => {
    if (topicId && !isInitialized) {
      const foundTopic = readingTopics.find(t => t.id === topicId);
      
      if (foundTopic) {
        setTopic(foundTopic);
        setSelectedTopic(foundTopic); // Cập nhật context
      } else {
        setError("Topic not found");
        setIsLoading(false);
      }
      setIsInitialized(true);
    }
  }, [topicId, setSelectedTopic, isInitialized]);

  // Memoize hàm generateTest để tránh tạo lại mỗi khi render
  const generateTest = useCallback(async () => {
    if (!topic || !settings.geminiKey) {
      setError("Missing topic or API key");
      setIsLoading(false);
      return;
    }

    try {
      const geminiService = new GeminiService(settings.geminiKey, settings.geminiModel);
      const prompt = generateReadingPrompt(
        topic.title,
        topic.difficulty
      );

      const test = await geminiService.generateReadingTest(
        prompt, 
        topic.title
      );
      
      if (test) {
        setReadingTest(test);
        setError(null);
      } else {
        setError("Failed to generate test");
      }
    } catch (err) {
      setError("Error generating test: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [topic, settings.geminiKey, settings.geminiModel]);

  // Gọi API chỉ khi topic thay đổi và chưa có readingTest
  useEffect(() => {
    if (topic && isLoading && !readingTest) {
      generateTest();
    }
  }, [topic, generateTest, isLoading, readingTest]);

  // Xử lý khi người dùng bôi đen từ vựng
  const handleTextSelection = useCallback(async (event: MouseEvent) => {
    // Kiểm tra xem sự kiện có phải từ button, input, hoặc các phần tử tương tác khác không
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' || 
      target.tagName === 'INPUT' || 
      target.tagName === 'LABEL' ||
      target.closest('button') ||
      target.closest('label') ||
      target.closest('input')
    ) {
      return; // Không xử lý nếu click vào các phần tử tương tác
    }

    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;
    
    // Sử dụng vị trí con trỏ chuột thay vì vị trí selection
    const selectedText = selection.toString().trim();
    if (selectedText.split(' ').length > 3) return; // Giới hạn tối đa 3 từ
    
    setSelectedWord(selectedText);
    setPopupPosition({ 
      x: event.clientX, 
      y: event.clientY 
    });
    setIsLoadingVocabulary(true);
    setVocabularyInfo(null);
    
    if (settings.geminiKey) {
      try {
        const geminiService = new GeminiService(settings.geminiKey);
        const prompt = generateVocabularyPrompt(selectedText);
        
        const vocabInfo = await geminiService.generateVocabularyInfo(prompt, selectedText);
        setVocabularyInfo(vocabInfo);
      } catch (err) {
        console.error("Error fetching vocabulary:", err);
      } finally {
        setIsLoadingVocabulary(false);
      }
    } else {
      setIsLoadingVocabulary(false);
    }
  }, [settings.geminiKey]);

  // Thêm event listener cho việc bôi đen từ vựng
  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      handleTextSelection(event);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleTextSelection]);

  const handleClosePopup = () => {
    setSelectedWord(null);
    setVocabularyInfo(null);
  };

  const handleSaveVocabulary = (vocab: VocabularyInfo) => {
    setSavedVocabulary(prev => [...prev, vocab]);
    // Có thể lưu vào localStorage hoặc database ở đây
    localStorage.setItem('savedVocabulary', JSON.stringify([...savedVocabulary, vocab]));
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: optionIndex
      }));
    }
  };

  const handleSubmit = () => {
    if (!readingTest) return;
    
    let correctCount = 0;
    readingTest.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / readingTest.questions.length) * 100);
    setUserScore(finalScore);
    setIsSubmitted(true);
  };

  const getAnswerClass = (questionId: number, optionIndex: number) => {
    if (!isSubmitted) return "border-[var(--border-color)] border-opacity-40 hover:border-opacity-70";
    
    const question = readingTest?.questions.find(q => q.id === questionId);
    if (!question) return "border-[var(--border-color)] border-opacity-40";
    
    if (question.correctAnswer === optionIndex) {
      return "bg-green-100 dark:bg-green-900/20 border-green-500 border-opacity-60";
    } else if (selectedAnswers[questionId] === optionIndex) {
      return "bg-red-100 dark:bg-red-900/20 border-red-500 border-opacity-60";
    }
    
    return "border-[var(--border-color)] border-opacity-40";
  };

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="text-red-500 mb-4">Topic not found</div>
        <button
          onClick={() => navigate('/learn/reading')}
          className="p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)]"
        >
          Quay lại chọn topic
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="text-[var(--text-primary)]">Đang tạo bài đọc...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/learn/reading')}
          className="p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)]"
        >
          Quay lại chọn topic
        </button>
      </div>
    );
  }

  if (!readingTest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="text-[var(--text-primary)] mb-4">
          Không thể tải bài đọc. Vui lòng thử lại.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)] mb-4"
        >
          Tải lại trang
        </button>
        <button
          onClick={() => navigate('/learn/reading')}
          className="p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)]"
        >
          Quay lại chọn topic
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/learn')}
              className="p-2 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label="Quay lại"
            >
              <Arrow className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">JULIEC</h1>
          </div>
        </div>
        <div className="h-px w-full bg-[var(--border-color)] opacity-30"></div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-8 pt-4">
        {/* Score display when submitted */}
        {isSubmitted && (
          <div className={`mb-6 p-4 rounded-lg border ${
            userScore >= 70 ? 'bg-green-100 dark:bg-green-900/20 border-green-500' : 
            userScore >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500' : 
            'bg-red-100 dark:bg-red-900/20 border-red-500'
          }`}>
            <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
              Kết quả: {userScore}%
            </h2>
            <p className="text-[var(--text-secondary)]">
              Bạn đã trả lời đúng {readingTest.questions.filter(q => 
                selectedAnswers[q.id] === q.correctAnswer
              ).length}/{readingTest.questions.length} câu hỏi
            </p>
          </div>
        )}

        {/* Topic Title */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {topic.title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Bôi đen từ vựng bất kỳ trong bài đọc để xem nghĩa
          </p>
        </div>

        {/* Reading Passage */}
        <div 
          className="mb-8 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]"
        >
          <p className="text-[var(--text-primary)] whitespace-pre-line">
            {readingTest.passage}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">Question:</h3>
          {readingTest.questions.map((question) => (
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
              
              {/* Explanation after submission */}
              {isSubmitted && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-[var(--text-primary)] text-sm">
                    <span className="font-semibold">Giải thích:</span> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < readingTest.questions.length}
              className={`flex-1 p-4 rounded-lg transition-colors ${
                Object.keys(selectedAnswers).length < readingTest.questions.length
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <div className="flex items-center justify-center">
                <div className="text-xl mr-2">✅</div>
                <span>Chấm điểm</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/learn/reading')}
              className="flex-1 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors"
            >
              <div className="flex items-center justify-center">
                <div className="text-xl mr-2">📚</div>
                <span className="text-[var(--text-primary)]">Chọn topic khác</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Vocabulary Popup */}
      {selectedWord && (
        <VocabularyPopup
          word={selectedWord}
          position={popupPosition}
          onClose={handleClosePopup}
          vocabularyInfo={vocabularyInfo}
          isLoading={isLoadingVocabulary}
        />
      )}
    </div>
  );
};

export default ReadingLearn; 