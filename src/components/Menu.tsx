import React from 'react';
import { Link } from 'react-router-dom';
import Background from './Background';
import { useSettings } from '../contexts/SettingsContext';

const Menu: React.FC = () => {
  const { settings } = useSettings();
  const menuItems = [
    { 
      title: 'Learn', 
      path: '/learn',
      icon: '📚',
      description: 'Luyện tập TOEIC với các bài đọc và flashcard'
    },
    { 
      title: 'Library', 
      path: '/library',
      icon: '📖',
      description: 'Quản lý từ vựng và bộ sưu tập của bạn'
    },
    { 
      title: 'Setting', 
      path: '/setting',
      icon: '⚙️',
      description: 'Tùy chỉnh giao diện và cài đặt ứng dụng'
    },
    { 
      title: 'About', 
      path: '/about',
      icon: '👨‍💻',
      description: 'Thông tin về ứng dụng và nhà phát triển'
    },
  ];

  return (
    <>
      <Background />
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-4 md:p-8">
        <div className="text-center mb-12">
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
        </nav>
      </div>
    </>
  );
};

export default Menu; 