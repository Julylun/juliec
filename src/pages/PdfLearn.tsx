import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { set } from 'idb-keyval';

const PdfLearn: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      // Lưu file vào IndexedDB
      set('pdf_learn_file', f);
      localStorage.setItem('pdf_learn_file_name', f.name);
    } else {
      setFile(null);
      setPreviewUrl(null);
      localStorage.removeItem('pdf_learn_file_name');
      set('pdf_learn_file', null);
    }
  };

  const handleLearn = () => {
    if (file) {
      navigate('/learn/pdf/learn');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">PDF Learning</h1>
        <p className="text-[var(--text-secondary)]">Upload file PDF để bắt đầu học</p>
      </div>
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
      {file && (
        <button
          className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 mb-4"
          onClick={async () => {
            setFile(null);
            setPreviewUrl(null);
            localStorage.removeItem('pdf_learn_file_name');
            localStorage.removeItem('pdf_learn_notes');
            localStorage.removeItem('pdf_learn_highlights');
            // Xóa file PDF khỏi IndexedDB
            const { del } = await import('idb-keyval');
            del('pdf_learn_file');
            // Nếu có thêm key khác liên quan note/highlight, xóa luôn
            del('pdf_learn_notes');
            del('pdf_learn_highlights');
          }}
        >
          Xóa cache PDF
        </button>
      )}
      {file && (
        <div className="mb-4 w-full max-w-2xl">
          <div className="font-semibold mb-2">Preview:</div>
          <iframe
            src={previewUrl || ''}
            title="PDF Preview"
            className="w-full h-[500px] border rounded shadow"
          />
        </div>
      )}
      <button
        className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
        onClick={handleLearn}
        disabled={!file}
      >
        Learn
      </button>
    </div>
  );
};

export default PdfLearn; 