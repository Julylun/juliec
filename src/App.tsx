import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { SettingsProvider } from './contexts/SettingsContext';
import { LearningProvider } from './contexts/LearningContext';
import { VocabularyProvider } from './contexts/VocabularyContext';
import ThemeToggle from './components/ui/ThemeToggle';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <LearningProvider>
          <VocabularyProvider>
            <ThemeToggle />
            <div className="app">
              <AppRoutes />
            </div>
          </VocabularyProvider>
        </LearningProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App; 