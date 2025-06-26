import React from 'react';

interface DataManagementProps {
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onExportData, onImportData }) => {
  return (
    <div className="mb-8 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Quản lý dữ liệu</h2>
      <div className="space-y-4">
        <div>
          <button
            onClick={onExportData}
            className="w-full p-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-primary)] hover:border-[var(--text-secondary)] transition-colors"
          >
            Xuất dữ liệu
          </button>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Tải xuống tất cả dữ liệu của bạn dưới dạng file JSON
          </p>
        </div>
        <div>
          <label className="w-full">
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
            <div className="w-full p-3 rounded-lg border border-[var(--border-color)] text-center text-[var(--text-primary)] bg-[var(--bg-primary)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer">
              Nhập dữ liệu
            </div>
          </label>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Nhập dữ liệu từ file JSON đã xuất trước đó
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataManagement; 