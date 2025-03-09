import React, { useState } from 'react';
import { SpeechService } from '../services/speechService';

interface SpeakButtonProps {
  text: string;
  lang?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  lang = 'en-US',
  size = 'md',
  className = '',
  onClick
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechService = SpeechService.getInstance();
  const isSupported = speechService.isSupported();

  // Xác định kích thước của nút
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  // Xử lý khi nhấp vào nút
  const handleClick = (e: React.MouseEvent) => {
    // Gọi hàm onClick nếu được cung cấp
    if (onClick) {
      onClick(e);
    }

    if (!isSupported || !text) return;

    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      
      // Phát âm và cập nhật trạng thái khi kết thúc
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechService.speak(text, lang);
    }
  };

  // Nếu trình duyệt không hỗ trợ, không hiển thị nút
  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors ${sizeClasses[size]} ${className}`}
      title={isSpeaking ? 'Dừng đọc' : 'Đọc từ này'}
      aria-label={isSpeaking ? 'Dừng đọc' : 'Đọc từ này'}
    >
      {isSpeaking ? (
        <span role="img" aria-label="stop">
          ⏹️
        </span>
      ) : (
        <span role="img" aria-label="speak">
          🔊
        </span>
      )}
    </button>
  );
};

export default SpeakButton; 