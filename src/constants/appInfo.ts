// Thông tin phiên bản ứng dụng
export const APP_VERSION = 'Beta 0.5';

// Ngày phát hành phiên bản hiện tại
export const RELEASE_DATE = '2024-06-09';

// Lịch sử các phiên bản
export const VERSION_HISTORY = [
  {
    version: 'Beta 0.5',
    releaseDate: '2024-06-09',
    updates: [
      {
        title: 'Cải thiện',
        items: [
          'Tách UI trang AnkiWTC thành các components nhỏ, tối ưu code, dễ bảo trì.',
          'Lưu và khôi phục ghi chú (note) và bảng định dạng (table 2) vào localStorage.',
          'Thêm chức năng xuất/nhập dữ liệu note + table 2 qua file JSON.',
          'Thêm phím tắt cho FlashCard: a (trước), d (tiếp), s/space (lật thẻ).',
          'Tối ưu hóa giao diện và trải nghiệm người dùng cho các trang luyện từ vựng.',
          'Sửa lỗi đồng bộ dữ liệu bảng 2 khi import/export.',
          'Cải thiện khả năng mở rộng và tái sử dụng UI.'
        ]
      }
    ]
  },
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

// Thông tin cập nhật của phiên bản hiện tại
export const VERSION_UPDATES = VERSION_HISTORY[0].updates;

// Thông tin ứng dụng
export const APP_INFO = {
  name: 'JULIEC',
  description: 'Nền tảng học tiếng Anh thông minh với TOEIC, IELTS và CEFR',
  github: 'https://github.com/julylun/juliec',
  developer: {
    name: 'Julylun',
    description: 'Sinh viên tại Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn',
    avatar: 'https://github.com/Julylun.png',
    github: 'https://github.com/Julylun'
  }
}; 