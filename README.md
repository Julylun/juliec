# JulieC - Ứng dụng học từ vựng TOEIC thông minh

## 📝 Giới thiệu
JulieC là một ứng dụng web giúp người dùng học từ vựng TOEIC một cách hiệu quả thông qua việc đọc và tương tác với các bài đọc. Ứng dụng sử dụng AI (Google Gemini) để tạo nội dung và dịch từ vựng tự động.

## ✨ Tính năng chính

### 📚 Học từ vựng thông qua bài đọc
- Tự động tạo bài đọc TOEIC theo chủ đề
- Bôi đen từ vựng để xem nghĩa và thêm vào thư viện
- Hỗ trợ phiên âm IPA và ví dụ cho mỗi từ vựng

### 📖 Thư viện từ vựng thông minh
- Quản lý từ vựng theo bộ sưu tập
- Tự động tạo từ vựng theo chủ đề TOEIC
- Tìm kiếm, lọc và sắp xếp từ vựng
- Theo dõi tiến độ học tập

### ⚙️ Tùy chỉnh
- Chọn model AI (Gemini Pro/Gemini Pro Vision)
- Giao diện sáng/tối
- Cấu hình API key

## 🛠️ Công nghệ sử dụng
- **Frontend:** React, TypeScript, TailwindCSS
- **State Management:** React Context
- **AI Integration:** Google Gemini API
- **Routing:** React Router
- **Build Tool:** Vite

## 📦 Cài đặt

1. Clone repository:
```bash
git clone https://github.com/your-username/juliec.git
cd juliec
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env và thêm Gemini API key:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

4. Chạy ứng dụng ở môi trường development:
```bash
npm run dev
```

## 🔑 Cấu hình API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Thêm API key vào phần Cài đặt trong ứng dụng

## 📄 Cấu trúc thư mục

```
src/
├── components/     # React components
├── contexts/       # React contexts
├── data/          # Static data và types
├── hooks/         # Custom hooks
├── pages/         # Page components
├── services/      # API services
├── styles/        # Global styles
└── utils/         # Helper functions
```

## 🤝 Đóng góp
Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License
Dự án được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## 👤 Tác giả
- GitHub: [@julylun](https://github.com/julylun)

## 🙏 Cảm ơn
- [Google Gemini API](https://ai.google.dev/) cho việc tích hợp AI
- [TailwindCSS](https://tailwindcss.com/) cho framework CSS
- [React](https://reactjs.org/) cho framework UI
