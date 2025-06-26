import React, { useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { GeminiService } from '../services/geminiService';
import Arrow from '../components/icons/Arrow';
import { useNavigate } from 'react-router-dom';

const DEFAULT_COLS = ['Column 1'];
const DEFAULT_ROWS = [['']];

const useDynamicTable = (options?: { disableAddRow?: boolean; singleRowOnly?: boolean }) => {
  const [columns, setColumns] = useState<string[]>([...DEFAULT_COLS]);
  const [rows, setRows] = useState<string[][]>([...DEFAULT_ROWS]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addColumn = () => {
    const newColName = `Column ${columns.length + 1}`;
    setColumns(prev => {
      setTimeout(() => {
        // Focus và select input của cột mới
        inputRefs.current[prev.length]?.focus();
        inputRefs.current[prev.length]?.select();
      }, 0);
      return [...prev, newColName];
    });
    setRows(rows.map(row => [...row, '']));
  };

  const deleteColumn = (colIdx: number) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((_, idx) => idx !== colIdx));
    setRows(rows.map(row => row.filter((_, idx) => idx !== colIdx)));
  };

  const addRow = () => {
    if (options?.disableAddRow) return;
    if (options?.singleRowOnly && rows.length >= 1) return;
    setRows([...rows, Array(columns.length).fill('')]);
  };

  const handleColumnNameChange = (idx: number, value: string) => {
    const newCols = [...columns];
    newCols[idx] = value;
    setColumns(newCols);
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = rows.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? value : cell)) : row
    );
    setRows(newRows);
  };

  // Cho phép lấy dữ liệu bảng
  const getData = () => ({ columns, rows });

  return {
    columns,
    rows,
    addColumn,
    deleteColumn,
    addRow,
    handleColumnNameChange,
    handleCellChange,
    getData,
    inputRefs,
    disableAddRow: !!options?.disableAddRow,
    singleRowOnly: !!options?.singleRowOnly,
  };
};

function toTabCSV(columns: string[], rows: string[][]): string {
  const header = columns.join('\t');
  const body = rows.map(row => row.join('\t')).join('\n');
  return header + (body ? '\n' + body : '');
}

const DynamicTable = React.forwardRef((props: any, ref) => {
  const table = useDynamicTable(props.options);
  React.useImperativeHandle(ref, () => ({ getData: table.getData }));

  return (
    <div className="overflow-x-auto w-full max-w-3xl mb-8">
      <table className="min-w-full border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-lg">
        <thead>
          <tr>
            {table.columns.map((col, idx) => (
              <th key={idx} className="p-2 border-b border-[var(--border-color)] relative group">
                <input
                  ref={el => { table.inputRefs.current[idx] = el; }}
                  className="font-semibold text-center bg-transparent border-b border-dashed border-[var(--border-color)] focus:outline-none focus:border-blue-500"
                  value={col}
                  onChange={e => table.handleColumnNameChange(idx, e.target.value)}
                />
                {table.columns.length > 1 && !props.options?.disableAddRow && idx > 0 && (
                  <button
                    onClick={() => table.deleteColumn(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 z-10"
                    title="Xóa cột"
                    tabIndex={-1}
                  >
                    ×
                  </button>
                )}
              </th>
            ))}
            <th className="p-2">
              <button
                onClick={table.addColumn}
                className="w-8 h-8 rounded-full bg-[var(--button-bg)] text-[var(--button-text)] flex items-center justify-center hover:bg-[var(--button-bg-hover)]"
                title="Thêm cột"
              >
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => (
                <td key={colIdx} className="p-2 border-b border-[var(--border-color)]">
                  <input
                    className="w-full bg-transparent border-b border-dashed border-[var(--border-color)] focus:outline-none focus:border-blue-500"
                    value={cell}
                    onChange={e => table.handleCellChange(rowIdx, colIdx, e.target.value)}
                    disabled={table.disableAddRow && !table.singleRowOnly}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!table.disableAddRow && !table.singleRowOnly && (
        <div className="flex justify-center mt-2">
          <button
            onClick={table.addRow}
            className="w-8 h-8 rounded-full bg-[var(--button-bg)] text-[var(--button-text)] flex items-center justify-center hover:bg-[var(--button-bg-hover)]"
            title="Thêm dòng"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
});

const AnkiWTC: React.FC = () => {
  const table1Ref = useRef<any>(null);
  const table2Ref = useRef<any>(null);
  const { settings } = useSettings();
  const [csvResult, setCsvResult] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConvert = async () => {
    setLoading(true);
    const data1 = table1Ref.current?.getData();
    const data2 = table2Ref.current?.getData();
    const csv1 = toTabCSV(data1.columns, data1.rows);
    const csv2 = toTabCSV(data2.columns, data2.rows); // bảng 2 có 1 record ý nghĩa
    // Prompt theo yêu cầu
    const prompt = `Bây giờ tôi sẽ gửi cho bạn một danh sách từ vựng tiếng Anh trong <provide> dưới dạng csv trong đó hàng đầu là tên các cột từ vựng được cung cấp và các hàng khác là từ vựng hay dữ liệu liên quan, nhiệm vụ của bạn là:\n- Dựa vào từ vựng được cung cấp trong dấu tạo ra một đoạn mã CSV với các cột được đặt trong thẻ <form> dưới dạng csv trong đó hàng đầu là tên cột, hàng hai là ý nghĩa của các cột, kí hiệu của csv là tab.\n- Nếu có note trong thẻ <note> thì phải tuân thủ hoàn toàn note đó khi tạo dữ liệu.\n- Lưu ý:\n + Đảm bảo không đưa ra bất kỳ thông tin nào ngoài đoạn mã CSV.\n + Các ô trong CSV phải cách nhau bằng dấu ~.\n\n<provide>\n${csv1}\n</provide>\n<form>\n${csv2}\n</form>${note ? `\n<note>\n${note}\n</note>` : ''}`;
    try {
      const gemini = new GeminiService(settings.geminiKey, settings.geminiModel);
      const result = await gemini.generateContent(prompt);
      if (result) {
        // Lấy phần mã CSV từ kết quả, thay ~ thành tab, xóa dòng đầu (header)
        let csv = result.replace(/~/g, '\t');
        // Xóa dòng đầu tiên (header)
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
      {/* Nút back */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-40 p-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors shadow-lg"
        aria-label="Quay lại"
      >
        <Arrow className="w-6 h-6" />
      </button>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Word To CSV</h1>
      <p className="text-lg text-[var(--text-secondary)] text-center max-w-xl mb-8">
        Chuyển đổi danh sách từ vựng sang file CSV cho Anki.
      </p>
      <textarea
        className="w-full max-w-3xl mb-6 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
        rows={3}
        placeholder="Ghi chú cho LLM (nếu có)..."
        value={note}
        onChange={e => setNote(e.target.value)}
        disabled={loading}
      />
      <DynamicTable ref={table1Ref} options={{ loading }} />
      <DynamicTable ref={table2Ref} options={{ disableAddRow: true, singleRowOnly: true, loading }} />
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