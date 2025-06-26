import React from 'react';
import { useNavigate } from 'react-router-dom';

const Anki: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-4">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Anki</h1>
      <p className="text-lg text-[var(--text-secondary)] text-center max-w-xl mb-8">
        Hỗ trợ tạo và quản lý từ vựng trên ứng dụng Anki
      </p>
      <div className="w-full max-w-xs flex flex-col gap-4">
        <button
          className="w-full p-4 rounded-lg bg-blue-500 text-white font-semibold text-lg hover:bg-blue-600 transition-colors"
          onClick={() => navigate('/anki/wtc')}
        >
          Word To CSV
        </button>
      </div>
    </div>
  );
};

export default Anki; 