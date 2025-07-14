import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const Learn: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const menuItems = [
    { 
      title: 'Reading', 
      path: '/learn/reading',
      icon: '📝',
      description: 'Luyện tập đọc hiểu với các bài đọc TOEIC'
    },
    { 
      title: 'Writing', 
      path: '/learn/writing',
      icon: '✍️',
      description: 'Luyện tập viết với các chủ đề TOEIC'
    },
    { 
      title: 'Listening', 
      path: '/learn/listening',
      icon: '🎧',
      description: 'Luyện tập nghe với các bài nghe TOEIC'
    },
    { 
      title: 'Flash Card', 
      path: '/learn/flashcard',
      icon: '🔄',
      description: 'Học từ vựng với thẻ ghi nhớ'
    },
    { 
      title: 'Translate', 
      path: '/learn/translate',
      icon: '🔠',
      description: 'Luyện tập dịch Anh-Việt với các chủ đề khác nhau'
    },
    {
      title: 'Tutor Agent',
      path: '/learn/tutor-agent',
      icon: '🤖',
      description: 'Tạo agent lên lịch trình học tập cá nhân hóa cho bạn'
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)]">JULIEC</h1>
        <p className="text-[var(--text-secondary)]">Toeic for yourself</p>
      </div>
      
      <nav className="w-full max-w-md mx-auto space-y-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="block w-full p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">{item.icon}</div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{item.title}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
        
        <button
          onClick={() => navigate('/')}
          className="w-full p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-4">🏠</div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Quay lại</h2>
              <p className="text-sm text-[var(--text-secondary)]">Trở về trang chính</p>
            </div>
          </div>
        </button>
      </nav>
    </div>
  );
};

export default Learn; 