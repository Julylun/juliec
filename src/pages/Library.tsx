import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabulary, EnhancedVocabularyInfo } from '../contexts/VocabularyContext';
import { useSettings } from '../contexts/SettingsContext';
import { GeminiService } from '../services/geminiService';
import { generateVocabularyPrompt, VocabularyInfo } from '../data/vocabularyPrompt';
import { VOCABULARY_TOPICS, VocabularyService } from '../services/vocabularyService';
import SpeakButton from '../components/SpeakButton';

type SortOption = 'date' | 'name' | 'studyCount';
type FilterOption = 'all' | 'active' | 'inactive' | string; // string for collection names

const ITEMS_PER_PAGE = 10;

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { 
    savedVocabulary, 
    collections, 
    removeVocabulary, 
    toggleVocabularyActive,
    addToCollection,
    removeFromCollection,
    createCollection,
    removeCollection,
    addVocabulary
  } = useVocabulary();

  // Kiểm tra xem tiêu chuẩn hiện tại có phải là beta không
  const isCurrentStandardBeta = settings.englishStandard === 'ielts' || settings.englishStandard === 'cefr';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  // States for adding new vocabulary
  const [showAddVocabulary, setShowAddVocabulary] = useState(false);
  const [newVocabularyWord, setNewVocabularyWord] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translatedVocabulary, setTranslatedVocabulary] = useState<VocabularyInfo | null>(null);

  // State for auto-generate modal
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [generatingTopic, setGeneratingTopic] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Filter and sort vocabulary with pagination
  const filteredVocabulary = useMemo(() => {
    let result = [...savedVocabulary];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.word.toLowerCase().includes(query) || 
          item.meaning.toLowerCase().includes(query)
      );
    }

    // Apply status/collection filter
    if (filterBy === 'active') {
      result = result.filter(item => item.isActive);
    } else if (filterBy === 'inactive') {
      result = result.filter(item => !item.isActive);
    } else if (selectedCollections.length > 0) {
      // Filter by selected collections
      result = result.filter(item => 
        selectedCollections.some(collection => item.collections.includes(collection))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      } else if (sortBy === 'name') {
        return a.word.localeCompare(b.word);
      } else if (sortBy === 'studyCount') {
        return b.studyCount - a.studyCount;
      }
      return 0;
    });

    return result;
  }, [savedVocabulary, searchQuery, sortBy, selectedCollections, filterBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredVocabulary.length / ITEMS_PER_PAGE);
  const paginatedVocabulary = filteredVocabulary.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, selectedCollections, filterBy]);

  const handleCollectionToggle = (collection: string) => {
    setSelectedCollections(prev => {
      if (prev.includes(collection)) {
        return prev.filter(c => c !== collection);
      } else {
        return [...prev, collection];
      }
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle auto-generate vocabulary for a topic
  const handleGenerateVocabulary = async (topicId: string, topicName: string) => {
    if (!settings.geminiKey) {
      setGenerationError("Vui lòng kiểm tra API key trong phần Cài đặt");
      return;
    }

    setGeneratingTopic(topicId);
    setGenerationError(null);

    try {
      console.log('Starting vocabulary generation for topic:', topicName);
      console.log('Using English standard:', settings.englishStandard);
      
      const service = new VocabularyService(
        settings.geminiKey, 
        settings.geminiModel,
        settings.englishStandard
      );
      
      const response = await service.generateVocabularyForTopic(topicName);

      if (!response.success || !response.vocabularyList) {
        throw new Error(response.error || 'Không thể tạo từ vựng');
      }

      console.log('Generated vocabulary:', response.vocabularyList);

      // Create collection first and wait for it to be created
      if (!collections.includes(topicName)) {
        console.log('Creating new collection:', topicName);
        await new Promise<void>((resolve) => {
          createCollection(topicName);
          // Wait for the next render cycle to ensure collection is created
          setTimeout(resolve, 0);
        });
        console.log('Current collections after creation:', collections);
      }

      // Add vocabulary first
      const addedWords: string[] = [];
      console.log('Adding vocabulary to savedVocabulary');
      for (const vocab of response.vocabularyList) {
        const vocabInfo: VocabularyInfo = {
          word: vocab.word,
          meaning: vocab.meaning,
          ipa: vocab.ipa,
          example: vocab.example
        };
        
        // Skip if word already exists
        if (!savedVocabulary.some(v => v.word.toLowerCase() === vocab.word.toLowerCase())) {
          console.log('Adding new word:', vocab.word);
          addVocabulary(vocabInfo);
          addedWords.push(vocab.word);
        }
      }

      // Wait for vocabulary to be added
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      // Now add words to collection
      console.log('Adding words to collection:', addedWords);
      for (const word of addedWords) {
        addToCollection(word, topicName);
      }

      console.log('Vocabulary generation completed');
      setGeneratingTopic(null);
      setShowAutoGenerate(false);
    } catch (error) {
      console.error('Error generating vocabulary:', error);
      setGenerationError(error instanceof Error ? error.message : 'Lỗi không xác định');
      setGeneratingTopic(null);
    }
  };

  // Handle translating and adding new vocabulary
  const handleTranslateVocabulary = async () => {
    if (!newVocabularyWord.trim() || !settings.geminiKey) {
      setTranslationError("Vui lòng nhập từ vựng và kiểm tra API key");
      return;
    }

    // Check if word already exists
    const wordExists = savedVocabulary.some(
      item => item.word.toLowerCase() === newVocabularyWord.trim().toLowerCase()
    );

    if (wordExists) {
      setTranslationError("Từ vựng này đã tồn tại trong thư viện");
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);
    setTranslatedVocabulary(null);

    try {
      const geminiService = new GeminiService(settings.geminiKey, settings.geminiModel);
      const prompt = generateVocabularyPrompt(
        newVocabularyWord.trim(),
        settings.englishStandard
      );
      
      const vocabInfo = await geminiService.generateVocabularyInfo(prompt, newVocabularyWord.trim());
      
      if (!vocabInfo) {
        setTranslationError("Không thể dịch từ vựng này. Vui lòng thử lại với từ khác.");
        setIsTranslating(false);
        return;
      }
      
      setTranslatedVocabulary(vocabInfo);
    } catch (err) {
      setTranslationError("Lỗi khi dịch từ vựng: " + (err as Error).message);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle saving translated vocabulary
  const handleSaveVocabulary = () => {
    if (translatedVocabulary) {
      addVocabulary(translatedVocabulary);
      setNewVocabularyWord('');
      setTranslatedVocabulary(null);
      setShowAddVocabulary(false);
    }
  };

  // Thêm hàm xử lý sự kiện click cho nút phát âm
  const handleSpeakClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Thư viện từ vựng</h1>
            <p className="text-[var(--text-secondary)] flex items-center">
              Quản lý từ vựng {settings.englishStandard.toUpperCase()} của bạn
              {isCurrentStandardBeta && (
                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded">
                  Beta
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowAutoGenerate(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              🤖 Tạo từ vựng {settings.englishStandard.toUpperCase()}
            </button>
            <button
              onClick={() => setShowAddVocabulary(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              + Thêm từ vựng mới
            </button>
          </div>
        </div>

        {/* Auto-generate vocabulary modal */}
        {showAutoGenerate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center">
                  Tạo từ vựng {settings.englishStandard.toUpperCase()} theo chủ đề
                  {isCurrentStandardBeta && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded">
                      Beta
                    </span>
                  )}
                </h2>
                <button 
                  onClick={() => {
                    setShowAutoGenerate(false);
                    setGeneratingTopic(null);
                    setGenerationError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {generationError && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                  {generationError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {VOCABULARY_TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleGenerateVocabulary(topic.id, topic.name)}
                    disabled={!!generatingTopic}
                    className={`p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center ${
                      generatingTopic === topic.id ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="text-2xl mr-3">{topic.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-[var(--text-primary)]">{topic.name}</div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {generatingTopic === topic.id ? 'Đang tạo...' : `Tạo từ vựng ${settings.englishStandard.toUpperCase()}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Mỗi chủ đề sẽ tạo ra 10 từ vựng {settings.englishStandard.toUpperCase()} phổ biến và tự động thêm vào bộ sưu tập tương ứng.
              </p>
            </div>
          </div>
        )}

        {/* Add vocabulary modal */}
        {showAddVocabulary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Thêm từ vựng mới</h2>
                <button 
                  onClick={() => {
                    setShowAddVocabulary(false);
                    setNewVocabularyWord('');
                    setTranslatedVocabulary(null);
                    setTranslationError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-[var(--text-secondary)] mb-2">Nhập từ vựng tiếng Anh:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVocabularyWord}
                    onChange={(e) => setNewVocabularyWord(e.target.value)}
                    placeholder="Nhập từ vựng..."
                    className="flex-1 p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                    disabled={isTranslating}
                  />
                  <button
                    onClick={handleTranslateVocabulary}
                    disabled={isTranslating || !newVocabularyWord.trim()}
                    className={`px-4 py-2 rounded-lg text-white ${
                      isTranslating || !newVocabularyWord.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {isTranslating ? 'Đang dịch...' : 'Dịch'}
                  </button>
                </div>
                {translationError && (
                  <p className="mt-2 text-red-500 text-sm">{translationError}</p>
                )}
              </div>
              
              {isTranslating && (
                <div className="text-left py-4">
                  <div className="animate-pulse text-[var(--text-primary)]">Translating...</div>
                </div>
              )}
              
              {translatedVocabulary && (
                <div className="border border-[var(--border-color)] rounded-lg p-4 mb-4">
                  <div className="mb-2 text-left">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{translatedVocabulary.word}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{translatedVocabulary.ipa}</p>
                  </div>
                  <div className="mb-2 text-left">
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)]">Nghĩa:</h4>
                    <p className="text-[var(--text-primary)]">{translatedVocabulary.meaning}</p>
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)]">Ví dụ:</h4>
                    <div className="flex items-start gap-2">
                      <p className="text-[var(--text-primary)] italic">{translatedVocabulary.example}</p>
                      {translatedVocabulary.example && (
                        <SpeakButton 
                          text={translatedVocabulary.example} 
                          lang="en-US" 
                          size="sm" 
                          onClick={handleSpeakClick}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddVocabulary(false);
                    setNewVocabularyWord('');
                    setTranslatedVocabulary(null);
                    setTranslationError(null);
                  }}
                  className="px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveVocabulary}
                  disabled={!translatedVocabulary}
                  className={`px-4 py-2 rounded-lg text-white ${
                    !translatedVocabulary
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  Lưu từ vựng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="p-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
              >
                <option value="date">Sắp xếp theo ngày</option>
                <option value="name">Sắp xếp theo tên</option>
                <option value="studyCount">Sắp xếp theo số lần học</option>
              </select>
              <select
                value={filterBy}
                onChange={(e) => {
                  setFilterBy(e.target.value);
                  setSelectedCollections([]);
                }}
                className="p-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
              >
                <option value="all">Tất cả từ vựng</option>
                <option value="active">Từ vựng đang học</option>
                <option value="inactive">Từ vựng đã tắt</option>
              </select>
            </div>
          </div>

          {/* Collections filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[var(--text-secondary)]">Bộ sưu tập:</span>
            {collections.map(collection => (
              <button
                key={collection}
                onClick={() => handleCollectionToggle(collection)}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  selectedCollections.includes(collection)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]'
                }`}
              >
                {collection}
              </button>
            ))}
            
            {showAddCollection ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tên bộ sưu tập mới"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="p-1 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                />
                <button 
                  onClick={() => {
                    if (newCollectionName.trim()) {
                      createCollection(newCollectionName.trim());
                      setNewCollectionName('');
                      setShowAddCollection(false);
                    }
                  }}
                  className="text-green-500 hover:text-green-700"
                >
                  ✓
                </button>
                <button 
                  onClick={() => {
                    setShowAddCollection(false);
                    setNewCollectionName('');
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddCollection(true)}
                className="px-3 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              >
                + Thêm bộ sưu tập
              </button>
            )}
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-4 text-[var(--text-secondary)]">
          Hiển thị {paginatedVocabulary.length} / {filteredVocabulary.length} từ vựng
        </div>

        {/* Vocabulary list */}
        {paginatedVocabulary.length > 0 ? (
          <div className="space-y-4">
            {paginatedVocabulary.map((vocab) => (
              <div 
                key={vocab.word}
                className={`p-4 rounded-lg border ${
                  vocab.isActive 
                    ? 'border-[var(--border-color)] bg-[var(--bg-secondary)]' 
                    : 'border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                        {vocab.word}
                      </h3>
                      <SpeakButton 
                        text={vocab.word} 
                        lang="en-US" 
                        size="sm" 
                        onClick={handleSpeakClick}
                      />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {vocab.ipa}
                      </span>
                    </div>
                    <p className="text-[var(--text-primary)]">{vocab.meaning}</p>
                    <div className="flex items-start gap-2">
                      <p className="text-[var(--text-secondary)] italic text-sm">{vocab.example}</p>
                      {vocab.example && (
                        <SpeakButton 
                          text={vocab.example} 
                          lang="en-US" 
                          size="sm" 
                          onClick={handleSpeakClick}
                        />
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-[var(--text-secondary)]">
                        Thêm vào: {formatDate(vocab.dateAdded)}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Đã học: {vocab.studyCount} lần
                      </span>
                      {vocab.collections.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {vocab.collections.map(collection => (
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
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVocabularyActive(vocab.word)}
                      className={`p-2 rounded-lg ${
                        vocab.isActive
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                      title={vocab.isActive ? 'Tắt từ vựng' : 'Bật từ vựng'}
                    >
                      {vocab.isActive ? '🔕' : '🔔'}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setSelectedWord(selectedWord === vocab.word ? null : vocab.word)}
                        className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        title="Thêm vào bộ sưu tập"
                      >
                        📁
                      </button>
                      {selectedWord === vocab.word && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Bộ sưu tập</h4>
                          </div>
                          <div className="p-2 max-h-48 overflow-y-auto">
                            {collections.map(collection => (
                              <div 
                                key={collection}
                                className="flex items-center gap-2 py-1"
                              >
                                <input
                                  type="checkbox"
                                  id={`${vocab.word}-${collection}`}
                                  checked={vocab.collections.includes(collection)}
                                  onChange={() => {
                                    if (vocab.collections.includes(collection)) {
                                      removeFromCollection(vocab.word, collection);
                                    } else {
                                      addToCollection(vocab.word, collection);
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <label 
                                  htmlFor={`${vocab.word}-${collection}`}
                                  className="text-sm text-[var(--text-primary)]"
                                >
                                  {collection}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeVocabulary(vocab.word)}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                      title="Xóa từ vựng"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
            <p className="text-[var(--text-primary)] text-left">
              {savedVocabulary.length === 0
                ? 'Bạn chưa lưu từ vựng nào. Hãy bôi đen từ vựng trong bài đọc để lưu.'
                : 'Không tìm thấy từ vựng nào phù hợp với bộ lọc.'}
            </p>
            {savedVocabulary.length === 0 && (
              <button
                onClick={() => navigate('/learn/reading')}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Đi đến bài đọc
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]'
              }`}
            >
              ⟪
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]'
              }`}
            >
              ←
            </button>
            <span className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]'
              }`}
            >
              →
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]'
              }`}
            >
              ⟫
            </button>
          </div>
        )}

        {/* Navigation button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="w-full p-3 text-center border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default Library; 