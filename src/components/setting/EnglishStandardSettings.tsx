import React from 'react';
import { EnglishStandardType } from '../../types/settings';

interface EnglishStandardSettingsProps {
  englishStandard: EnglishStandardType;
  onEnglishStandardChange: (standard: EnglishStandardType) => void;
}

const ENGLISH_STANDARDS: { id: EnglishStandardType; name: string; description: string; isBeta?: boolean; }[] = [
  {
    id: 'toeic',
    name: 'TOEIC',
    description: 'Test of English for International Communication - Phù hợp cho môi trường làm việc'
  },
  {
    id: 'ielts',
    name: 'IELTS',
    description: 'International English Language Testing System - Tiêu chuẩn quốc tế cho du học, định cư',
    isBeta: true
  },
  {
    id: 'cefr',
    name: 'CEFR',
    description: 'Common European Framework of Reference - Khung tham chiếu ngôn ngữ chung của châu Âu',
    isBeta: true
  }
];

const EnglishStandardSettings: React.FC<EnglishStandardSettingsProps> = ({
  englishStandard,
  onEnglishStandardChange
}) => {
  return (
    <div className="mb-8 p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Tiêu chuẩn tiếng Anh</h2>
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Chọn tiêu chuẩn tiếng Anh bạn muốn sử dụng để học và luyện tập
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENGLISH_STANDARDS.map(standard => (
            <button
              key={standard.id}
              onClick={() => onEnglishStandardChange(standard.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${englishStandard === standard.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                }`}
            >
              <div className="font-medium text-[var(--text-primary)] flex items-center">
                {standard.name}
                {standard.isBeta && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded">
                    Beta
                  </span>
                )}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">{standard.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnglishStandardSettings; 