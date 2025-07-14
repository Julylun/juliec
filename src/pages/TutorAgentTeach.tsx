import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { GeminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface PlanItem {
  id: number;
  title: string;
  goal: string;
  content: string;
  exercise?: string;
  resources?: string;
}

interface Message {
  role: 'user' | 'agent';
  content: string;
}

// Quiz types
interface QuizQuestion {
  type: 'mcq' | 'fill' | 'match';
  question: string;
  options?: string[];
  answer: string | string[];
  pairs?: { left: string; right: string }[];
}

const TutorAgentTeach: React.FC = () => {
  const { settings } = useSettings();
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [otherCodeWarn, setOtherCodeWarn] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [editLang, setEditLang] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [lastCodeBlock, setLastCodeBlock] = useState<{ lang: string; code: string } | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showCanvasPanel, setShowCanvasPanel] = useState(true);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizCode, setQuizCode] = useState<string | null>(null);
  const [showQuizCodeModal, setShowQuizCodeModal] = useState(false);
  const [editQuizCode, setEditQuizCode] = useState('');
  const [quizCodeError, setQuizCodeError] = useState<string | null>(null);

  // Load plan và tiến độ từ localStorage (hoặc context nếu có)
  useEffect(() => {
    const saved = localStorage.getItem('tutor_agent_plan');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setPlan(arr);
      } catch {}
    }
    // Load tiến độ
    const savedIdx = localStorage.getItem('tutor_agent_progress');
    if (savedIdx) {
      const idx = parseInt(savedIdx, 10);
      if (!isNaN(idx)) setCurrentIdx(idx);
    }
  }, []);

  // Lưu tiến độ mỗi khi currentIdx thay đổi
  useEffect(() => {
    localStorage.setItem('tutor_agent_progress', String(currentIdx));
  }, [currentIdx]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Khi chuyển chương/ngày, agent tự động chào và giới thiệu mục tiêu
  useEffect(() => {
    if (plan.length && messages.length === 0) {
      const item = plan[currentIdx];
      setMessages([
        { role: 'agent', content: `Chào mừng bạn đến với chương/ngày: **${item.title}**!\n\nMục tiêu: ${item.goal}\n\nNội dung: ${item.content}${item.exercise ? `\n\nBài tập: ${item.exercise}` : ''}${item.resources ? `\n\nTài nguyên: ${item.resources}` : ''}\n\nBạn có câu hỏi gì về phần này không?` }
      ]);
    }
  }, [plan, currentIdx]);

  // Lắng nghe message agent, nếu có [QUIZ] hoặc [FLASHCARD] thì gọi quiz
  useEffect(() => {
    if (!messages.length) return;
    const lastAgentMsg = [...messages].reverse().find(m => m.role === 'agent');
    if (!lastAgentMsg) return;
    if (lastAgentMsg.content.includes('[QUIZ]') || lastAgentMsg.content.includes('[FLASHCARD]')) {
      // Gọi quiz như logic cũ
      setQuiz(null);
      setQuizLoading(true);
      setQuizError(null);
      setQuizCode(null);
      const item = plan[currentIdx];
      // Lấy lịch sử hội thoại gần nhất (3-5 lượt)
      const recentHistory = messages.slice(-6).map(m => `${m.role === 'user' ? 'Người học' : 'Tutor'}: ${m.content}`).join('\n');
      const quizPrompt = `Bạn là AI tutor. Hãy tạo một quiz hoặc flashcard ngắn (1-3 câu hỏi) phù hợp với nội dung sau (ưu tiên đa dạng dạng bài):\n${JSON.stringify(item, null, 2)}\n\nLịch sử hội thoại gần nhất giữa người học và tutor:\n${recentHistory}\n\nYêu cầu:\n- Quiz nên liên quan sát với nội dung vừa trao đổi trong hội thoại.\n- Có thể là trắc nghiệm (mcq), điền từ (fill), ghép cặp (match), hoặc trò chơi nhỏ.\n- Nếu là quiz thông thường, trả về mảng JSON với các trường: type, question, options (nếu có), answer, pairs (nếu match).\n- Nếu muốn tạo quiz động, trả về code block js với hàm renderQuiz(container) để FE thực thi.\n- Không giải thích, chỉ trả về JSON hoặc code block.`;
      const fetchQuiz = async () => {
        try {
          const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
          const res = await gemini.generateContent(quizPrompt);
          // Parse code block js
          const codeMatch = res.match(/```js([\s\S]*?)```/i);
          if (codeMatch) {
            setQuizCode(codeMatch[1].trim());
            setQuiz(null);
            setQuizLoading(false);
            setShowQuiz(true);
            return;
          }
          // Parse JSON (có thể là ```json hoặc bị cắt đầu 'on\n')
          let jsonStr = '';
          const jsonBlockMatch = res.match(/```json([\s\S]*?)```/i);
          if (jsonBlockMatch) {
            jsonStr = jsonBlockMatch[1].trim();
          } else {
            const jsonMatch = res.match(/\[\s*{[\s\S]*?}\s*\]/);
            if (jsonMatch) jsonStr = jsonMatch[0];
          }
          // Nếu jsonStr bắt đầu bằng 'on\n', loại bỏ
          if (jsonStr.startsWith('on\n')) jsonStr = jsonStr.slice(3);
          if (jsonStr.startsWith('on')) jsonStr = jsonStr.slice(2);
          if (jsonStr) {
            try {
              let arr = JSON.parse(jsonStr);
              // Tự động chuyển đổi key 'item'/'match' thành 'left'/'right' nếu có
              arr = arr.map((q: any) => {
                if (q.type === 'match' && Array.isArray(q.pairs)) {
                  q.pairs = q.pairs.map((p: any) => {
                    if (p.item !== undefined && p.match !== undefined) {
                      return { left: p.item, right: p.match };
                    }
                    return p;
                  });
                }
                return q;
              });
              setQuiz(arr);
              setQuizCode(null);
              setShowQuiz(true);
            } catch (e) {
              setQuizError('Quiz JSON không hợp lệ: ' + (e as any).message);
            }
          } else {
            setQuizError('Quiz không hợp lệ hoặc AI không trả về đúng định dạng.');
          }
        } catch (e: any) {
          setQuizError('Lỗi khi sinh quiz: ' + (e.message || 'Không xác định'));
        } finally {
          setQuizLoading(false);
        }
      };
      fetchQuiz();
      setQuizAnswers({});
      setQuizResult(null);
    }
  }, [messages, plan, currentIdx, settings.geminiKey, settings.geminiModel]);

  // Parse code block từ agent message cuối cùng
  useEffect(() => {
    setCanvasError(null);
    setSvgContent(null);
    setImageUrl(null);
    setOtherCodeWarn(null);
    setLastCodeBlock(null);
    if (!messages.length) return;
    const lastAgentMsg = [...messages].reverse().find(m => m.role === 'agent');
    if (!lastAgentMsg) return;
    // Ưu tiên: markdown image
    const imgMatch = lastAgentMsg.content.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch && imgMatch[1]) {
      setImageUrl(imgMatch[1]);
      return;
    }
    // Tìm code block
    const codeMatch = lastAgentMsg.content.match(/```(canvas|js|javascript|svg|p5js|chartjs|mermaid)?\n([\s\S]*?)```/i);
    if (codeMatch) {
      const lang = codeMatch[1]?.toLowerCase() || '';
      const code = codeMatch[2];
      setLastCodeBlock({ lang, code });
      if (lang === 'svg' || code.trim().startsWith('<svg')) {
        setSvgContent(code.trim());
        return;
      }
      if (lang === 'canvas' || lang === 'js' || lang === 'javascript') {
        // Thực thi code vẽ lên canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        try {
          const sandboxFunc = new Function('ctx', 'canvas', code);
          sandboxFunc(ctx, canvas);
        } catch (e: any) {
          setCanvasError('Lỗi khi thực thi code vẽ: ' + (e.message || 'Không xác định'));
        }
        return;
      }
      if (lang === 'p5js' || lang === 'chartjs' || lang === 'mermaid') {
        setOtherCodeWarn('Chưa hỗ trợ tự động render ' + lang + '. Bạn có thể copy code và chạy ở nơi phù hợp.');
        return;
      }
    }
  }, [messages]);

  // Hàm thực thi lại code canvas từ editor
  const handleRunEditCode = () => {
    setEditError(null);
    if (!editCode) return;
    if (editLang === 'canvas' || editLang === 'js' || editLang === 'javascript') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      try {
        const sandboxFunc = new Function('ctx', 'canvas', editCode);
        sandboxFunc(ctx, canvas);
      } catch (e: any) {
        setEditError('Lỗi khi thực thi code: ' + (e.message || 'Không xác định'));
      }
    }
  };

  const handleClearCanvas = () => {
    setCanvasError(null);
    setSvgContent(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { role: 'user', content: input }]);
    setLoading(true);
    try {
      const item = plan[currentIdx];
      const history = messages.map(m => `${m.role === 'user' ? 'Người học' : 'Agent'}: ${m.content}`).join('\n');
      const prompt = `Bạn là AI tutor, đang dạy người học theo lộ trình sau (chỉ tập trung vào chương/ngày hiện tại):\n\n${JSON.stringify(item, null, 2)}\n\nLịch sử hội thoại:\n${history}\n\nNgười học vừa hỏi: ${input}\n\nHướng dẫn đặc biệt:\n- Nếu muốn kiểm tra người học, hãy gửi [QUIZ] hoặc [FLASHCARD] trong chat. Khi đó hệ thống sẽ tự động tạo quiz/flashcard phù hợp với nội dung vừa học.\n- Ngoài ra, bạn có thể vẽ chữ, sơ đồ, hình minh hoạ, biểu đồ, hoặc hình ảnh minh hoạ bằng code block phù hợp như trước.\n- Khi trả về code canvas, chỉ sử dụng biến ctx và canvas đã có sẵn, không khai báo lại biến canvas.\n- Không trả lời ngoài code block hoặc markdown image khi vẽ/hình ảnh, chỉ trả về code hoặc ảnh.\n- Nếu không phải yêu cầu vẽ/hình ảnh, hãy trả lời ngắn gọn, dễ hiểu, có thể giải thích, đưa ví dụ, hoặc đặt câu hỏi ngược lại để kiểm tra hiểu bài.\n- Khi trả lời thông thường, hãy sử dụng markdown để trình bày đẹp (bảng, danh sách, ví dụ, code block...), ưu tiên markdown table nếu phù hợp.`;
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const res = await gemini.generateContent(prompt);
      setMessages(msgs => [...msgs, { role: 'agent', content: res || '...' }]);
    } catch (e: any) {
      setMessages(msgs => [...msgs, { role: 'agent', content: 'Lỗi khi gọi AI: ' + (e.message || 'Không xác định') }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleNext = () => {
    if (currentIdx < plan.length - 1) {
      setCurrentIdx(idx => idx + 1);
      setMessages([]);
    }
  };

  // Khi click vào từng chương/ngày
  const handleGotoLesson = (idx: number) => {
    setCurrentIdx(idx);
    setMessages([]);
  };

  // Xử lý submit quiz
  const handleQuizSubmit = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.forEach((q, idx) => {
      if (q.type === 'mcq' || q.type === 'fill') {
        if (quizAnswers[idx]?.toString().trim().toLowerCase() === q.answer.toString().trim().toLowerCase()) correct++;
      } else if (q.type === 'match') {
        if (JSON.stringify(quizAnswers[idx]) === JSON.stringify(q.answer)) correct++;
      }
    });
    setQuizResult(`Bạn đúng ${correct}/${quiz.length} câu!`);
  };

  // Render quiz UI
  const renderQuiz = () => {
    if (quizLoading) return <div>Đang tải quiz...</div>;
    if (quizError) return <div className="text-red-500">{quizError}</div>;
    if (quizCode) return <QuizCodeExecution code={quizCode} />;
    if (!quiz) return <div>Không có quiz cho bài này.</div>;
    return (
      <form onSubmit={e => { e.preventDefault(); handleQuizSubmit(); }}>
        {quiz.map((q, idx) => (
          <div key={idx} className="mb-4">
            <div className="font-semibold mb-1">{q.question}</div>
            {q.type === 'mcq' && q.options && (
              <div className="flex flex-col gap-1">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="radio" name={`quiz-${idx}`} value={opt} checked={quizAnswers[idx] === opt} onChange={() => setQuizAnswers((a: any) => ({ ...a, [idx]: opt }))} />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {q.type === 'fill' && (
              <input className="border rounded p-1 w-full" value={quizAnswers[idx] || ''} onChange={e => setQuizAnswers((a: any) => ({ ...a, [idx]: e.target.value }))} />
            )}
            {q.type === 'match' && q.pairs && (
              <div className="flex flex-col gap-1">
                {q.pairs.map((pair, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span>{pair.left}</span>
                    <input className="border rounded p-1 flex-1" value={quizAnswers[idx]?.[i] || ''} onChange={e => setQuizAnswers((a: any) => ({ ...a, [idx]: { ...(a[idx] || {}), [i]: e.target.value } }))} placeholder="Ghép với..." />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <button type="submit" className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700">Nộp bài</button>
        {quizResult && <div className="mt-2 font-semibold text-blue-600">{quizResult}</div>}
        <button type="button" className="ml-2 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400" onClick={() => { setQuizAnswers({}); setQuizResult(null); }}>Làm lại</button>
      </form>
    );
  };

  // Quiz code execution component (sandbox)
  const QuizCodeExecution: React.FC<{ code: string }> = ({ code }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!containerRef.current) return;
      try {
        // eslint-disable-next-line no-new-func
        const func = new Function('container', code);
        func(containerRef.current);
        setQuizCodeError(null);
      } catch (e) {
        setQuizCodeError('Lỗi khi thực thi quiz code: ' + (e as any).message);
        containerRef.current!.innerHTML = '<div style="color:red">Lỗi khi thực thi quiz code: ' + (e as any).message + '</div>';
      }
    }, [code]);
    return <div ref={containerRef} className="p-2 border rounded bg-gray-50" />;
  };

  if (!plan.length) {
    return (
      <div className="p-8 text-center text-[var(--text-primary)]">
        <p>Không tìm thấy lộ trình học. Vui lòng tạo lộ trình ở trang trước.</p>
        <button className="mt-4 px-4 py-2 rounded bg-blue-500 text-white" onClick={() => navigate('/learn/tutor-agent')}>Quay lại tạo lộ trình</button>
      </div>
    );
  }

  const item = plan[currentIdx];

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      {/* Nút mở panel canvas bên trái */}
      {!showCanvasPanel && (
        <button
          className="fixed left-2 top-1/2 z-50 bg-blue-500 text-white px-3 py-2 rounded-r-lg shadow-lg hover:bg-blue-600"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => setShowCanvasPanel(true)}
        >
          Minh hoạ
        </button>
      )}
      {/* Panel canvas bên trái */}
      {showCanvasPanel && (
        <div
          className="fixed left-0 top-0 z-50 bg-white border-r border-gray-300 shadow-lg rounded-r-xl flex flex-col items-center p-3"
          style={{ width: 270, minHeight: 320, maxHeight: '90vh' }}
        >
          <button
            className="absolute top-2 right-2 text-lg text-gray-500 hover:text-red-500"
            onClick={() => setShowCanvasPanel(false)}
            title="Đóng minh hoạ"
          >✕</button>
          <div className="font-semibold mb-2">Minh hoạ</div>
          <div className="border border-gray-300 rounded bg-gray-50 flex items-center justify-center mb-2" style={{ minHeight: 220, minWidth: 220, position: 'relative' }}>
            {imageUrl ? (
              <img src={imageUrl} alt="AI minh hoạ" style={{ maxWidth: 220, maxHeight: 220, objectFit: 'contain', borderRadius: 8 }} />
            ) : svgContent ? (
              <div dangerouslySetInnerHTML={{ __html: svgContent }} style={{ width: 220, height: 220 }} />
            ) : (
              <canvas ref={canvasRef} width={220} height={220} style={{ background: 'white', borderRadius: 8 }} />
            )}
            {canvasError && <div className="absolute top-2 left-2 right-2 text-xs text-red-500 bg-white/80 p-1 rounded">{canvasError}</div>}
            {otherCodeWarn && <div className="absolute top-2 left-2 right-2 text-xs text-yellow-600 bg-white/80 p-1 rounded">{otherCodeWarn}</div>}
            {lastCodeBlock && (
              <button className="absolute top-2 right-2 text-xs px-2 py-1 bg-blue-200 hover:bg-blue-300 rounded" onClick={() => { setEditCode(lastCodeBlock.code); setEditLang(lastCodeBlock.lang); setShowCodeModal(true); }}>Edit code</button>
            )}
            <button className="absolute bottom-2 right-2 text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded" title="Phóng to" onClick={() => setShowFullscreen(true)}>⛶</button>
          </div>
          <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 mb-1" onClick={handleClearCanvas}>Clear</button>
          <div className="text-xs text-[var(--text-secondary)] mt-1">AI có thể vẽ chữ, sơ đồ, hình minh hoạ... bằng code canvas hoặc SVG.</div>
        </div>
      )}
      {/* Nút Quiz/Flashcard nổi bên phải */}
      <button
        className="fixed right-4 bottom-24 z-50 bg-yellow-400 text-black px-4 py-2 rounded-full shadow-lg hover:bg-yellow-500"
        onClick={() => setShowQuiz(true)}
        style={{ fontWeight: 600 }}
      >
        Quiz/Flashcard
      </button>
      {/* Popup Quiz/Flashcard */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-lg" onClick={() => setShowQuiz(false)}>✕</button>
            <div className="text-xl font-bold mb-4">Quiz/Flashcard</div>
            {quizCode && (
              <button className="absolute top-2 left-2 text-xs px-2 py-1 bg-blue-200 hover:bg-blue-300 rounded" onClick={() => { setEditQuizCode(quizCode); setShowQuizCodeModal(true); }}>Edit code</button>
            )}
            {renderQuiz()}
            {quizCodeError && <div className="mt-2 text-xs text-red-500">{quizCodeError}</div>}
          </div>
        </div>
      )}
      {/* Modal edit quiz code */}
      {showQuizCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-lg" onClick={() => setShowQuizCodeModal(false)}>✕</button>
            <div className="mb-2 font-semibold">Quiz/Flashcard JS Code</div>
            <textarea
              className="w-full h-48 border rounded p-2 font-mono text-xs"
              value={editQuizCode}
              onChange={e => setEditQuizCode(e.target.value)}
              spellCheck={false}
            />
            <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => { setShowQuizCodeModal(false); setQuizCode(editQuizCode); }}>Thử lại quiz</button>
            <button className="mt-2 ml-2 px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => setShowQuizCodeModal(false)}>Đóng</button>
          </div>
        </div>
      )}
      <div className="w-full max-w-7xl flex flex-col md:flex-row md:items-start gap-6">
        {/* Main content: học/chat */}
        <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6 shadow flex flex-col min-h-[500px]">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Chương/Ngày: {item.title}</h2>
            <div className="text-[var(--text-secondary)] mb-2">Mục tiêu: {item.goal}</div>
            <div className="mb-2">Nội dung: {item.content}</div>
            {item.exercise && <div className="mb-2">Bài tập: {item.exercise}</div>}
            {item.resources && <div className="mb-2">Tài nguyên: <a href={item.resources} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{item.resources}</a></div>}
          </div>
          <div className="flex-1 overflow-y-auto bg-white rounded p-3 mb-4 border border-gray-200 min-h-[200px] max-h-[350px]">
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.role === 'agent' ? (
                  <span className="inline-block px-3 py-2 rounded-lg bg-gray-100 text-gray-900 max-w-full break-words">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </span>
                ) : (
                  <span className="inline-block px-3 py-2 rounded-lg bg-blue-100 text-blue-900 max-w-full break-words">{m.content}</span>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSend(); }}
              placeholder="Nhập câu hỏi hoặc trả lời..."
              disabled={loading}
            />
            <button
              className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Gửi
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
              onClick={handleNext}
              disabled={currentIdx >= plan.length - 1}
            >
              Tiếp tục
            </button>
          </div>
        </div>
        {/* Progress bar + list bên phải (luôn nằm bên phải trên md trở lên) */}
        <div className="w-full md:w-72 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-4 h-fit self-start md:sticky md:top-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--text-primary)] font-semibold">Tiến độ học:</span>
            <span className="text-[var(--text-secondary)]">{currentIdx + 1} / {plan.length}</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${((currentIdx + 1) / plan.length) * 100}%` }}
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {plan.map((p, idx) => (
              <button
                key={p.id}
                className={`w-full text-left px-2 py-1 rounded text-xs border font-semibold transition-all
                  ${idx === currentIdx ? 'bg-green-600 text-white border-green-700' : idx < currentIdx ? 'bg-green-200 text-green-900 border-green-400' : 'bg-gray-100 text-gray-500 border-gray-300'}
                `}
                onClick={() => handleGotoLesson(idx)}
                disabled={idx > currentIdx + 1}
                title={p.title}
              >
                {p.title.length > 24 ? p.title.slice(0, 22) + '…' : p.title}
              </button>
            ))}
          </div>
          {/* Modal code editor */}
          {showCodeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative">
                <button className="absolute top-2 right-2 text-lg" onClick={() => setShowCodeModal(false)}>✕</button>
                <div className="mb-2 font-semibold">{editLang ? `Code: ${editLang}` : 'Code'}</div>
                <textarea
                  className="w-full h-48 border rounded p-2 font-mono text-xs"
                  value={editCode}
                  onChange={e => setEditCode(e.target.value)}
                  spellCheck={false}
                />
                {editLang === 'canvas' || editLang === 'js' || editLang === 'javascript' ? (
                  <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleRunEditCode}>Thử lại trên canvas</button>
                ) : null}
                <button className="mt-2 ml-2 px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => setShowCodeModal(false)}>Đóng</button>
                {editError && <div className="mt-2 text-xs text-red-500">{editError}</div>}
              </div>
            </div>
          )}
          {/* Modal fullscreen canvas/SVG/ảnh */}
          {showFullscreen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowFullscreen(false)}>
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-5xl w-full flex flex-col items-center relative" style={{ maxHeight: '90vh', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-lg" onClick={() => setShowFullscreen(false)}>✕</button>
                <div className="mb-2 font-semibold">Minh hoạ lớn</div>
                {imageUrl ? (
                  <img src={imageUrl} alt="AI minh hoạ" style={{ maxWidth: '80vw', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
                ) : svgContent ? (
                  <div dangerouslySetInnerHTML={{ __html: svgContent }} style={{ width: '80vw', height: '70vh', maxWidth: 800, maxHeight: 600 }} />
                ) : (
                  <canvas ref={canvasRef} width={800} height={600} style={{ background: 'white', borderRadius: 8, maxWidth: '80vw', maxHeight: '70vh' }} />
                )}
                {lastCodeBlock && (
                  <button className="mt-4 px-4 py-1 bg-blue-200 hover:bg-blue-300 rounded" onClick={() => { setEditCode(lastCodeBlock.code); setEditLang(lastCodeBlock.lang); setShowCodeModal(true); }}>Edit code</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorAgentTeach; 