import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLearning } from '../contexts/LearningContext';
import { useVocabulary } from '../contexts/VocabularyContext';
import { GeminiService } from '../services/geminiService';
import { generateTranslatePrompt, generateFeedbackPrompt, TranslateText, TranslationFeedback } from '../data/translatePrompt';
import { generateVocabularyPrompt, VocabularyInfo } from '../data/vocabularyPrompt';
import { translateTopics } from '../data/translateTopics';
import { TranslateTopic } from '../types/topics';
import VocabularyPopup from '../components/VocabularyPopup';
import SelectionPopup from '../components/SelectionPopup';
import SpeakButton from '../components/SpeakButton';
import Arrow from '../components/icons/Arrow';

interface ErrorHighlight {
  original: string;
  suggestion: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
  errorType?: 'error' | 'suggestion';
  englishText?: string;
}

interface SelectionInfo {
  text: string;
  range: Range | null;
  position: { x: number; y: number };
}

const TranslateLearn: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { settings } = useSettings();
  const { selectedTopic, setSelectedTopic } = useLearning();
  const [translateText, setTranslateText] = useState<TranslateText | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<TranslateTopic | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State cho bản dịch của người dùng
  const [userTranslation, setUserTranslation] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<TranslationFeedback | null>(null);
  
  // State cho từ điển popup
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [vocabularyInfo, setVocabularyInfo] = useState<VocabularyInfo | null>(null);
  const [isLoadingVocabulary, setIsLoadingVocabulary] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // State cho selection popup
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const passageRef = useRef<HTMLDivElement>(null);

  // Tìm topic dựa vào topicId từ URL và context
  useEffect(() => {
    if (topicId && !isInitialized) {
      // Đầu tiên kiểm tra trong context
      if (selectedTopic?.id === topicId) {
        setTopic(selectedTopic as TranslateTopic);
        setIsInitialized(true);
        return;
      }

      // Nếu không có trong context, tìm trong danh sách có sẵn
      const foundTopic = translateTopics.find(t => t.id === topicId);
      
      if (foundTopic) {
        setTopic(foundTopic);
        setSelectedTopic(foundTopic);
      } else if (topicId.startsWith('custom-')) {
        // Nếu là custom topic nhưng không có trong context, quay lại trang chọn topic
        navigate('/learn/translate');
        return;
      } else {
        setError("Topic not found");
        setIsLoading(false);
      }
      setIsInitialized(true);
    }
  }, [topicId, selectedTopic, setSelectedTopic, isInitialized, navigate]);

  // Memoize hàm generateTranslateText để tránh tạo lại mỗi khi render
  const generateTranslateText = useCallback(async () => {
    if (!topic || !settings.geminiKey) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const geminiService = new GeminiService(settings.geminiKey, settings.geminiModel);
      const prompt = generateTranslatePrompt(
        topic.title, 
        topic.difficulty,
        settings.englishStandard
      );
      
      const result = await geminiService.generateTranslateText(prompt, topic.title);
      
      if (result) {
        setTranslateText(result);
      } else {
        setError("Failed to generate translate text");
      }
    } catch (err) {
      setError("Error generating translate text: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [topic, settings.geminiKey, settings.geminiModel, settings.englishStandard]);

  // Gọi API chỉ khi topic thay đổi và chưa có translateText
  useEffect(() => {
    if (topic && isLoading && !translateText) {
      generateTranslateText();
    }
  }, [topic, generateTranslateText, isLoading, translateText]);

  // Xử lý khi người dùng submit bản dịch
  const handleSubmit = async () => {
    if (!translateText || !userTranslation.trim() || !settings.geminiKey) return;
    
    setIsEvaluating(true);
    
    try {
      const geminiService = new GeminiService(settings.geminiKey, settings.geminiModel);
      const prompt = generateFeedbackPrompt(
        translateText.passage,
        userTranslation,
        settings.englishStandard
      );
      
      const result = await geminiService.evaluateTranslation(
        prompt,
        translateText.passage,
        userTranslation
      );
      
      if (result) {
        console.log("Feedback từ API:", result);
        console.log("Số lỗi được phát hiện:", result.errors?.length);
        console.log("Chi tiết các lỗi:", result.errors);
        console.log("Tiêu chuẩn tiếng Anh:", settings.englishStandard);
        
        // Đảm bảo mỗi lỗi đều có englishText
        if (result.errors && result.errors.length > 0) {
          result.errors = result.errors.map(error => {
            if (!error.englishText || error.englishText.trim() === '') {
              // Nếu không có englishText, gán một đoạn văn bản mặc định
              error.englishText = translateText.passage.substring(0, 100) + "...";
            }
            return error;
          });
        }
        
        setFeedback(result);
        setIsSubmitted(true);
      } else {
        setError("Failed to evaluate translation");
      }
    } catch (err) {
      setError("Error evaluating translation: " + (err as Error).message);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Xử lý khi người dùng muốn dịch lại
  const handleRetry = () => {
    setIsSubmitted(false);
    setFeedback(null);
  };

  // Xử lý khi người dùng bôi đen từ vựng
  const handleTextSelection = useCallback((event: MouseEvent) => {
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
      
      // Kiểm tra cho selection popup
      if (showSelectionPopup && !target.closest('.selection-popup')) {
        setShowSelectionPopup(false);
        setSelectionInfo(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelectionPopup]);

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

  const handleClosePopup = () => {
    setSelectedWord(null);
    setVocabularyInfo(null);
  };

  // Xử lý sự kiện click cho nút phát âm
  const handleSpeakClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Render textarea với highlight lỗi
  const renderTextareaWithHighlights = () => {
    if (!isSubmitted || !feedback) {
      return (
        <textarea
          ref={textareaRef}
          value={userTranslation}
          onChange={(e) => setUserTranslation(e.target.value)}
          placeholder="Nhập bản dịch tiếng Việt của bạn ở đây..."
          className="w-full h-full min-h-[300px] p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] resize-none"
          disabled={isSubmitted}
        />
      );
    }

    // Hiển thị bản dịch không có highlight
    return (
      <div className="w-full h-full min-h-[300px] p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] overflow-auto whitespace-pre-wrap">
        {userTranslation}
      </div>
    );
  };

  // Render văn bản tiếng Anh với highlight
  const renderHighlightedEnglishText = () => {
    if (!translateText || !isSubmitted || !feedback || !feedback.errors || feedback.errors.length === 0) {
      return (
        <div className="flex items-start gap-2">
          <p className="text-[var(--text-primary)] whitespace-pre-line flex-1">
            {translateText?.passage}
          </p>
          {translateText?.passage && (
            <SpeakButton 
              text={translateText.passage} 
              lang="en-US" 
              size="md" 
              onClick={handleSpeakClick}
            />
          )}
        </div>
      );
    }

    console.log("Đang render văn bản với highlight");
    console.log("Số lỗi:", feedback.errors.length);
    
    // Tạo map để đánh dấu các đoạn cần highlight
    const highlightMap = new Map<string, ErrorHighlight[]>();
    
    // Thêm các đoạn cần highlight vào map
    feedback.errors.forEach((error, index) => {
      if (error.englishText && error.englishText.trim() !== '') {
        const englishText = error.englishText.trim();
        console.log(`Lỗi ${index + 1} - englishText:`, englishText);
        
        if (!highlightMap.has(englishText)) {
          highlightMap.set(englishText, []);
        }
        highlightMap.get(englishText)?.push(error);
      } else {
        console.log(`Lỗi ${index + 1} không có englishText`);
      }
    });
    
    console.log("Số đoạn cần highlight:", highlightMap.size);

    // Nếu không có đoạn nào cần highlight, trả về văn bản gốc
    if (highlightMap.size === 0) {
      return (
        <div className="flex items-start gap-2">
          <p className="text-[var(--text-primary)] whitespace-pre-line flex-1">
            {translateText.passage}
          </p>
          {translateText.passage && (
            <SpeakButton 
              text={translateText.passage} 
              lang="en-US" 
              size="md" 
              onClick={handleSpeakClick}
            />
          )}
        </div>
      );
    }

    // Tạo các phần highlight
    const parts: React.ReactNode[] = [];
    let remainingText = translateText.passage;
    let lastIndex = 0;

    // Tìm và highlight các đoạn văn
    Array.from(highlightMap.keys()).forEach((englishText, index) => {
      const errors = highlightMap.get(englishText) || [];
      const startIndex = remainingText.indexOf(englishText, lastIndex);
      
      if (startIndex !== -1) {
        // Thêm văn bản trước đoạn cần highlight
        if (startIndex > lastIndex) {
          parts.push(
            <span key={`text-${index}`}>
              {remainingText.substring(lastIndex, startIndex)}
            </span>
          );
        }

        // Xác định loại lỗi và màu sắc tương ứng
        const hasError = errors.some(e => e.errorType === 'error');
        const highlightClass = hasError 
          ? "bg-red-200 dark:bg-red-900/30" 
          : "bg-yellow-200 dark:bg-yellow-900/30";
        
        // Thêm phần highlight
        parts.push(
          <span
            key={`highlight-${index}`}
            className={`${highlightClass} relative group cursor-help`}
          >
            {englishText}
            <div 
              className="fixed transform -translate-x-1/2 left-1/2 top-1/4 w-[90%] max-w-md p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50"
            >
              <div className="flex justify-between items-start mb-2">
                <p className={`font-semibold ${hasError ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {hasError ? 'Lỗi:' : 'Đề xuất cải thiện:'}
                </p>
                <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2 py-1 rounded">
                  Đoạn {index + 1}/{highlightMap.size}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="font-semibold text-[var(--text-secondary)] text-xs">Văn bản tiếng Anh:</p>
                <p className="text-[var(--text-primary)] p-2 bg-[var(--bg-primary)] rounded border border-[var(--border-color)] text-sm">{englishText}</p>
              </div>
              
              {errors.map((error, errorIndex) => (
                <div key={errorIndex} className="mb-3 border-t border-[var(--border-color)] pt-2 mt-2">
                  <div className="mb-2">
                    <p className="font-semibold text-[var(--text-secondary)] text-xs">Bản dịch hiện tại:</p>
                    <p className="text-[var(--text-primary)] p-2 bg-[var(--bg-primary)] rounded border border-[var(--border-color)] text-sm">{error.original}</p>
                  </div>
                  <div className="mb-2">
                    <p className="font-semibold text-green-600 dark:text-green-400 text-xs">Đề xuất:</p>
                    <p className="text-[var(--text-primary)] p-2 bg-[var(--bg-primary)] rounded border border-[var(--border-color)] text-sm">{error.suggestion}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-secondary)] text-xs">Giải thích:</p>
                    <p className="text-[var(--text-primary)] p-2 bg-[var(--bg-primary)] rounded border border-[var(--border-color)] text-sm whitespace-pre-wrap">{error.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </span>
        );

        lastIndex = startIndex + englishText.length;
      }
    });

    // Thêm phần văn bản còn lại
    if (lastIndex < remainingText.length) {
      parts.push(
        <span key="text-end">
          {remainingText.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div className="flex items-start gap-2">
        <p className="text-[var(--text-primary)] whitespace-pre-line flex-1">
          {parts}
        </p>
        {translateText.passage && (
          <SpeakButton 
            text={translateText.passage} 
            lang="en-US" 
            size="md" 
            onClick={handleSpeakClick}
          />
        )}
      </div>
    );
  };

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="text-red-500 mb-4">Topic not found</div>
        <button
          onClick={() => navigate('/learn/translate')}
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
        <div className="text-[var(--text-primary)]">Đang tạo bài dịch...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/learn/translate')}
          className="p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)]"
        >
          Quay lại chọn topic
        </button>
      </div>
    );
  }

  if (!translateText) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="text-[var(--text-primary)] mb-4">
          Không thể tải bài dịch. Vui lòng thử lại.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)] mb-4"
        >
          Tải lại trang
        </button>
        <button
          onClick={() => navigate('/learn/translate')}
          className="p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)]"
        >
          Quay lại chọn topic
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-primary)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
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
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {topic.title}
            </h2>
          </div>
        </div>
        <div className="h-px w-full bg-[var(--border-color)] opacity-30"></div>
      </div>

      {/* Score display when submitted */}
      {isSubmitted && feedback && (
        <div className={`sticky top-[64px] z-30 w-full bg-[var(--bg-primary)] p-4 border-b ${
          feedback.score >= 80 ? 'bg-green-100/50 dark:bg-green-900/20 border-green-500' : 
          feedback.score >= 60 ? 'bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-500' : 
          'bg-red-100/50 dark:bg-red-900/20 border-red-500'
        }`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Điểm: {feedback.score}/100
            </h2>
            <p className="text-[var(--text-secondary)]">
              {feedback.feedback}
            </p>
          </div>
        </div>
      )}

      {/* Split Screen Content */}
      <div className="flex-grow flex flex-col min-[700px]:flex-row">
        {/* Left/Top Panel - Original Text */}
        <div className="w-full min-[700px]:w-1/2 h-[50vh] min-[700px]:h-[calc(100vh-64px)] overflow-auto p-4 border-b min-[700px]:border-b-0 min-[700px]:border-r border-[var(--border-color)]">
          <div className="sticky top-0 left-0 right-0 bg-[var(--bg-primary)] py-2 z-5 mb-2 border-b border-[var(--border-color)] pb-2">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Văn bản gốc</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Bôi đen từ vựng bất kỳ để xem nghĩa và lưu vào thư viện
            </p>
          </div>
          <div 
            ref={passageRef}
            className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]"
          >
            {renderHighlightedEnglishText()}
          </div>
        </div>

        {/* Right/Bottom Panel - Translation Input */}
        <div className="w-full min-[700px]:w-1/2 h-[50vh] min-[700px]:h-[calc(100vh-64px)] flex flex-col overflow-hidden">
          <div className="p-4 flex-grow flex flex-col">
            <div className="sticky top-0 left-0 right-0 bg-[var(--bg-primary)] py-2 z-5 mb-2 border-b border-[var(--border-color)] pb-2">
              <h3 className="text-lg font-medium text-[var(--text-primary)]">Bản dịch của bạn</h3>
            </div>
            <div className="flex-grow">
              {renderTextareaWithHighlights()}
            </div>
          </div>

          {/* Fixed Bottom Action Buttons */}
          <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
            <div className="flex gap-4">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!userTranslation.trim() || isEvaluating}
                  className={`flex-1 p-4 rounded-lg transition-colors ${
                    !userTranslation.trim() || isEvaluating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="text-xl mr-2">{isEvaluating ? '⏳' : '✅'}</div>
                    <span>{isEvaluating ? 'Đang đánh giá...' : 'Đánh giá bản dịch'}</span>
                  </div>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRetry}
                    className="flex-1 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <div className="text-xl mr-2">🔄</div>
                      <span className="text-[var(--text-primary)]">Dịch lại</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/learn/translate')}
                    className="flex-1 p-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <div className="text-xl mr-2">📚</div>
                      <span>Chọn topic khác</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Popup */}
      {showSelectionPopup && selectionInfo && (
        <div className="selection-popup z-40">
          <SelectionPopup
            position={selectionInfo.position}
            onTranslate={handleTranslate}
            onHighlight={() => {}} // Không cần chức năng highlight trong trang này
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
  );
};

export default TranslateLearn; 