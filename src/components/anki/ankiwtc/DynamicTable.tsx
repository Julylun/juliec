import React, { useRef } from 'react';

const DEFAULT_COLS = ['Column 1'];
const DEFAULT_ROWS = [['']];

const useDynamicTable = (options?: { disableAddRow?: boolean; singleRowOnly?: boolean; initialData?: { columns: string[]; rows: string[][] }, onChange?: (data: { columns: string[], rows: string[][] }) => void }) => {
  const [columns, setColumns] = React.useState<string[]>(options?.initialData?.columns || [...DEFAULT_COLS]);
  const [rows, setRows] = React.useState<string[][]>(options?.initialData?.rows || [...DEFAULT_ROWS]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when initialData changes (for import or reload)
  React.useEffect(() => {
    if (options?.initialData) {
      setColumns(options.initialData.columns);
      setRows(options.initialData.rows);
    }
    // eslint-disable-next-line
  }, [options?.initialData]);

  // Always call onChange when columns/rows change
  React.useEffect(() => {
    if (options?.onChange) options.onChange({ columns, rows });
    // eslint-disable-next-line
  }, [columns, rows]);

  const addColumn = () => {
    const newColName = `Column ${columns.length + 1}`;
    setColumns(prev => {
      setTimeout(() => {
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

export default DynamicTable; 