import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLearning } from '../contexts/LearningContext';
import { GeminiService } from '../services/geminiService';
import { generateReadingPrompt, ReadingTest } from '../data/readingPrompt';
import { generateVocabularyPrompt, VocabularyInfo } from '../data/vocabularyPrompt';
import { readingTopics, Topic } from '../data/readingTopics';
import VocabularyPopup from '../components/VocabularyPopup';
import SelectionPopup from '../components/SelectionPopup';
import Arrow from '../components/icons/Arrow';

interface HighlightInfo {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color: string;
}

const HIGHLIGHT_COLORS = [
  { value: 'yellow', class: 'bg-yellow-200 dark:bg-yellow-500/30' },
  { value: 'green', class: 'bg-green-200 dark:bg-green-500/30' },
  { value: 'blue', class: 'bg-blue-200 dark:bg-blue-500/30' },
  { value: 'pink', class: 'bg-pink-200 dark:bg-pink-500/30' },
  { value: 'purple', class: 'bg-purple-200 dark:bg-purple-500/30' },
];

const ReadingLearn: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { settings } = useSettings();
  const { selectedTopic, setSelectedTopic } = useLearning();
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

  // Thêm state mới cho highlight và selection
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    range: Range | null;
    position: { x: number; y: number };
  } | null>(null);
  const [highlights, setHighlights] = useState<HighlightInfo[]>([]);
  const passageRef = useRef<HTMLDivElement>(null);

  const [selectedHighlight, setSelectedHighlight] = useState<HighlightInfo | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState({ x: 0, y: 0 });
  const [currentColor, setCurrentColor] = useState(HIGHLIGHT_COLORS[0].value);

  // Tìm topic dựa vào topicId từ URL và context
  useEffect(() => {
    if (topicId && !isInitialized) {
      // Đầu tiên kiểm tra trong context
      if (selectedTopic?.id === topicId) {
        setTopic(selectedTopic);
        setIsInitialized(true);
        return;
      }

      // Nếu không có trong context, tìm trong danh sách có sẵn
      const foundTopic = readingTopics.find(t => t.id === topicId);
      
      if (foundTopic) {
        setTopic(foundTopic);
        setSelectedTopic(foundTopic);
      } else if (topicId.startsWith('custom-')) {
        // Nếu là custom topic nhưng không có trong context, quay lại trang chọn topic
        navigate('/learn/reading');
        return;
      } else {
        setError("Topic not found");
        setIsLoading(false);
      }
      setIsInitialized(true);
    }
  }, [topicId, selectedTopic, setSelectedTopic, isInitialized, navigate]);

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
        topic.difficulty,
        settings.englishStandard
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
  }, [topic, settings.geminiKey, settings.geminiModel, settings.englishStandard]);

  // Gọi API chỉ khi topic thay đổi và chưa có readingTest
  useEffect(() => {
    if (topic && isLoading && !readingTest) {
      generateTest();
    }
  }, [topic, generateTest, isLoading, readingTest]);

  // Xử lý khi người dùng bôi đen từ vựng
  const handleTextSelection = useCallback((event: MouseEvent) => {
    // Đóng các menu khác
    setShowHighlightMenu(false);
    setSelectedHighlight(null);

    // Lấy selection hiện tại
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
      setShowSelectionPopup(false);
      setSelectionInfo(null);
      return;
    }

    // Kiểm tra xem selection có thuộc về passage không
    const range = selection.getRangeAt(0);
    const passageElement = passageRef.current;
    if (!passageElement || !passageElement.contains(range.commonAncestorContainer)) {
      setShowSelectionPopup(false);
      setSelectionInfo(null);
      return;
    }

    // Tính toán vị trí popup dựa trên selection range
    const rect = range.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    // Đặt popup ở giữa đoạn text được chọn
    const x = rect.left + (rect.width / 2);
    // Đặt popup phía trên đoạn text, có tính đến scroll
    const y = rect.top + scrollY - 10;

    // Lưu thông tin selection
    setSelectionInfo({
      text: selection.toString().trim(),
      range: range.cloneRange(),
      position: { x, y }
    });
    setShowSelectionPopup(true);
  }, []);

  // Click outside để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Kiểm tra xem click có phải là trên popup hay không
      if (showHighlightMenu && !target.closest('.highlight-menu')) {
        setShowHighlightMenu(false);
        setSelectedHighlight(null);
      }

      // Kiểm tra cho selection popup
      if (showSelectionPopup && !target.closest('.selection-popup')) {
        setShowSelectionPopup(false);
        setSelectionInfo(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHighlightMenu, showSelectionPopup]);

  // Thêm event listener cho việc bôi đen từ vựng
  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [handleTextSelection]);

  // Xử lý dịch từ
  const handleTranslate = useCallback(async () => {
    if (!selectionInfo?.text || !settings.geminiKey) return;

    try {
      setSelectedWord(selectionInfo.text);
      setPopupPosition({
        x: selectionInfo.position.x,
        y: selectionInfo.position.y - window.scrollY // Điều chỉnh vị trí theo scroll
      });
      setIsLoadingVocabulary(true);
      setShowSelectionPopup(false);

      const geminiService = new GeminiService(settings.geminiKey);
      const prompt = generateVocabularyPrompt(selectionInfo.text);
      const vocabInfo = await geminiService.generateVocabularyInfo(prompt, selectionInfo.text);
      
      setVocabularyInfo(vocabInfo);
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
    } finally {
      setIsLoadingVocabulary(false);
      // Clear selection sau khi hoàn thành
      window.getSelection()?.removeAllRanges();
    }
  }, [selectionInfo, settings.geminiKey]);

  // Xử lý highlight
  const handleHighlight = useCallback(() => {
    if (!selectionInfo?.range || !passageRef.current) return;

    try {
      const range = selectionInfo.range;
      const text = range.toString().trim();
      
      // Tính toán offset tương đối với container
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(passageRef.current);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      const start = preCaretRange.toString().length;
      const end = start + text.length;

      // Kiểm tra xem có highlight nào trùng hoặc chồng lấn không
      const hasOverlap = highlights.some(h => {
        // Trường hợp hoàn toàn trùng nhau
        if (h.startOffset === start && h.endOffset === end) {
          return true;
        }
        
        // Trường hợp chồng lấn một phần
        const isOverlapping = (
          (start >= h.startOffset && start < h.endOffset) || // Điểm đầu nằm trong highlight cũ
          (end > h.startOffset && end <= h.endOffset) || // Điểm cuối nằm trong highlight cũ
          (start <= h.startOffset && end >= h.endOffset) // Highlight mới bao trọn highlight cũ
        );
        
        return isOverlapping;
      });

      if (hasOverlap) {
        console.log('Highlight overlaps with existing one');
        return;
      }

      const newHighlight = {
        id: `highlight-${Date.now()}`,
        text: text,
        startOffset: start,
        endOffset: end,
        color: currentColor
      };

      setHighlights(prev => {
        // Sắp xếp highlights theo thứ tự để tránh vấn đề render
        const newHighlights = [...prev, newHighlight].sort((a, b) => a.startOffset - b.startOffset);
        return newHighlights;
      });
      
      setShowSelectionPopup(false);
      setSelectionInfo(null);

      // Clear selection
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error("Error highlighting text:", error);
    }
  }, [selectionInfo, currentColor, highlights]);

  // Xử lý click vào highlight
  const handleHighlightClick = useCallback((highlight: HighlightInfo, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedHighlight(highlight);
    setHighlightMenuPosition({ x: event.clientX, y: event.clientY });
    setShowHighlightMenu(true);
  }, []);

  // Xóa highlight
  const handleDeleteHighlight = useCallback(() => {
    if (!selectedHighlight) return;
    
    setHighlights(prev => prev.filter(h => h.id !== selectedHighlight.id));
    setShowHighlightMenu(false);
    setSelectedHighlight(null);
  }, [selectedHighlight]);

  // Đổi màu highlight
  const handleChangeHighlightColor = useCallback((color: string) => {
    if (!selectedHighlight) return;
    
    console.log('Changing color:', { highlightId: selectedHighlight.id, newColor: color });
    
    setHighlights(prev => {
      const newHighlights = prev.map(h => 
        h.id === selectedHighlight.id ? { ...h, color } : h
      );
      console.log('New highlights:', newHighlights);
      return newHighlights;
    });
    
    setSelectedHighlight(prev => {
      if (!prev) return null;
      const updated = { ...prev, color };
      console.log('Updated selected highlight:', updated);
      return updated;
    });
  }, [selectedHighlight]);

  // Render highlighted text
  const renderHighlightedText = useCallback((text: string) => {
    if (highlights.length === 0) return text;

    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    // Highlights đã được sắp xếp khi thêm vào state
    highlights.forEach((highlight, index) => {
      // Add non-highlighted text before this highlight
      if (highlight.startOffset > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, highlight.startOffset)}
          </span>
        );
      }

      // Add highlighted text
      const highlightColor = HIGHLIGHT_COLORS.find(c => c.value === highlight.color);
      const colorClass = highlightColor ? highlightColor.class : HIGHLIGHT_COLORS[0].class;
      
      parts.push(
        <span
          key={`highlight-${highlight.id}`}
          className={`cursor-pointer ${colorClass}`}
          onClick={(e) => handleHighlightClick(highlight, e)}
          data-highlight-id={highlight.id}
        >
          {text.slice(highlight.startOffset, highlight.endOffset)}
        </span>
      );

      lastIndex = highlight.endOffset;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  }, [highlights, handleHighlightClick]);

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
          ref={passageRef}
          className="mb-8 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]"
        >
          <p className="text-[var(--text-primary)] whitespace-pre-line">
            {readingTest && renderHighlightedText(readingTest.passage)}
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

        {/* Highlight Menu */}
        {showHighlightMenu && selectedHighlight && (
          <div
            className="fixed z-50 bg-[var(--bg-primary)] rounded-lg shadow-lg border border-[var(--border-color)] p-2 highlight-menu"
            style={{
              left: `${highlightMenuPosition.x}px`,
              top: `${highlightMenuPosition.y + 10}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleChangeHighlightColor(color.value)}
                    className={`w-6 h-6 rounded-full ${color.class} border border-gray-300 
                      ${selectedHighlight.color === color.value ? 'ring-2 ring-blue-500' : ''}
                      hover:ring-2 hover:ring-blue-300 transition-all`}
                    title={color.value}
                  />
                ))}
              </div>
              <button
                onClick={handleDeleteHighlight}
                className="flex items-center gap-2 px-3 py-1 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-red-500"
              >
                <span role="img" aria-label="delete" className="text-sm">
                  🗑️
                </span>
                <span className="text-sm">Xóa</span>
              </button>
            </div>
          </div>
        )}

        {/* Selection Popup */}
        {showSelectionPopup && selectionInfo && (
          <div className="selection-popup">
            <SelectionPopup
              position={selectionInfo.position}
              onTranslate={handleTranslate}
              onHighlight={handleHighlight}
            />
          </div>
        )}

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
    </div>
  );
};

export default ReadingLearn; 