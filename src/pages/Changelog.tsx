import React from 'react';
import { VERSION_HISTORY } from '../constants/appInfo';
import { useNavigate } from 'react-router-dom';
import Arrow from '../components/icons/Arrow';

const Changelog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-primary)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
            aria-label="Quay lại"
          >
            <Arrow className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Lịch sử cập nhật
          </h1>
        </div>
        <div className="h-px w-full bg-[var(--border-color)] opacity-30"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {VERSION_HISTORY.map((version, index) => (
          <div key={version.version} className={index !== 0 ? 'mt-12' : ''}>
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Version {version.version}
              </h2>
              <span className="text-[var(--text-secondary)]">
                {version.releaseDate}
              </span>
              {index === 0 && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                  Latest
                </span>
              )}
            </div>

            <div className="space-y-8">
              {version.updates.map((update, updateIndex) => (
                <div key={updateIndex} className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                    {update.title}
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {update.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-[var(--text-secondary)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Changelog; 