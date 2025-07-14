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

const TutorAgentTeach: React.FC = () => {
  const { settings } = useSettings();
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { role: 'user', content: input }]);
    setLoading(true);
    try {
      const item = plan[currentIdx];
      const history = messages.map(m => `${m.role === 'user' ? 'Người học' : 'Agent'}: ${m.content}`).join('\n');
      const prompt = `Bạn là AI tutor, đang dạy người học theo lộ trình sau (chỉ tập trung vào chương/ngày hiện tại):\n\n${JSON.stringify(item, null, 2)}\n\nLịch sử hội thoại:\n${history}\n\nNgười học vừa hỏi: ${input}\n\nHãy trả lời ngắn gọn, dễ hiểu, có thể giải thích, đưa ví dụ, hoặc đặt câu hỏi ngược lại để kiểm tra hiểu bài.\n\nKhi trả lời, hãy sử dụng markdown để trình bày đẹp (bảng, danh sách, ví dụ, code block...), ưu tiên markdown table nếu phù hợp.`;
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
        </div>
      </div>
    </div>
  );
};

export default TutorAgentTeach; 