import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_VERSION, RELEASE_DATE, VERSION_UPDATES } from '../constants/appInfo';

const VersionInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Nút hiển thị thông tin phiên bản */}
      <button
        onClick={togglePopup}
        className="fixed bottom-4 left-4 z-40 p-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors shadow-lg"
        aria-label="Thông tin phiên bản"
      >
        <span className="text-xl">ℹ️</span>
      </button>

      {/* Popup thông tin phiên bản */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={togglePopup}
            ></div>
            <div className="relative w-full max-w-md bg-[var(--bg-primary)] rounded-lg shadow-xl border border-[var(--border-color)] overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  Thông tin phiên bản
                </h2>
                <button 
                  onClick={togglePopup}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">
                    Phiên bản {APP_VERSION}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Cập nhật ngày {new Date(RELEASE_DATE).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                {VERSION_UPDATES.map((section, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="font-medium text-[var(--text-primary)] mb-2">
                      {section.title}
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-[var(--text-secondary)]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="mt-6 mb-2">
                  <h4 className="font-medium text-[var(--text-primary)] mb-2">
                    Tiêu chuẩn tiếng Anh được hỗ trợ
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
                      TOEIC
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium flex items-center">
                      IELTS
                      <span className="ml-1 px-1 text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded">
                        Beta
                      </span>
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium flex items-center">
                      CEFR
                      <span className="ml-1 px-1 text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded">
                        Beta
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-[var(--border-color)] text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  © {new Date().getFullYear()} JULIEC - Học tiếng Anh thông minh
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VersionInfo; 