import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VocabularyInfo } from '../data/vocabularyPrompt';
import { useVocabulary } from '../contexts/VocabularyContext';
import SpeakButton from './SpeakButton';

interface VocabularyPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  vocabularyInfo: VocabularyInfo | null;
  isLoading: boolean;
}

const VocabularyPopup: React.FC<VocabularyPopupProps> = ({
  word,
  position,
  onClose,
  vocabularyInfo,
  isLoading
}) => {
  const { addVocabulary, savedVocabulary } = useVocabulary();
  const [isSaved, setIsSaved] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState({ x: position.x, y: position.y });

  // Check if word is already saved
  useEffect(() => {
    if (vocabularyInfo && savedVocabulary.some(
      item => item.word.toLowerCase() === vocabularyInfo.word.toLowerCase()
    )) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [vocabularyInfo, savedVocabulary]);

  const handleSave = (e: React.MouseEvent) => {
    // Prevent event propagation to avoid triggering parent click events
    e.stopPropagation();
    
    if (vocabularyInfo) {
      addVocabulary(vocabularyInfo);
      setIsSaved(true);
    }
  };

  // Xử lý click bên ngoài popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Thêm event listener với một chút delay để tránh đóng popup ngay khi nó mở
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Tính toán vị trí để đảm bảo popup không vượt ra ngoài màn hình
  useEffect(() => {
    const calculatePosition = () => {
      if (!popupRef.current) return;
      
      const popupWidth = popupRef.current.offsetWidth;
      const popupHeight = popupRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Offset từ con trỏ
      const offsetX = 10;
      const offsetY = 10;
      
      let x = position.x + offsetX;
      let y = position.y + offsetY;
      
      // Đảm bảo popup không vượt ra khỏi bên phải màn hình
      if (x + popupWidth > windowWidth) {
        x = position.x - popupWidth - offsetX;
      }
      
      // Đảm bảo popup không vượt ra khỏi phía dưới màn hình
      if (y + popupHeight > windowHeight) {
        y = position.y - popupHeight - offsetY;
      }
      
      setPopupPosition({ x, y });
    };
    
    calculatePosition();
    
    // Thêm event listener để tính lại vị trí khi resize cửa sổ
    window.addEventListener('resize', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, [position, popupRef]);

  return (
    <AnimatePresence>
      <motion.div 
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="absolute bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--border-color)] w-72 z-50"
        style={{ 
          left: `${popupPosition.x}px`, 
          top: `${popupPosition.y}px`,
        }}
      >
        <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Từ vựng</h3>
          <button 
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-pulse text-[var(--text-primary)]">Translating...</div>
            </div>
          ) : vocabularyInfo ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-[var(--text-primary)]">{vocabularyInfo.word}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{vocabularyInfo.ipa}</p>
                </div>
                <SpeakButton text={vocabularyInfo.word} size="md" />
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-[var(--text-secondary)]">Nghĩa:</h5>
                <p className="text-[var(--text-primary)]">{vocabularyInfo.meaning}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-[var(--text-secondary)]">Ví dụ:</h5>
                <div className="flex items-start gap-2">
                  <p className="text-[var(--text-primary)] italic flex-grow">{vocabularyInfo.example}</p>
                  <SpeakButton text={vocabularyInfo.example} size="sm" className="mt-0.5" />
                </div>
              </div>
              
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`w-full p-2 rounded-lg text-white text-center ${
                  isSaved 
                    ? 'bg-green-500 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSaved ? 'Đã lưu' : 'Lưu từ vựng'}
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-[var(--text-primary)]">
              Không tìm thấy thông tin cho từ "{word}"
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VocabularyPopup; 