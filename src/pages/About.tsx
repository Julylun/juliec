import React from 'react';
import { useNavigate } from 'react-router-dom';
import Arrow from '../components/icons/Arrow';

const APP_VERSION = '0.1';

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label="Quay lại"
            >
              <Arrow className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Về JULIEC</h1>
          </div>
        </div>
        <div className="h-px w-full bg-[var(--border-color)] opacity-30"></div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-8 pt-4">
        <div className="space-y-8">
          {/* App Info */}
          <div className="p-6 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">JULIEC</h2>
              <span className="ml-2 text-sm text-[var(--text-secondary)]">v{APP_VERSION}</span>
            </div>
            <p className="text-[var(--text-secondary)] text-center mb-6">
              Ứng dụng học tiếng Anh thông minh với sự hỗ trợ của AI
            </p>
            <div className="flex justify-center">
              <a
                href="https://github.com/Julylun"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-500 hover:underline"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Tính năng</h3>
            <ul className="space-y-3 text-[var(--text-secondary)]">
              <li className="flex items-start">
                <span className="mr-2">📚</span>
                <span>Luyện đọc TOEIC với nội dung được tạo bởi AI</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📝</span>
                <span>Tra từ điển thông minh ngay trong bài đọc</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎯</span>
                <span>Tự động tạo câu hỏi và giải thích chi tiết</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💾</span>
                <span>Lưu trữ từ vựng đã học để ôn tập</span>
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div className="p-6 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Nhà phát triển</h3>
            <div className="flex items-center space-x-4">
              <img
                src="https://github.com/Julylun.png"
                alt="Julylun"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Julylun</h4>
                <p className="text-[var(--text-secondary)]">
                  Sinh viên tại Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn
                </p>
                <div className="mt-2 flex space-x-3">
                  <a
                    href="https://github.com/Julylun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 