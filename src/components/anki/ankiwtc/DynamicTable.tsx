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
  // selectedCell: { row: number, col: number, isHeader: boolean }
  // row: -1 là header
  const [selectedCell, setSelectedCell] = React.useState<{ row: number; col: number; isHeader: boolean } | null>(null);
  const [editMode, setEditMode] = React.useState(false);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (selectedCell && editMode && !selectedCell.isHeader) {
      const { row, col } = selectedCell;
      const input = document.getElementById(`cell-input-${row}-${col}`) as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    }
    if (selectedCell && editMode && selectedCell.isHeader) {
      const input = document.getElementById(`header-input-${selectedCell.col}`) as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }, [selectedCell, editMode]);

  // Keyboard navigation
  const handleTableKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectedCell) return;
    if (editMode) {
      // Edit mode
      if (e.key === 'Enter') {
        e.preventDefault();
        // Move to next cell (left to right, top to bottom)
        let { row, col, isHeader } = selectedCell;
        if (isHeader) {
          // Move to first cell in first row
          setSelectedCell({ row: 0, col: 0, isHeader: false });
        } else {
          if (col < table.columns.length - 1) {
            setSelectedCell({ row, col: col + 1, isHeader: false });
          } else if (row < table.rows.length - 1) {
            setSelectedCell({ row: row + 1, col: 0, isHeader: false });
          } else {
            // End of table, exit edit mode
            setEditMode(false);
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditMode(false);
      }
      // Arrow keys: để input xử lý
      return;
    } else {
      // Visual mode
      let { row, col, isHeader } = selectedCell;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isHeader) {
          if (col < table.columns.length - 1) setSelectedCell({ row: -1, col: col + 1, isHeader: true });
        } else {
          if (col < table.columns.length - 1) setSelectedCell({ row, col: col + 1, isHeader: false });
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isHeader) {
          if (col > 0) setSelectedCell({ row: -1, col: col - 1, isHeader: true });
        } else {
          if (col > 0) setSelectedCell({ row, col: col - 1, isHeader: false });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (isHeader) {
          setSelectedCell({ row: 0, col, isHeader: false });
        } else {
          if (row < table.rows.length - 1) setSelectedCell({ row: row + 1, col, isHeader: false });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isHeader) {
          if (row > 0) setSelectedCell({ row: row - 1, col, isHeader: false });
          else setSelectedCell({ row: -1, col, isHeader: true });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setEditMode(true);
      }
    }
  };

  // Blur input when editing ends
  const handleInputBlur = () => {
    setEditMode(false);
  };

  // Initial select first cell if none
  React.useEffect(() => {
    if (!selectedCell && table.columns.length > 0 && table.rows.length > 0) {
      setSelectedCell({ row: 0, col: 0, isHeader: false });
    }
  }, [selectedCell, table.columns.length, table.rows.length]);

  React.useImperativeHandle(ref, () => ({ getData: table.getData }));

  return (
    <div className="overflow-x-auto w-full max-w-3xl mb-8" tabIndex={0} onKeyDown={handleTableKeyDown}>
      <table className="min-w-full border border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-lg">
        <thead>
          <tr className="h-full flex justify-center items-center flex-row">
            {table.columns.map((col, idx) => {
              const isSelected = selectedCell && selectedCell.isHeader && selectedCell.col === idx;
              return (
                <th key={idx} className={`p-2 border-b border-[var(--border-color)] relative group h-full flex justify-center items-center flex-row ${isSelected ? 'bg-yellow-200' : ''}`}
                  onClick={() => {
                    setSelectedCell({ row: -1, col: idx, isHeader: true });
                    setEditMode(false);
                  }}
                >
                  <input
                    id={`header-input-${idx}`}
                    ref={el => { table.inputRefs.current[idx] = el; }}
                    className={`font-semibold text-center bg-transparent border-b border-dashed border-[var(--border-color)] focus:outline-none focus:border-blue-500 ${isSelected && editMode ? 'ring-2 ring-blue-400' : ''}`}
                    value={col}
                    onChange={e => table.handleColumnNameChange(idx, e.target.value)}
                    onFocus={() => {
                      setSelectedCell({ row: -1, col: idx, isHeader: true });
                      setEditMode(true);
                    }}
                    onBlur={handleInputBlur}
                    tabIndex={isSelected ? 0 : -1}
                    readOnly={!(isSelected && editMode)}
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
              );
            })}
            <th className="p-2 flex items-center justify-center h-full">
              <CircleButton title="Xóa cột" icon="+" _function={() => { table.addColumn()}}/>
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIdx) => (
            <tr className='h-full flex justify-center items-center flex-row' key={rowIdx}>
              {row.map((cell, colIdx) => {
                const isSelected = selectedCell && !selectedCell.isHeader && selectedCell.row === rowIdx && selectedCell.col === colIdx;
                return (
                  <td key={colIdx} className={`p-2 border-b border-[var(--border-color)] ${isSelected ? 'bg-yellow-100' : ''}`}
                    onClick={() => {
                      setSelectedCell({ row: rowIdx, col: colIdx, isHeader: false });
                      setEditMode(false);
                    }}
                  >
                    <input
                      id={`cell-input-${rowIdx}-${colIdx}`}
                      className={`w-full bg-transparent border-b border-dashed border-[var(--border-color)] focus:outline-none focus:border-blue-500 ${isSelected && editMode ? 'ring-2 ring-blue-400' : ''}`}
                      value={cell}
                      onChange={e => table.handleCellChange(rowIdx, colIdx, e.target.value)}
                      disabled={table.disableAddRow && !table.singleRowOnly}
                      onFocus={() => {
                        setSelectedCell({ row: rowIdx, col: colIdx, isHeader: false });
                        setEditMode(true);
                      }}
                      onBlur={handleInputBlur}
                      tabIndex={isSelected ? 0 : -1}
                      readOnly={!(isSelected && editMode)}
                    />
                  </td>
                );
              })}
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