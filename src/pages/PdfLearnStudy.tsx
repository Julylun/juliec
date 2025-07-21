import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { highlightPlugin, MessageIcon, RenderHighlightTargetProps, RenderHighlightContentProps, RenderHighlightsProps, HighlightArea } from '@react-pdf-viewer/highlight';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import { get } from 'idb-keyval';

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

const PdfLearnStudy: React.FC = () => {
  const [pdfData, setPdfData] = useState<string | Uint8Array | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [noteColor, setNoteColor] = useState('#ffe066');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [noteId, setNoteId] = useState(1);

  useEffect(() => {
    // Lấy file PDF từ IndexedDB
    get('pdf_learn_file').then(async (file) => {
      if (!file) {
        setPdfData(null);
        return;
      }
      if (file instanceof File) {
        // Đọc file thành ArrayBuffer
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

  // Highlight plugin setup (giữ nguyên như cũ)
  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget: (props: RenderHighlightTargetProps) => (
      <div
        style={{
          background: '#eee',
          display: 'flex',
          position: 'absolute',
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
          transform: 'translate(0, 8px)',
          zIndex: 10,
        }}
      >
        <button
          className="px-2 py-1 bg-yellow-400 rounded text-xs font-semibold mr-2"
          onClick={props.toggle}
        >
          <MessageIcon /> Highlight
        </button>
      </div>
    ),
    renderHighlightContent: (props: RenderHighlightContentProps) => (
      <HighlightContent
        props={props}
        noteColor={noteColor}
        onAdd={(note, color) => {
          setNotes(prev => [...prev, note]);
        }}
        noteId={noteId}
        setNoteId={setNoteId}
        setNoteColor={setNoteColor}
      />
    ),
    renderHighlights: (props: RenderHighlightsProps) => (
      <div>
        {notes.map(note => (
          <React.Fragment key={note.id}>
            {note.highlightAreas
              .filter(area => area.pageIndex === props.pageIndex)
              .map((area, idx) => (
                <div
                  key={idx}
                  style={Object.assign(
                    {},
                    {
                      background: note.color,
                      opacity: 0.4,
                      borderRadius: 2,
                    },
                    props.getCssProperties(area, props.rotation)
                  )}
                  title={note.content}
                />
              ))}
          </React.Fragment>
        ))}
      </div>
    ),
  });

  // Dịch tất cả highlight (giữ nguyên)
  const handleTranslate = async () => {
    if (!settings.geminiKey) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const allText = notes.map(n => n.quote).join('\n');
      const prompt = `Dịch các đoạn sau sang tiếng Việt:\n${allText}`;
      const res = await gemini.generateContent(prompt);
      setAiResult(res || '');
    } catch (e: any) {
      setAiError('Lỗi khi dịch: ' + (e.message || 'Không xác định'));
    } finally {
      setAiLoading(false);
    }
  };

  // Nộp bài cho AI (giữ nguyên)
  const handleSubmit = async () => {
    if (!settings.geminiKey) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const prompt = `Bạn là AI chấm bài PDF. Người dùng đã highlight các đoạn sau với thông tin chi tiết:\n${notes.map(n => `- [Page ${n.pageIndexes.join(', ')} | Màu: ${n.color}]: ${n.quote}\nGhi chú: ${n.content}`).join('\n')}\n\nGhi chú tổng hợp của người dùng (bắt buộc tuân thủ):\n${noteInput}\n\nHãy chấm bài, nhận xét, hoặc thực hiện yêu cầu theo đúng note và highlight.`;
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
        <div className="flex-1 min-w-0 bg-white border rounded-lg p-4 shadow flex flex-col">
          <div className="mb-2 font-semibold">PDF Viewer</div>
          {pdfData ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfData} plugins={[highlightPluginInstance]} />
            </Worker>
          ) : (
            <div className="text-gray-400 text-center py-12">Chưa có file PDF. Vui lòng upload lại.</div>
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
          <button className="w-full px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 mb-2" onClick={handleSubmit} disabled={aiLoading || notes.length === 0}>Nộp bài cho AI</button>
          <div className="mb-2 font-semibold">Dịch tất cả highlight</div>
          <button className="w-full px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600 mb-2" onClick={handleTranslate} disabled={aiLoading || notes.length === 0}>Dịch tất cả highlight</button>
          {aiLoading && <div className="text-blue-500">Đang xử lý...</div>}
          {aiError && <div className="text-red-500">{aiError}</div>}
          {aiResult && <div className="mt-2 p-2 border rounded bg-gray-50 whitespace-pre-wrap text-sm">{aiResult}</div>}
          <div className="mt-4">
            <div className="font-semibold mb-1">Danh sách highlight:</div>
            <ul className="list-disc pl-5">
              {notes.map((n, i) => (
                <li key={n.id} style={{ background: n.color, display: 'inline-block', padding: '2px 6px', borderRadius: 4, margin: 2 }}>
                  <b>Page {n.pageIndexes.join(', ')}:</b> {n.quote} <br />
                  <span className="text-xs">{n.content}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfLearnStudy; 