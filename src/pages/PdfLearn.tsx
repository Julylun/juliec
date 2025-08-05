import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { set } from 'idb-keyval';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';
import ReactMarkdown from 'react-markdown';
import { GeminiService } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';

const QUOTES = [
  'Đừng nản lòng, mọi thứ sẽ ổn thôi! 💪',
  'Kiên nhẫn là chìa khóa của thành công! 🗝️',
  'Chờ một chút, tri thức đang đến! 📚',
  'Bạn thật tuyệt vời khi học mỗi ngày! 🌟',
  'Đang biến PDF thành tri thức cho bạn... 🚀',
  'Một chút nữa thôi, sắp xong rồi! ⏳',
  'Cảm ơn bạn đã kiên nhẫn! 🥰',
  'Học tập là hành trình, không phải đích đến! 🛤️',
  'Đang chuẩn bị nội dung xịn cho bạn... 🎁',
  'Chờ xíu nhé, AI đang làm việc hết công suất! 🤖',
];
function getRandomQuote(lastQuote: string | null) {
  let quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  while (quote === lastQuote && QUOTES.length > 1) {
    quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }
  return quote;
}

const PdfLearn: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [highlightRanges, setHighlightRanges] = useState<{start: number, end: number}[]>([]);
  const [showLearn, setShowLearn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [lastQuote, setLastQuote] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState<string>(getRandomQuote(null));
  const [userPrompt, setUserPrompt] = useState('');

  useEffect(() => {
    if (loading) {
      const newQuote = getRandomQuote(lastQuote);
      setCurrentQuote(newQuote);
      setLastQuote(newQuote);
      const interval = setInterval(() => {
        const nextQuote = getRandomQuote(newQuote);
        setCurrentQuote(nextQuote);
        setLastQuote(nextQuote);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const extractTextFromPDF = async (file: File) => {
    console.log('[DEBUG] Bắt đầu extract text từ PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += `\n\n--- Page ${i} ---\n\n` + pageText;
      console.log(`[DEBUG] Đã extract xong page ${i}`);
    }
    console.log('[DEBUG] Extract xong toàn bộ PDF:', text.slice(0, 300));
    return text;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setShowLearn(false);
    setMarkdown('');
    setRawText('');
    setAiError(null);
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      set('pdf_learn_file', f);
      localStorage.setItem('pdf_learn_file_name', f.name);
      setLoading(true);
      try {
        // Extract text
        const text = await extractTextFromPDF(f);
        setRawText(text);
        console.log('[DEBUG] Text extract từ PDF:', text.slice(0, 500));
        // Gửi cho AI format lại thành markdown
        if (settings.geminiKey) {
          const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
          let prompt = `Bạn là một formatter chuyên nghiệp, nhiệm vụ của bạn là chuyển nội dung trong <content> thành TEXT sao cho dễ nhìn dễ đọc, phù hợp và đẹp. Để làm tốt nhiệm vụ này bạn hãy thực hiện các bước sau đây:
- Phân tích nội dung để biết nội dung thuộc thể loại gì (đề thi, bài đọc...)
- Xóa những phần thừa thải không cần thiết (các dấu thừa, tên bản quyền...) và sửa lỗi chính tả
- Chuyển sang dạng phù hợp với thể loại
- Sử dụng text in đậm cho các từ quan trọng, cần thiết. 
- Sử dụng dấu xuống dòng để tách các đoạn văn bản khi cần thiết.

LƯU Ý: 
- nội dung bạn đưa ra sẽ được đưa vào code nên không thêm bất kì câu chữ nào khác ngoài đoạn code markdown

`;
          if (userPrompt.trim()) {
            prompt += `\n\nYÊU CẦU BẮT BUỘC LÀM THEO: ${userPrompt.trim()}`;
          }
          prompt += `\n<content>${text}</content>`;
          console.log('[DEBUG] Gửi prompt cho AI:', prompt.slice(0, 500));
          let md = await gemini.generateContent(prompt);
          // Xóa ```markdown ... ``` nếu có
          if (md) {
            md = md.trim();
            if (md.startsWith('```markdown')) {
              md = md.replace(/^```markdown\s*/, '');
            }
            if (md.endsWith('```')) {
              md = md.replace(/```\s*$/, '');
            }
            md = md.trim();
          }
          setMarkdown(md || text);
          localStorage.setItem('pdf_learn_markdown', md || text);
          console.log('[DEBUG] Markdown nhận từ AI:', (md || text).slice(0, 500));
        } else {
          setMarkdown(text);
          localStorage.setItem('pdf_learn_markdown', text);
        }
      } catch (e: any) {
        setAiError('Lỗi khi chuyển đổi PDF: ' + (e.message || 'Không xác định'));
        console.error('[DEBUG] Lỗi khi chuyển đổi PDF:', e);
      } finally {
        setLoading(false);
      }
    } else {
      setFile(null);
      setPreviewUrl(null);
      setMarkdown('');
      setRawText('');
      localStorage.removeItem('pdf_learn_file_name');
      set('pdf_learn_file', null);
      localStorage.removeItem('pdf_learn_markdown');
    }
  };

  // Highlight logic: simple selection highlight
  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString()) return;
    const selectedText = selection.toString();
    const start = markdown.indexOf(selectedText);
    if (start === -1) return;
    const end = start + selectedText.length;
    setHighlightRanges([...highlightRanges, { start, end }]);
    // Bọc highlight bằng ký hiệu đặc biệt
    let newMarkdown = '';
    let lastIndex = 0;
    highlightRanges.concat({ start, end }).sort((a, b) => a.start - b.start).forEach((range, i) => {
      newMarkdown += markdown.slice(lastIndex, range.start);
      newMarkdown += `==${markdown.slice(range.start, range.end)}==`;
      lastIndex = range.end;
    });
    newMarkdown += markdown.slice(lastIndex);
    setMarkdown(newMarkdown);
    localStorage.setItem('pdf_learn_markdown', newMarkdown);
    setHighlightRanges([]); // reset highlightRanges sau khi apply
    window.getSelection()?.removeAllRanges();
  };

  const handleShowLearn = () => {
    localStorage.setItem('pdf_learn_markdown', markdown);
    navigate('/learn/pdf/learn');
    console.log('[DEBUG] Bấm Learn, chuyển sang /learn/pdf/learn với markdown:', markdown.slice(0, 500));
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">PDF Learning</h1>
        <p className="text-[var(--text-secondary)]">Upload file PDF để bắt đầu học</p>
      </div>
      <textarea
        className="w-full max-w-2xl border rounded p-2 mb-4"
        rows={2}
        placeholder="Nhập lệnh bổ sung cho AI khi chuyển đổi PDF sang markdown (tùy chọn)"
        value={userPrompt}
        onChange={e => setUserPrompt(e.target.value)}
      />
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 mb-4"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload PDF
      </button>
      {loading && (
        <div className="flex flex-col items-center mb-4 animate-pulse">
          <div className="w-16 h-16 rounded-full border-4 border-blue-300 border-t-blue-600 animate-spin mb-4"></div>
          <div className="text-blue-500 text-lg font-semibold mb-2">Đang chuyển đổi PDF sang markdown...</div>
          <div className="italic text-gray-500 text-center">{currentQuote}</div>
        </div>
      )}
      {aiError && <div className="text-red-500 mb-4">{aiError}</div>}
      {file && !showLearn && !loading && (
        <button
          className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 mb-4"
          onClick={handleShowLearn}
        >
          Learn
        </button>
      )}
      {/* Xóa toàn bộ phần hiển thị markdown preview và highlight ở trang này, chỉ giữ lại upload, loading, lỗi, và nút Learn. */}
    </div>
  );
};

export default PdfLearn; 