import React from 'react';

interface ExportImportButtonsProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExportImportButtons: React.FC<ExportImportButtonsProps> = ({ onExport, onImport }) => (
  <div className="flex gap-2 mb-2 w-full max-w-3xl">
    <button
      onClick={onExport}
      className="px-4 py-2 rounded-lg bg-[var(--button-bg)] text-[var(--button-text)] hover:bg-[var(--button-bg-hover)] border border-[var(--border-color)]"
    >
      Xuất JSON
    </button>
    <label className="px-4 py-2 rounded-lg bg-[var(--button-bg)] text-[var(--button-text)] hover:bg-[var(--button-bg-hover)] border border-[var(--border-color)] cursor-pointer">
      Nhập JSON
      <input type="file" accept="application/json" onChange={onImport} className="hidden" />
    </label>
  </div>
);

export default ExportImportButtons; 