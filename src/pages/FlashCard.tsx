import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary, EnhancedVocabularyInfo } from '../contexts/VocabularyContext';
import { useSettings } from '../contexts/SettingsContext';
import SpeakButton from '../components/SpeakButton';

const FlashCard: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { 
    savedVocabulary, 
    collections,
    removeVocabulary, 
    clearAllVocabulary, 
    incrementStudyCount 
  } = useVocabulary();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | 'all'>('all');
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);

  // Filter vocabulary by selected collection and active status
  const filteredVocabulary = useMemo(() => {
    // Only show active vocabulary
    let filtered = savedVocabulary.filter(vocab => vocab.isActive);
    
    // Filter by collection if not 'all'
    if (selectedCollection !== 'all') {
      filtered = filtered.filter(vocab => 
        vocab.collections.includes(selectedCollection)
      );
    }
    
    return filtered;
  }, [savedVocabulary, selectedCollection]);

  // Reset to first card when vocabulary changes
  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
  }, [filteredVocabulary.length]);

  const handleNext = () => {
    if (currentIndex < filteredVocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
    }
  };

  const handleFlip = () => {
    setFlipped(prev => {
      // Only increment study count when flipping from front to back
      if (!prev && filteredVocabulary.length > 0) {
        incrementStudyCount(filteredVocabulary[currentIndex].word);
      }
      return !prev;
    });
  };

  const handleRemove = () => {
    if (filteredVocabulary.length > 0) {
      removeVocabulary(filteredVocabulary[currentIndex].word);
      // If we're removing the last card, go to the previous one
      if (currentIndex === filteredVocabulary.length - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleCollectionChange = (collection: string | 'all') => {
    setSelectedCollection(collection);
    setShowCollectionSelector(false);
    setCurrentIndex(0);
    setFlipped(false);
  };

  // Ngăn chặn sự kiện click từ nút phát âm lan ra thẻ cha
  const handleSpeakClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)]">Từ vựng</h1>
        <p className="text-[var(--text-secondary)]">Học từ vựng với flashcard</p>
      </div>

      {/* Collection selector */}
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="text-[var(--text-primary)] font-medium">
            Bộ sưu tập: 
            <button 
              onClick={() => setShowCollectionSelector(!showCollectionSelector)}
              className="ml-2 px-3 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors"
            >
              {selectedCollection === 'all' ? 'Tất cả từ vựng' : selectedCollection}
              <span className="ml-1">▼</span>
            </button>
          </div>
          <div className="text-[var(--text-secondary)]">
            {filteredVocabulary.length > 0 ? 
              `${currentIndex + 1} / ${filteredVocabulary.length}` : 
              '0 / 0'}
          </div>
        </div>

        {/* Collection dropdown */}
        {showCollectionSelector && (
          <div className="mt-2 p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg">
            <div className="max-h-48 overflow-y-auto">
              <div 
                className={`p-2 cursor-pointer rounded hover:bg-[var(--bg-primary)] ${
                  selectedCollection === 'all' ? 'bg-blue-100 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => handleCollectionChange('all')}
              >
                Tất cả từ vựng ({savedVocabulary.filter(v => v.isActive).length})
              </div>
              {collections.map(collection => {
                const count = savedVocabulary.filter(
                  v => v.isActive && v.collections.includes(collection)
                ).length;
                return (
                  <div 
                    key={collection}
                    className={`p-2 cursor-pointer rounded hover:bg-[var(--bg-primary)] ${
                      selectedCollection === collection ? 'bg-blue-100 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleCollectionChange(collection)}
                  >
                    {collection} ({count})
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {filteredVocabulary.length > 0 ? (
        <>
          {/* Flashcard container */}
          <div className="w-full max-w-md mx-auto aspect-[3/2] perspective-1000 mb-6">
            {/* Flashcard */}
            <div 
              className={`relative w-full h-full cursor-pointer transition-transform duration-500 transform-style-3d ${
                flipped ? 'rotate-y-180' : ''
              }`}
              onClick={handleFlip}
            >
              {/* Front side */}
              <div className="absolute w-full h-full flex flex-col items-center justify-center p-6 bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-[var(--border-color)] backface-hidden">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">
                    {filteredVocabulary[currentIndex].word}
                  </h2>
                  <div onClick={handleSpeakClick}>
                    <SpeakButton text={filteredVocabulary[currentIndex].word} size="md" />
                  </div>
                </div>
                <p className="text-[var(--text-secondary)]">
                  {filteredVocabulary[currentIndex].ipa}
                </p>
                <div className="mt-4 text-sm text-[var(--text-secondary)]">
                  Bấm để xem nghĩa
                </div>
                {/* Show collections on front */}
                {filteredVocabulary[currentIndex].collections.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1 justify-center">
                    {filteredVocabulary[currentIndex].collections.map(collection => (
                      <span 
                        key={collection}
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {collection}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Back side */}
              <div className="absolute w-full h-full flex flex-col items-center justify-center p-6 bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-[var(--border-color)] backface-hidden rotate-y-180">
                <div className="space-y-4 w-full">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Nghĩa:</h3>
                    <p className="text-[var(--text-primary)]">
                      {filteredVocabulary[currentIndex].meaning}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Ví dụ:</h3>
                    <div className="flex items-start gap-2">
                      <p className="text-[var(--text-primary)] italic flex-grow">
                        {filteredVocabulary[currentIndex].example}
                      </p>
                      <div onClick={handleSpeakClick}>
                        <SpeakButton text={filteredVocabulary[currentIndex].example} size="sm" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Đã học: {filteredVocabulary[currentIndex].studyCount} lần
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="w-full max-w-md mx-auto flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded-lg ${
                currentIndex === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Trước
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Xóa
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredVocabulary.length - 1}
              className={`px-4 py-2 rounded-lg ${
                currentIndex === filteredVocabulary.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Tiếp
            </button>
          </div>

          {/* Clear all button */}
          <div className="w-full max-w-md mx-auto mt-6">
            {showConfirmClear ? (
              <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg border border-red-300 dark:border-red-800">
                <p className="text-[var(--text-primary)] mb-2">Bạn có chắc muốn xóa tất cả từ vựng?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      clearAllVocabulary();
                      setShowConfirmClear(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Xóa tất cả
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="w-full p-2 text-center border border-red-300 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                Xóa tất cả từ vựng
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="w-full max-w-md mx-auto text-center p-8 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <p className="text-[var(--text-primary)] mb-4">
            {savedVocabulary.length === 0
              ? 'Bạn chưa lưu từ vựng nào. Hãy bôi đen từ vựng trong bài đọc để lưu.'
              : selectedCollection === 'all'
                ? 'Không có từ vựng nào đang hoạt động. Hãy bật từ vựng trong thư viện.'
                : `Không có từ vựng nào trong bộ sưu tập "${selectedCollection}".`}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate('/learn/reading')}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Đi đến bài đọc
            </button>
            <button
              onClick={() => navigate('/library')}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
            >
              Quản lý từ vựng
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mx-auto mt-8">
        <button
          onClick={() => navigate('/learn')}
          className="w-full p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-colors"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default FlashCard; 