import React, { createContext, useContext, useState, useEffect } from 'react';
import { VocabularyInfo } from '../data/vocabularyPrompt';

// Extend VocabularyInfo to include additional metadata
export interface EnhancedVocabularyInfo extends VocabularyInfo {
  dateAdded: string;
  studyCount: number;
  isActive: boolean;
  collections: string[];
}

interface VocabularyContextType {
  savedVocabulary: EnhancedVocabularyInfo[];
  collections: string[];
  addVocabulary: (vocab: VocabularyInfo) => void;
  removeVocabulary: (word: string) => void;
  clearAllVocabulary: () => void;
  incrementStudyCount: (word: string) => void;
  toggleVocabularyActive: (word: string) => void;
  addToCollection: (word: string, collection: string) => void;
  removeFromCollection: (word: string, collection: string) => void;
  createCollection: (name: string) => void;
  removeCollection: (name: string) => void;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export const useVocabulary = () => {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
};

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Khởi tạo collections từ localStorage hoặc dùng giá trị mặc định
  const initialCollections = (() => {
    const savedCollections = localStorage.getItem('vocabularyCollections');
    if (savedCollections) {
      try {
        const parsedCollections = JSON.parse(savedCollections);
        console.log('Loaded initial collections from localStorage:', parsedCollections);
        return parsedCollections;
      } catch (e) {
        console.error('Error parsing saved collections:', e);
      }
    }
    return ['Favorites'];
  })();

  const [savedVocabulary, setSavedVocabulary] = useState<EnhancedVocabularyInfo[]>([]);
  const [collections, setCollections] = useState<string[]>(initialCollections);

  // Load saved vocabulary from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('savedVocabulary');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert any old format data to new format if needed
        const enhancedData = parsedData.map((item: VocabularyInfo | EnhancedVocabularyInfo) => {
          if ('dateAdded' in item) {
            return item as EnhancedVocabularyInfo;
          } else {
            return {
              ...item,
              dateAdded: new Date().toISOString(),
              studyCount: 0,
              isActive: true,
              collections: []
            } as EnhancedVocabularyInfo;
          }
        });
        setSavedVocabulary(enhancedData);
      } catch (e) {
        console.error('Error parsing saved vocabulary:', e);
      }
    }
  }, []);

  // Save collections to localStorage whenever they change
  useEffect(() => {
    console.log('Collections changed, saving to localStorage:', collections);
    localStorage.setItem('vocabularyCollections', JSON.stringify(collections));
  }, [collections]);

  // Add a new vocabulary word (prevent duplicates)
  const addVocabulary = (vocab: VocabularyInfo) => {
    setSavedVocabulary(prev => {
      // Check if word already exists (case insensitive)
      const exists = prev.some(item => 
        item.word.toLowerCase() === vocab.word.toLowerCase()
      );
      
      if (exists) {
        return prev; // Don't add if already exists
      }
      
      const enhancedVocab: EnhancedVocabularyInfo = {
        ...vocab,
        dateAdded: new Date().toISOString(),
        studyCount: 0,
        isActive: true,
        collections: []
      };
      
      const newVocabulary = [...prev, enhancedVocab];
      localStorage.setItem('savedVocabulary', JSON.stringify(newVocabulary));
      return newVocabulary;
    });
  };

  // Remove a vocabulary word
  const removeVocabulary = (word: string) => {
    setSavedVocabulary(prev => {
      const newVocabulary = prev.filter(
        item => item.word.toLowerCase() !== word.toLowerCase()
      );
      localStorage.setItem('savedVocabulary', JSON.stringify(newVocabulary));
      return newVocabulary;
    });
  };

  // Clear all vocabulary
  const clearAllVocabulary = () => {
    setSavedVocabulary([]);
    localStorage.removeItem('savedVocabulary');
  };

  // Increment study count for a word
  const incrementStudyCount = (word: string) => {
    setSavedVocabulary(prev => {
      const newVocabulary = prev.map(item => {
        if (item.word.toLowerCase() === word.toLowerCase()) {
          return {
            ...item,
            studyCount: item.studyCount + 1
          };
        }
        return item;
      });
      localStorage.setItem('savedVocabulary', JSON.stringify(newVocabulary));
      return newVocabulary;
    });
  };

  // Toggle active status for a word
  const toggleVocabularyActive = (word: string) => {
    setSavedVocabulary(prev => {
      const newVocabulary = prev.map(item => {
        if (item.word.toLowerCase() === word.toLowerCase()) {
          return {
            ...item,
            isActive: !item.isActive
          };
        }
        return item;
      });
      localStorage.setItem('savedVocabulary', JSON.stringify(newVocabulary));
      return newVocabulary;
    });
  };

  // Add a word to a collection
  const addToCollection = (word: string, collection: string) => {
    console.log(`Adding word "${word}" to collection "${collection}"`);
    setSavedVocabulary(prev => {
      const newVocabulary = prev.map(item => {
        if (item.word.toLowerCase() === word.toLowerCase()) {
          // Only add if not already in the collection
          if (!item.collections.includes(collection)) {
            console.log(`Word "${word}" not in collection, adding it`);
            return {
              ...item,
              collections: [...item.collections, collection]
            };
          }
          console.log(`Word "${word}" already in collection "${collection}"`);
        }
        return item;
      });
      console.log('Saving updated vocabulary with new collection assignments');
      localStorage.setItem('savedVocabulary', JSON.stringify(newVocabulary));
      return newVocabulary;
    });
  };

  // Remove a word from a collection
  const removeFromCollection = (word: string, collection: string) => {
    setSavedVocabulary(prev => {
      const newVocabulary = prev.map(item => {
        if (item.word.toLowerCase() === word.toLowerCase()) {
          return {
            ...item,
            collections: item.collections.filter(c => c !== collection)
          };
        }
        return item;
      });
      localStorage.setItem('savedVocabulary', JSON.stringify(newVocabulary));
      return newVocabulary;
    });
  };

  // Create a new collection
  const createCollection = (name: string) => {
    console.log('Creating collection:', name);
    setCollections(prev => {
      if (prev.includes(name)) {
        console.log('Collection already exists:', name);
        return prev;
      }
      const newCollections = [...prev, name];
      console.log('Saving new collections to localStorage:', newCollections);
      localStorage.setItem('vocabularyCollections', JSON.stringify(newCollections));
      return newCollections;
    });
  };

  // Remove a collection
  const removeCollection = (name: string) => {
    // Don't allow removing the Favorites collection
    if (name === 'Favorites') return;
    
    console.log('Removing collection:', name);
    setCollections(prev => {
      const newCollections = prev.filter(c => c !== name);
      console.log('Saving updated collections to localStorage:', newCollections);
      localStorage.setItem('vocabularyCollections', JSON.stringify(newCollections));
      return newCollections;
    });
    
    // Remove this collection from all vocabulary items
    setSavedVocabulary(prev => {
      const newVocabulary = prev.map(item => ({
        ...item,
        collections: item.collections.filter(c => c !== name)
      }));
      localStorage.setItem('savedVocabulary', JSON.stringify(newVocabulary));
      return newVocabulary;
    });
  };

  return (
    <VocabularyContext.Provider
      value={{
        savedVocabulary,
        collections,
        addVocabulary,
        removeVocabulary,
        clearAllVocabulary,
        incrementStudyCount,
        toggleVocabularyActive,
        addToCollection,
        removeFromCollection,
        createCollection,
        removeCollection
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
}; 