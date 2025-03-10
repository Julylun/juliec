import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuButton from '../components/ui/MenuButton';
import { APP_INFO } from '../constants/appInfo';
import ChangelogModal from '../components/modals/ChangelogModal';

const Home = () => {
  const navigate = useNavigate();
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <div className='relative min-h-screen bg-[var(--bg-primary)] p-4'>
      {/* Main content */}
      <div className='flex flex-col items-center justify-center h-full'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-[var(--text-primary)] mb-4'>
            JULIEC
          </h1>
          <p className='text-[var(--text-secondary)]'>
            {APP_INFO.description}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
          <MenuButton 
            name="Reading"
            _function={() => navigate('/learn/reading')}
          />
          <MenuButton 
            name="Writing"
            _function={() => navigate('/learn/writing')}
          />
          <MenuButton 
            name="Speaking"
            _function={() => navigate('/learn/speaking')}
          />
          <MenuButton 
            name="Listening"
            _function={() => navigate('/learn/listening')}
          />
          <MenuButton 
            name="Grammar"
            _function={() => navigate('/learn/grammar')}
          />
          <MenuButton 
            name="Vocabulary"
            _function={() => navigate('/learn/vocabulary')}
          />
        </div>
      </div>

      {/* Version info button */}
      <button 
        onClick={() => setShowChangelog(true)}
        className="fixed bottom-4 left-4 z-40 p-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors shadow-lg"
        aria-label="Thông tin phiên bản"
      >
        <span className="text-xl">ℹ️</span>
      </button>

      {/* Changelog Modal */}
      <ChangelogModal 
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />
    </div>
  );
};

export default Home;
