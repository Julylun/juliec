import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useLearning } from '../contexts/LearningContext';
import { GeminiService } from '../services/geminiService';
import { writingTopics, Topic } from '../data/writingTopics';
import { WritingPrompt, WritingFeedback, getPromptGeneratorByTopic, getEvaluationPromptByTopic } from '../data/writingPrompts';
import Arrow from '../components/icons/Arrow';
import { createPortal } from 'react-dom';

const WritingLearn: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { settings } = useSettings();
  const { selectedTopic, setSelectedTopic } = useLearning();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [writingPrompt, setWritingPrompt] = useState<WritingPrompt | null>(null);
  const [userEssay, setUserEssay] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializeRef = useRef(false);
  const [hoveredCorrection, setHoveredCorrection] = useState<{
    index: number;
    rect: DOMRect;
    correction: WritingFeedback['corrections'][0];
  } | null>(null);

  useEffect(() => {
    const initializeTopic = async () => {
      const currentTopic = writingTopics.find(t => t.id === topicId);
      if (currentTopic && !initializeRef.current) {
        initializeRef.current = true;
        setTopic(currentTopic);
        setSelectedTopic(currentTopic);
        
        if (settings.geminiKey) {
          setIsLoadingPrompt(true);
          setError(null);

          try {
            const geminiService = new GeminiService(settings.geminiKey, settings.geminiModel);
            const prompt = getPromptGeneratorByTopic(currentTopic, settings.englishStandard);
            
            const response = await geminiService.generateContent(prompt);
            if (!response) {
              throw new Error('Không nhận được phản hồi từ Gemini');
            }

            try {
              const jsonMatch = response.match(/\{[\s\S]*\}/);
              console.log(jsonMatch);
              if (!jsonMatch) {
                throw new Error('Không tìm thấy JSON trong phản hồi');
              }
              
              const jsonStr = jsonMatch[0];
              const promptData = JSON.parse(jsonStr) as WritingPrompt;
              
              if (!promptData.content || typeof promptData.content !== 'string' || promptData.content.trim().length === 0) {
                throw new Error('Dữ liệu đề bài không hợp lệ');
              }

              setWritingPrompt(promptData);
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              console.error('Raw response:', response);
              throw new Error('Không thể xử lý dữ liệu đề bài');
            }
          } catch (error) {
            console.error('Error generating prompt:', error);
            setError('Lỗi khi tạo đề bài: ' + (error as Error).message);
          } finally {
            setIsLoadingPrompt(false);
            setIsInitialized(true);
          }
        } else {
          setIsInitialized(true);
        }
      }
    };

    initializeTopic();
  }, [topicId, settings.geminiKey, settings.englishStandard, setSelectedTopic]);

  const handleSubmit = async () => {
    if (!userEssay.trim() || !topic || !settings.geminiKey || !writingPrompt) return;
    
    setIsEvaluating(true);
    setError(null);

    try {
      const geminiService = new GeminiService(settings.geminiKey, settings.geminiModel);
      
      // Tạo prompt với cả đề bài và bài làm
      const fullEssay = `
Writing Prompt:
${writingPrompt.content}

Student's Essay:
${userEssay}
`;
      
      const prompt = getEvaluationPromptByTopic(topic, fullEssay, settings.englishStandard);
      
      const response = await geminiService.generateContent(prompt);
      if (!response) {
        throw new Error('Không nhận được phản hồi từ Gemini');
      }

      try {
        // Tìm và trích xuất JSON từ response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Không tìm thấy JSON trong phản hồi');
        }

        // Làm sạch JSON string
        const jsonStr = jsonMatch[0]
          .replace(/[\u0000-\u001F]+/g, '') // Loại bỏ các ký tự điều khiển
          .replace(/\\([^"\\\/bfnrtu])/g, '$1'); // Loại bỏ escape không cần thiết

        // Parse JSON
        const feedbackData = JSON.parse(jsonStr);

        // Validate dữ liệu
        if (!feedbackData || typeof feedbackData !== 'object') {
          throw new Error('Dữ liệu không hợp lệ');
        }

        if (typeof feedbackData.score !== 'number' || 
            typeof feedbackData.generalFeedback !== 'string' ||
            !Array.isArray(feedbackData.strengthPoints) ||
            !Array.isArray(feedbackData.improvementPoints) ||
            !Array.isArray(feedbackData.corrections)) {
          throw new Error('Cấu trúc dữ liệu không hợp lệ');
        }

        // Validate corrections
        feedbackData.corrections = feedbackData.corrections.map((correction: any) => ({
          start: Number(correction.start),
          end: Number(correction.end),
          original: String(correction.original),
          suggestion: String(correction.suggestion),
          explanation: String(correction.explanation),
          type: correction.type as 'grammar' | 'vocabulary' | 'style' | 'structure'
        }));

        setFeedback(feedbackData);
        setIsSubmitted(true);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw response:', response);
        throw new Error('Không thể xử lý kết quả đánh giá');
      }
    } catch (error) {
      console.error('Error evaluating essay:', error);
      setError('Lỗi khi đánh giá bài viết: ' + (error as Error).message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const getHighlightedText = () => {
    if (!feedback || !userEssay) return userEssay;

    const sortedCorrections = [...feedback.corrections].sort((a, b) => a.start - b.start);
    
    let lastIndex = 0;
    let result = [];

    sortedCorrections.forEach((correction, index) => {
      if (correction.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {userEssay.slice(lastIndex, correction.start)}
          </span>
        );
      }

      const highlightColor = {
        grammar: 'bg-red-200/50 dark:bg-red-900/30',
        vocabulary: 'bg-yellow-200/50 dark:bg-yellow-900/30',
        style: 'bg-blue-200/50 dark:bg-blue-900/30',
        structure: 'bg-purple-200/50 dark:bg-purple-900/30'
      }[correction.type];

      result.push(
        <div
          key={`correction-${index}`}
          className="relative inline-block"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredCorrection({
              index,
              rect,
              correction
            });
          }}
          onMouseLeave={() => setHoveredCorrection(null)}
        >
          <span 
            className={`cursor-help ${highlightColor} px-0.5 rounded`}
          >
            {correction.original}
          </span>
        </div>
      );

      lastIndex = correction.end;
    });

    if (lastIndex < userEssay.length) {
      result.push(
        <span key="text-end">
          {userEssay.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };

  const Tooltip = ({ correction, rect }: { 
    correction: WritingFeedback['corrections'][0], 
    rect: DOMRect 
  }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        // Calculate left position
        let left = rect.left + (rect.width - tooltipRect.width) / 2;
        // Prevent tooltip from going off-screen on the left
        left = Math.max(16, left);
        // Prevent tooltip from going off-screen on the right
        left = Math.min(left, windowWidth - tooltipRect.width - 16);
        
        // Calculate top position (always above the text)
        const top = Math.max(16, rect.top - tooltipRect.height - 8);

        setPosition({ top, left });
      }
    }, [rect]);

    return createPortal(
      <div
        ref={tooltipRef}
        className="fixed z-[9999] animate-fade-in"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg text-sm p-3 w-[300px]">
          <div className="relative">
            <p className="font-medium text-green-600 dark:text-green-400 mb-1">
              Gợi ý: {correction.suggestion}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {correction.explanation}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Loại lỗi: {correction.type}
            </div>
            <div 
              className="absolute w-3 h-3 bg-white dark:bg-gray-800 rotate-45 left-1/2 -bottom-1.5 -translate-x-1/2"
              style={{
                boxShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (!topic || !isInitialized) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            JULIEC
          </h2>
          <p className="text-[var(--text-secondary)]">
            {isLoadingPrompt ? 'Đang tạo đề bài...' : 'Đang tải...'}
          </p>
        </div>
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
              onClick={() => navigate('/learn/writing')}
              className="p-2 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label="Quay lại"
            >
              <Arrow className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Writing Practice</h1>
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
              {feedback.generalFeedback}
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="sticky top-[64px] z-30 w-full bg-red-100/50 dark:bg-red-900/20 border-b border-red-500 p-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* Writing Prompt */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)]">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            {topic.title}
          </h3>
          
          {isLoadingPrompt ? (
            <div className="text-[var(--text-secondary)]">Đang tải đề bài...</div>
          ) : writingPrompt ? (
            <div className="whitespace-pre-wrap text-[var(--text-primary)]">
              {writingPrompt.content}
            </div>
          ) : (
            <p className="text-[var(--text-secondary)]">{topic.description}</p>
          )}
        </div>

        {/* Writing Area */}
        <div className="space-y-4">
          {isSubmitted ? (
            <div className="relative w-full h-96 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] overflow-auto whitespace-pre-wrap">
              {getHighlightedText()}
              {hoveredCorrection && (
                <Tooltip
                  correction={hoveredCorrection.correction}
                  rect={hoveredCorrection.rect}
                />
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={userEssay}
              onChange={(e) => setUserEssay(e.target.value)}
              placeholder="Viết bài của bạn ở đây..."
              className="w-full h-96 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none focus:outline-none focus:border-blue-500"
              disabled={isSubmitted}
            />
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-[var(--text-secondary)]">
              Số từ: {userEssay.trim().split(/\s+/).length}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isEvaluating || isSubmitted || !userEssay.trim()}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isEvaluating || isSubmitted || !userEssay.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isEvaluating ? 'Đang đánh giá...' : 'Nộp bài'}
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        {isSubmitted && feedback && (
          <div className="space-y-6">
            {/* Điểm mạnh */}
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Điểm mạnh
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {feedback.strengthPoints.map((point, index) => (
                  <li key={index} className="text-[var(--text-primary)]">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Điểm cần cải thiện */}
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Điểm cần cải thiện
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {feedback.improvementPoints.map((point, index) => (
                  <li key={index} className="text-[var(--text-primary)]">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chi tiết các lỗi */}
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Chi tiết các lỗi
              </h3>
              <div className="space-y-4">
                {feedback.corrections.map((correction, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg bg-[var(--bg-secondary)] border ${
                      correction.type === 'grammar' ? 'border-red-500/50' :
                      correction.type === 'vocabulary' ? 'border-yellow-500/50' :
                      correction.type === 'style' ? 'border-blue-500/50' :
                      'border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={
                        correction.type === 'grammar' ? 'text-red-500' :
                        correction.type === 'vocabulary' ? 'text-yellow-500' :
                        correction.type === 'style' ? 'text-blue-500' :
                        'text-purple-500'
                      }>✗</span>
                      <div>
                        <p className="text-[var(--text-primary)] line-through">
                          {correction.original}
                        </p>
                        <p className="text-green-500 mt-1">
                          {correction.suggestion}
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm mt-2">
                          {correction.explanation}
                        </p>
                        <p className="text-[var(--text-secondary)] text-xs mt-1">
                          Loại lỗi: {correction.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingLearn; 