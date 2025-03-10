import React, { useEffect, useRef } from 'react';
import { APP_VERSION, RELEASE_DATE, VERSION_HISTORY } from '../../constants/appInfo';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Dữ liệu dự phòng nếu VERSION_HISTORY không hoạt động
const FALLBACK_VERSION_HISTORY = [
  {
    version: '0.4',
    releaseDate: '2024-03-20',
    updates: [
      {
        title: 'Tính năng mới',
        items: [
          'Thêm tính năng luyện viết (Writing Practice)',
          'Hỗ trợ đánh giá bài viết tự động với AI',
          'Thêm các loại bài viết: Business Email, Report Writing, Memo Writing, Proposal Writing, Letter Writing',
          'Hiển thị gợi ý sửa lỗi trực quan khi hover vào từ/câu cần sửa',
          'Phân loại lỗi thành 4 nhóm: ngữ pháp, từ vựng, phong cách, cấu trúc'
        ]
      },
      {
        title: 'Cải thiện',
        items: [
          'Cải thiện giao diện người dùng cho trang chủ',
          'Tối ưu hóa prompt để tạo đề bài và đánh giá chính xác hơn',
          'Thêm thông tin phiên bản và changelog',
          'Cải thiện hiệu suất và tốc độ tải trang'
        ]
      },
      {
        title: 'Sửa lỗi',
        items: [
          'Sửa lỗi hiển thị tooltip bị che khuất trong phần Writing Practice',
          'Sửa lỗi không parse được JSON từ phản hồi của AI',
          'Sửa lỗi đánh giá điểm không chính xác cho bài viết',
          'Sửa lỗi hiển thị không đúng font chữ trong dark mode'
        ]
      }
    ]
  },
  {
    version: '0.3',
    releaseDate: '2024-03-15',
    updates: [
      {
        title: 'Tính năng mới',
        items: [
          'Hỗ trợ nhiều tiêu chuẩn tiếng Anh: TOEIC, IELTS (Beta), CEFR (Beta)',
          'Tạo từ vựng tự động theo tiêu chuẩn tiếng Anh đã chọn',
          'Tạo bài đọc và bài dịch phù hợp với tiêu chuẩn tiếng Anh đã chọn'
        ]
      },
      {
        title: 'Cải thiện',
        items: [
          'Cải thiện chất lượng từ vựng được tạo tự động',
          'Tối ưu hóa prompt để tạo bài đọc và bài dịch chính xác hơn',
          'Hiển thị tag Beta cho các tính năng đang trong giai đoạn thử nghiệm'
        ]
      },
      {
        title: 'Sửa lỗi',
        items: [
          'Sửa lỗi không hiển thị đúng tiêu chuẩn tiếng Anh trong một số trường hợp',
          'Sửa lỗi không lưu được cài đặt tiêu chuẩn tiếng Anh',
          'Sửa lỗi hiển thị từ vựng không đúng với tiêu chuẩn đã chọn'
        ]
      }
    ]
  },
  {
    version: '0.2',
    releaseDate: '2024-03-10',
    updates: [
      {
        title: 'Tính năng mới',
        items: [
          'Thêm tính năng luyện đọc (Reading Practice)',
          'Tạo bài đọc tự động với AI',
          'Tạo câu hỏi và đáp án tự động cho bài đọc',
          'Hỗ trợ nhiều dạng câu hỏi: Multiple Choice, True/False, Fill in the blanks'
        ]
      },
      {
        title: 'Cải thiện',
        items: [
          'Cải thiện giao diện người dùng',
          'Thêm dark mode',
          'Tối ưu hóa tốc độ tải trang'
        ]
      },
      {
        title: 'Sửa lỗi',
        items: [
          'Sửa lỗi không lưu được tiến độ học tập',
          'Sửa lỗi hiển thị không đúng trong dark mode',
          'Sửa các lỗi giao diện trên thiết bị di động'
        ]
      }
    ]
  },
  {
    version: '0.1',
    releaseDate: '2024-03-01',
    updates: [
      {
        title: 'Tính năng mới',
        items: [
          'Ra mắt phiên bản đầu tiên của JULIEC',
          'Tích hợp AI để hỗ trợ học tiếng Anh',
          'Hỗ trợ đăng nhập và lưu tiến độ học tập',
          'Giao diện cơ bản và responsive'
        ]
      }
    ]
  }
];

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const oldVersionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('VERSION_HISTORY:', VERSION_HISTORY);
    }
  }, [isOpen]);

  const scrollToOldVersions = () => {
    if (oldVersionsRef.current) {
      oldVersionsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sử dụng dữ liệu từ VERSION_HISTORY hoặc dữ liệu dự phòng
  const versionHistory = VERSION_HISTORY && VERSION_HISTORY.length > 0 ? VERSION_HISTORY : FALLBACK_VERSION_HISTORY;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--bg-primary)] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Thông tin phiên bản
              </h2>
              <p className="text-[var(--text-secondary)] mt-1">
                Phiên bản hiện tại: {APP_VERSION} (Cập nhật: {RELEASE_DATE})
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={scrollToOldVersions}
                className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Xem phiên bản cũ
              </button>
              <button
                onClick={onClose}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div ref={contentRef} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {versionHistory.map((version, index) => (
            <div 
              key={version.version} 
              className={`${index !== 0 ? 'mt-12 pt-8 border-t border-[var(--border-color)]' : ''}`}
              ref={index === 1 ? oldVersionsRef : null}
            >
              <div className="flex items-baseline gap-3 mb-6">
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                  Version {version.version}
                </h3>
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
                {version.updates && version.updates.map((update, updateIndex) => (
                  <div key={updateIndex} className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
                    <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                      {update.title}
                    </h4>
                    <ul className="list-disc list-inside space-y-2">
                      {update.items && update.items.map((item, itemIndex) => (
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
    </div>
  );
};

export default ChangelogModal; 