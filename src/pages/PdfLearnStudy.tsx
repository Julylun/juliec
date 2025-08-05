import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { highlightPlugin, MessageIcon, RenderHighlightTargetProps, RenderHighlightContentProps, RenderHighlightsProps, HighlightArea } from '@react-pdf-viewer/highlight';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import { get } from 'idb-keyval';
import ReactMarkdown from 'react-markdown';

const HIGHLIGHT_COLORS = [
  { name: 'yellow', label: 'Vàng', color: '#ffe066' },
  { name: 'green', label: 'Xanh lá', color: '#8fd19e' },
  { name: 'pink', label: 'Hồng', color: '#f7b2d9' },
  { name: 'purple', label: 'Tím', color: '#b39ddb' },
  { name: 'orange', label: 'Cam', color: '#ffb347' },
];

interface Note {
  id: number;
  content: string;
  highlightAreas: HighlightArea[];
  quote: string;
  color: string;
  pageIndexes: number[];
}

const HighlightContent: React.FC<{
  props: RenderHighlightContentProps;
  noteColor: string;
  onAdd: (note: Note, color: string) => void;
  noteId: number;
  setNoteId: (id: number) => void;
  setNoteColor: (color: string) => void;
}> = ({ props, noteColor, onAdd, noteId, setNoteId, setNoteColor }) => {
  const [message, setMessage] = React.useState('');
  const [color, setColor] = React.useState(noteColor);
  const addNote = () => {
    if (message !== '') {
      onAdd({
        id: noteId,
        content: message,
        highlightAreas: props.highlightAreas,
        quote: props.selectedText,
        color,
        pageIndexes: props.highlightAreas.map(a => a.pageIndex),
      }, color);
      setNoteId(noteId + 1);
      setNoteColor(color);
      props.cancel();
    }
  };
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(0, 0, 0, .3)',
        borderRadius: '2px',
        padding: '8px',
        position: 'absolute',
        left: `${props.selectionRegion.left}%`,
        top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
        zIndex: 20,
        minWidth: 200,
      }}
    >
      <textarea
        rows={3}
        className="w-full border rounded p-1 mb-2"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Nhập ghi chú cho đoạn highlight này (bắt buộc cho AI)"
      />
      <div className="flex items-center gap-2 mb-2">
        <span>Màu:</span>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
      </div>
      <button className="px-3 py-1 bg-green-500 text-white rounded mr-2" onClick={addNote}>Lưu</button>
      <button className="px-3 py-1 bg-gray-300 rounded" onClick={props.cancel}>Huỷ</button>
    </div>
  );
};

// Đảm bảo hàm mapPlainOffsetToMarkupOffset tồn tại
function mapPlainOffsetToMarkupOffset(markup: string, plainOffset: number, plainText: string): number {
  let markupIdx = 0, plainIdx = 0;
  while (markupIdx < markup.length && plainIdx < plainOffset) {
    // Bỏ qua tag custom **, //, __
    if (markup[markupIdx] === '*' && markup[markupIdx+1] === '*') { markupIdx += 2; continue; }
    if (markup[markupIdx] === '/' && markup[markupIdx+1] === '/') { markupIdx += 2; continue; }
    if (markup[markupIdx] === '_' && markup[markupIdx+1] === '_') { markupIdx += 2; continue; }
    // Bỏ qua ký hiệu xuống dòng %%
    if (markup[markupIdx] === '%' && markup[markupIdx+1] === '%') { markupIdx += 2; plainIdx++; continue; }
    // Bỏ qua tag HTML <...>
    if (markup[markupIdx] === '<') {
      const close = markup.indexOf('>', markupIdx);
      if (close !== -1) {
        markupIdx = close + 1;
        continue;
      }
    }
    // Nếu là \r\n hoặc \n\r, chỉ tính 1 plainIdx
    if ((markup[markupIdx] === '\r' && markup[markupIdx+1] === '\n') || (markup[markupIdx] === '\n' && markup[markupIdx+1] === '\r')) {
      markupIdx += 2;
      plainIdx++;
      continue;
    }
    // Nếu là \n hoặc \r, tính 1 plainIdx
    if (markup[markupIdx] === '\n' || markup[markupIdx] === '\r') {
      markupIdx++;
      plainIdx++;
      continue;
    }
    // Nếu ký tự khớp, tăng cả hai
    if (plainText[plainIdx] === markup[markupIdx]) {
      markupIdx++;
      plainIdx++;
      continue;
    }
    // Nếu không khớp, chỉ tăng markupIdx (bỏ qua ký tự markup không xuất hiện trong plain)
    markupIdx++;
  }
  return markupIdx;
}

const PdfLearnStudy: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<{paragraph: number, start: number, end: number, color: string}[]>([]);
  const [highlightedMarkdown, setHighlightedMarkdown] = useState(''); // markdown phụ để gửi AI
  const [selection, setSelection] = useState<{paragraph: number, start: number, end: number, text: string} | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfData, setPdfData] = useState<string | Uint8Array | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    const md = localStorage.getItem('pdf_learn_markdown') || '';
    setMarkdown(md);
    const paras = md.split(/\n{2,}/g);
    setParagraphs(paras);
    // Load highlight từ localStorage nếu có
    const highlightsStr = localStorage.getItem('pdf_learn_highlights');
    if (highlightsStr) {
      try {
        setHighlights(JSON.parse(highlightsStr));
      } catch {}
    }
    // Lấy file PDF từ IndexedDB để xem gốc
    get('pdf_learn_file').then(async (file) => {
      if (!file) {
        setPdfData(null);
        return;
      }
      if (file instanceof File) {
        const ab = await file.arrayBuffer();
        setPdfData(new Uint8Array(ab));
      } else if (file instanceof ArrayBuffer) {
        setPdfData(new Uint8Array(file));
      } else if (file instanceof Uint8Array) {
        setPdfData(file);
      } else {
        setPdfData(null);
      }
    });
  }, []);

  // Bắt sự kiện select text để hiện popup chọn màu
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selectionObj = window.getSelection();
      if (!selectionObj || !selectionObj.toString()) {
        setShowColorPicker(false);
        setSelection(null);
        return;
      }
      // Luôn hiện popup khi có selection (không chỉ double click)
      for (let i = 0; i < paragraphs.length; i++) {
        const ref = document.getElementById(`para-${i}`);
        if (!ref) continue;
        if (selectionObj.anchorNode && ref.contains(selectionObj.anchorNode)) {
          const range = selectionObj.getRangeAt(0);
          let preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(ref);
          preCaretRange.setEnd(range.startContainer, range.startOffset);
          const startPlain = preCaretRange.toString().length;
          const endPlain = startPlain + range.toString().length;
          const paraMarkup = paragraphs[i];
          const plainText = ref.textContent || '';
          const start = mapPlainOffsetToMarkupOffset(paraMarkup, startPlain, plainText);
          const end = mapPlainOffsetToMarkupOffset(paraMarkup, endPlain, plainText);
          setSelection({ paragraph: i, start, end, text: range.toString() });
          setShowColorPicker(true);
          setColorPickerPos({ x: e.clientX, y: e.clientY });
          return;
        }
      }
      setShowColorPicker(false);
      setSelection(null);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [paragraphs]);

  // Hàm highlight với màu
  const handleHighlightColor = (colorName: string) => {
    if (!selection) return;
    const { paragraph, start, end } = selection;
    // Nếu đã có highlight cùng vị trí và màu, thì xóa
    const existsIdx = highlights.findIndex(h => h.paragraph === paragraph && h.start === start && h.end === end && h.color === colorName);
    let newHighlights;
    if (existsIdx !== -1) {
      newHighlights = highlights.slice(0, existsIdx).concat(highlights.slice(existsIdx + 1));
    } else {
      // Tránh highlight lồng nhau trong cùng đoạn
      if (highlights.some(h => h.paragraph === paragraph && (start < h.end && end > h.start))) {
        setShowColorPicker(false);
        setSelection(null);
        window.getSelection()?.removeAllRanges();
        return;
      }
      newHighlights = [...highlights, { paragraph, start, end, color: colorName }].sort((a, b) => a.paragraph - b.paragraph || a.start - b.start);
    }
    setHighlights(newHighlights);
    localStorage.setItem('pdf_learn_highlights', JSON.stringify(newHighlights));
    setShowColorPicker(false);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  // Custom render highlight màu trong markdown (dựa vào highlights)
  function renderers() {
    return {
      p: (props: any) => {
        // Tìm index đoạn hiện tại dựa trên paragraphs
        const text = props.children[0];
        const paraIdx = paragraphs.findIndex(p => p === text);
        const paraHighlights = highlights.filter(h => h.paragraph === paraIdx);
        if (!paraHighlights.length) return <p>{text}</p>;
        let out: React.ReactNode[] = [];
        let lastIndex = 0;
        paraHighlights.forEach((h, idx) => {
          if (h.start > lastIndex) {
            out.push(text.slice(lastIndex, h.start));
          }
          const color = HIGHLIGHT_COLORS.find(c => c.name === h.color)?.color || '#ffe066';
          out.push(
            <mark key={idx} style={{ background: color, borderRadius: 3, padding: '0 2px' }}>{text.slice(h.start, h.end)}</mark>
          );
          lastIndex = h.end;
        });
        if (lastIndex < text.length) {
          out.push(text.slice(lastIndex));
        }
        return <p>{out}</p>;
      }
    };
  }

  // Gửi markdown + note cho AI
  const handleSubmit = async () => {
    if (!settings.geminiKey) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const prompt = `Bạn là AI chấm bài PDF. Đây là nội dung markdown đã được highlight (các đoạn được bọc bằng [color]...[/color]):\n${highlightedMarkdown}\n\nGhi chú của người dùng (bắt buộc tuân thủ):\n${noteInput}`;
      const res = await gemini.generateContent(prompt);
      setAiResult(res || '');
    } catch (e: any) {
      setAiError('Lỗi khi nộp bài: ' + (e.message || 'Không xác định'));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">PDF Study</h1>
        <button className="text-blue-500 underline" onClick={() => navigate('/learn/pdf')}>Quay lại upload</button>
      </div>
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0 bg-white border rounded-lg p-4 shadow flex flex-col relative">
          <div className="mb-2 font-semibold">Markdown Preview (bôi đen để highlight, chọn màu)</div>
          <div>
            {paragraphs.map((para, idx) => {
              const paraHighlights = highlights.filter(h => h.paragraph === idx);
              let out: React.ReactNode[] = [];
              let lastIndex = 0;
              paraHighlights.forEach((h, hidx) => {
                if (h.start > lastIndex) {
                  out.push(para.slice(lastIndex, h.start));
                }
                const color = HIGHLIGHT_COLORS.find(c => c.name === h.color)?.color || '#ffe066';
                out.push(
                  <mark key={hidx} style={{ background: color, borderRadius: 3, padding: '0 2px' }}>{para.slice(h.start, h.end)}</mark>
                );
                lastIndex = h.end;
              });
              if (lastIndex < para.length) {
                out.push(para.slice(lastIndex));
              }
              return <p key={idx}>{out}</p>;
            })}
          </div>
          {showColorPicker && selection && (
            <div style={{ position: 'fixed', left: colorPickerPos.x, top: colorPickerPos.y, zIndex: 1000 }} className="bg-white border rounded shadow p-2 flex gap-2">
              {HIGHLIGHT_COLORS.map(c => (
                <button key={c.name} style={{ background: c.color, width: 28, height: 28, borderRadius: '50%', border: '2px solid #ccc' }} title={c.label} onClick={() => handleHighlightColor(c.name)} />
              ))}
            </div>
          )}
          <button
            className="px-4 py-2 rounded bg-gray-500 text-white font-semibold hover:bg-gray-600 mt-4"
            onClick={() => setShowPdfModal(true)}
          >
            Xem PDF gốc
          </button>
          {showPdfModal && pdfData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full relative">
                <button className="absolute top-2 right-2 text-xl" onClick={() => setShowPdfModal(false)}>×</button>
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer fileUrl={pdfData} />
                </Worker>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-96 flex-shrink-0 bg-white border rounded-lg p-4 h-fit self-start">
          <div className="mb-2 font-semibold">Note tổng hợp cho AI (bắt buộc tuân thủ)</div>
          <textarea
            className="w-full h-32 border rounded p-2 mb-2"
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            placeholder="Nhập ghi chú, yêu cầu, tiêu chí chấm bài..."
          />
          <button className="w-full px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 mb-2" onClick={handleSubmit} disabled={aiLoading || !markdown}>Nộp bài cho AI</button>
          {aiLoading && <div className="text-blue-500">Đang xử lý...</div>}
          {aiError && <div className="text-red-500">{aiError}</div>}
          {aiResult && <div className="mt-2 p-2 border rounded bg-gray-50 whitespace-pre-wrap text-sm">{aiResult}</div>}
        </div>
      </div>
      {/* Popup fixed bên phải */}
      <div
        style={{
          position: 'fixed',
          top: 120,
          right: 32,
          zIndex: 2000,
        }}
      >
        <button
          className="px-3 py-2 bg-red-500 text-white rounded shadow-lg hover:bg-red-600 transition-all"
          onClick={() => {
            setHighlights([]);
            setHighlightedMarkdown('');
            localStorage.removeItem('pdf_learn_highlights');
          }}
        >
          Clear highlight
        </button>
      </div>
    </div>
  );
};

export default PdfLearnStudy; 