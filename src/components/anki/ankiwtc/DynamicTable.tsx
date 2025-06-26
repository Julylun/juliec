import React, { useRef } from 'react';
import CircleButton from './CircleButton';

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

  const addColumn = () => {
    const newColName = `Column ${columns.length + 1}`;
    const newColumns = [...columns, newColName];
    const newRows = rows.map(row => [...row, '']);
    setColumns(newColumns);
    setRows(newRows);
    if (options?.onChange) options.onChange({ columns: newColumns, rows: newRows });
    setTimeout(() => {
      inputRefs.current[newColumns.length - 1]?.focus();
      inputRefs.current[newColumns.length - 1]?.select();
    }, 0);
  };

  const deleteColumn = (colIdx: number) => {
    if (columns.length <= 1) return;
    const newColumns = columns.filter((_, idx) => idx !== colIdx);
    const newRows = rows.map(row => row.filter((_, idx) => idx !== colIdx));
    setColumns(newColumns);
    setRows(newRows);
    if (options?.onChange) options.onChange({ columns: newColumns, rows: newRows });
  };

  const addRow = () => {
    if (options?.disableAddRow) return;
    if (options?.singleRowOnly && rows.length >= 1) return;
    const newRows = [...rows, Array(columns.length).fill('')];
    setRows(newRows);
    if (options?.onChange) options.onChange({ columns, rows: newRows });
  };

  const handleColumnNameChange = (idx: number, value: string) => {
    const newCols = [...columns];
    newCols[idx] = value;
    setColumns(newCols);
    if (options?.onChange) options.onChange({ columns: newCols, rows });
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = rows.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? value : cell)) : row
    );
    setRows(newRows);
    if (options?.onChange) options.onChange({ columns, rows: newRows });
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
          <tr className="h-full flex justify-center items-center flex-row">
            {table.columns.map((col, idx) => (
              <th key={idx} className="p-2 border-b border-[var(--border-color)] relative group h-full flex justify-center items-center flex-row">
                <input
                  ref={el => { table.inputRefs.current[idx] = el; }}
                  className="font-semibold text-center bg-transparent border-b border-dashed border-[var(--border-color)] focus:outline-none focus:border-blue-500"
                  value={col}
                  onChange={e => table.handleColumnNameChange(idx, e.target.value)}
                />
                {table.columns.length > 1 && !props.options?.disableAddRow && idx > 0 && (
                  <button
                    onClick={() => table.deleteColumn(idx)}
                    className="w-3 h-3 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-30 hover:opacity-100 hover:cursor-pointer z-10"
                    title="Xóa cột"
                    tabIndex={-1}
                  >
                    ×
                  </button>
                )}
              </th>
            ))}
            <th className="p-2 flex items-center justify-center h-full">
              <CircleButton title="Xóa cột" icon="+" _function={() => { table.addColumn()}}/>
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIdx) => (
            <tr className='h-full flex justify-center items-center flex-row' key={rowIdx}>
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
        {!table.disableAddRow && !table.singleRowOnly && (
        <div className="flex justify-center mt-2">
          <CircleButton title="Thêm dòng" icon="+" _function={() => { table.addRow()}}/>
        
        </div>
      )}
      </table>
    </div>
  );
});

export default DynamicTable; 