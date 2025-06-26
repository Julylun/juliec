import React, { useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { GeminiService } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/anki/ankiwtc/BackButton';
import Title from '../components/anki/ankiwtc/Title';
import ExportImportButtons from '../components/anki/ankiwtc/ExportImportButtons';
import NoteArea from '../components/anki/ankiwtc/NoteArea';
import DynamicTable from '../components/anki/ankiwtc/DynamicTable';

const DEFAULT_COLS = ['Column 1'];
const DEFAULT_ROWS = [['']];

function toTabCSV(columns: string[], rows: string[][]): string {
  const header = columns.join('\t');
  const body = rows.map(row => row.join('\t')).join('\n');
  return header + (body ? '\n' + body : '');
}

const AnkiWTC: React.FC = () => {
  const table1Ref = useRef<any>(null);
  const table2Ref = useRef<any>(null);
  const { settings } = useSettings();
  const [csvResult, setCsvResult] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [table2Data, setTable2Data] = useState<{ columns: string[]; rows: string[][] }>({ columns: [...DEFAULT_COLS], rows: [...DEFAULT_ROWS] });
  const [table2Key, setTable2Key] = useState(0); // for remounting on import
  const navigate = useNavigate();

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedNote = localStorage.getItem('ankiwtc_note');
    const savedTable2 = localStorage.getItem('ankiwtc_table2');
    if (savedNote) setNote(savedNote);
    if (savedTable2) {
      try {
        const data = JSON.parse(savedTable2);
        if (data && data.columns && data.rows) setTable2Data(data);
      } catch {}
    }
  }, []);

  // Save note to localStorage
  React.useEffect(() => {
    localStorage.setItem('ankiwtc_note', note);
  }, [note]);

  // Save table2 to localStorage
  React.useEffect(() => {
    localStorage.setItem('ankiwtc_table2', JSON.stringify(table2Data));
  }, [table2Data]);

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      note,
      table2: table2Data,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ankiwtc.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data.note === 'string' && data.table2 && Array.isArray(data.table2.columns) && Array.isArray(data.table2.rows)) {
          setNote(data.note);
          setTable2Data(data.table2);
          setTable2Key(prev => prev + 1); // remount table2
        } else {
          alert('File không đúng định dạng!');
        }
      } catch {
        alert('File không đúng định dạng!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConvert = async () => {
    setLoading(true);
    const data1 = table1Ref.current?.getData();
    const data2 = table2Data;
    const csv1 = toTabCSV(data1.columns, data1.rows);
    const csv2 = toTabCSV(data2.columns, data2.rows); // bảng 2 có 1 record ý nghĩa
    // Prompt theo yêu cầu
    const prompt = `Bây giờ tôi sẽ gửi cho bạn một danh sách từ vựng tiếng Anh trong <provide> dưới dạng csv trong đó hàng đầu là tên các cột từ vựng được cung cấp và các hàng khác là từ vựng hay dữ liệu liên quan, nhiệm vụ của bạn là:\n- Dựa vào từ vựng được cung cấp trong dấu tạo ra một đoạn mã CSV với các cột được đặt trong thẻ <form> dưới dạng csv trong đó hàng đầu là tên cột, hàng hai là ý nghĩa của các cột, kí hiệu của csv là tab.\n- Nếu có note trong thẻ <note> thì phải tuân thủ hoàn toàn note đó khi tạo dữ liệu.\n- Lưu ý:\n + Đảm bảo không đưa ra bất kỳ thông tin nào ngoài đoạn mã CSV.\n + Các ô trong CSV phải cách nhau bằng dấu ~.\n\n<provide>\n${csv1}\n</provide>\n<form>\n${csv2}\n</form>${note ? `\n<note>\n${note}\n</note>` : ''}`;
    try {
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const result = await gemini.generateContent(prompt);
      if (result) {
        let csv = result.replace(/~/g, '\t');
        csv = csv.split('\n').slice(1).join('\n');
        setCsvResult(csv);
      } else {
        setCsvResult(null);
      }
      console.debug('Gemini result:', result);
    } catch (e) {
      setCsvResult(null);
      console.error('Gemini error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!csvResult) return;
    const blob = new Blob([csvResult], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anki.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-4 relative">
      <BackButton onClick={() => navigate(-1)} />
      <Title title="Word To CSV" description="Chuyển đổi danh sách từ vựng sang file CSV cho Anki." />

      <DynamicTable ref={table1Ref} options={{ loading }} />
      <DynamicTable
        key={table2Key}
        ref={table2Ref}
        options={{ disableAddRow: true, singleRowOnly: true, loading, initialData: table2Data, onChange: setTable2Data }}
      />
      <NoteArea note={note} setNote={setNote} loading={loading} />
      <ExportImportButtons onExport={handleExportJSON} onImport={handleImportJSON} />
      <button
        onClick={handleConvert}
        className="mt-4 px-8 py-3 rounded-lg bg-[var(--button-success-bg)] text-[var(--button-text)] font-semibold text-lg hover:bg-[var(--button-success-bg-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading && (
          <span className="w-5 h-5 border-2 border-[var(--button-bg)] border-t-transparent rounded-full animate-spin inline-block"></span>
        )}
        {loading ? 'Đang chuyển đổi...' : 'Convert'}
      </button>
      {csvResult && (
        <button
          onClick={handleDownload}
          className="mt-4 px-8 py-3 rounded-lg bg-[var(--button-accent-bg)] text-[var(--button-text)] font-semibold text-lg hover:bg-[var(--button-accent-bg-hover)] transition-colors"
          disabled={loading}
        >
          Download CSV
        </button>
      )}
    </div>
  );
};

export default AnkiWTC; 