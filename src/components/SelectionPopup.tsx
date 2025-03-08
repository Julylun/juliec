import React from 'react';

interface SelectionPopupProps {
  position: { x: number; y: number };
  onTranslate: () => void;
  onHighlight: () => void;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({
  position,
  onTranslate,
  onHighlight,
}) => {
  return (
    <div
      className="fixed z-50 bg-[var(--bg-primary)] rounded-lg shadow-lg border border-[var(--border-color)] py-2 px-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y + 10}px`,
      }}
    >
      <div className="flex gap-1">
        <button
          onClick={onTranslate}
          className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          title="Dịch"
        >
          <span role="img" aria-label="translate" className="text-lg">
            📚
          </span>
        </button>
        <button
          onClick={onHighlight}
          className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          title="Đánh dấu"
        >
          <span role="img" aria-label="highlight" className="text-lg">
            ✨
          </span>
        </button>
      </div>
    </div>
  );
};

export default SelectionPopup; 