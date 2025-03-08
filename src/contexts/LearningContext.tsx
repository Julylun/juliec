import React, { createContext, useContext, useState } from 'react';
import { Topic } from '../data/readingTopics';

interface LearningState {
  selectedTopic: Topic | null;
  currentQuestion: number;
  score: number;
}

interface LearningContextType {
  learningState: LearningState;
  setSelectedTopic: (topic: Topic | null) => void;
  setCurrentQuestion: (questionNumber: number) => void;
  setScore: (score: number) => void;
  resetLearningState: () => void;
}

const initialState: LearningState = {
  selectedTopic: null,
  currentQuestion: 0,
  score: 0
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [learningState, setLearningState] = useState<LearningState>(initialState);

  console.log("LearningProvider rendering, state:", learningState);

  const setSelectedTopic = (topic: Topic | null) => {
    console.log("Setting selected topic:", topic);
    setLearningState(prev => ({ ...prev, selectedTopic: topic }));
    
    // Verify state was updated
    setTimeout(() => {
      console.log("Verifying topic was set:", topic?.title);
    }, 10);
  };

  const setCurrentQuestion = (questionNumber: number) => {
    console.log("Setting current question:", questionNumber);
    setLearningState(prev => ({ ...prev, currentQuestion: questionNumber }));
  };

  const setScore = (score: number) => {
    console.log("Setting score:", score);
    setLearningState(prev => ({ ...prev, score }));
  };

  const resetLearningState = () => {
    console.log("Resetting learning state");
    setLearningState(initialState);
  };

  // Store learning state in localStorage to persist across page refreshes
  React.useEffect(() => {
    // Load from localStorage on initial render
    const savedState = localStorage.getItem('learningState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log("Loaded state from localStorage:", parsedState);
        setLearningState(parsedState);
      } catch (e) {
        console.error("Error parsing saved learning state:", e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    if (learningState.selectedTopic) {
      console.log("Saving learning state to localStorage:", learningState);
      localStorage.setItem('learningState', JSON.stringify(learningState));
    }
  }, [learningState]);

  return (
    <LearningContext.Provider
      value={{
        learningState,
        setSelectedTopic,
        setCurrentQuestion,
        setScore,
        resetLearningState
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}; 