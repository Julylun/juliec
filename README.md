# Juliec - English application for yourself

![Phiên bản](https://img.shields.io/badge/Phiên_bản-0.4-blue)
![Cập nhật](https://img.shields.io/badge/Cập_nhật-15.03.2023-green)
![Tiêu chuẩn](https://img.shields.io/badge/TOEIC-Ổn_định-blue)
![Tiêu chuẩn](https://img.shields.io/badge/IELTS-Beta-yellow)
![Tiêu chuẩn](https://img.shields.io/badge/CEFR-Beta-yellow)

## 🆕 Cập nhật mới (v0.4)

### ✨ Tính năng mới
- Hỗ trợ nhiều tiêu chuẩn tiếng Anh: TOEIC, IELTS (Beta), CEFR (Beta)
- Tạo từ vựng tự động theo tiêu chuẩn tiếng Anh đã chọn
- Tạo bài đọc và bài dịch phù hợp với tiêu chuẩn tiếng Anh đã chọn
- Hỗ trợ Docker cho dễ dàng triển khai và phát triển

### 🔧 Cải thiện
- Cải thiện chất lượng từ vựng được tạo tự động
- Tối ưu hóa prompt để tạo bài đọc và bài dịch chính xác hơn
- Hiển thị tag Beta cho các tính năng đang trong giai đoạn thử nghiệm

### 🐛 Sửa lỗi
- Sửa lỗi không hiển thị đúng tiêu chuẩn tiếng Anh trong một số trường hợp
- Sửa lỗi không lưu được cài đặt tiêu chuẩn tiếng Anh
- Sửa lỗi hiển thị từ vựng không đúng với tiêu chuẩn đã chọn

## 📝 Giới thiệu
Juliec là một ứng dụng web giúp người dùng học từ vựng tiếng Anh một cách hiệu quả thông qua việc đọc và tương tác với các bài đọc. Ứng dụng hỗ trợ nhiều tiêu chuẩn tiếng Anh (TOEIC, IELTS, CEFR) và sử dụng AI (Google Gemini) để tạo nội dung và dịch từ vựng tự động.

## ✨ Tính năng chính

### 📚 Học từ vựng thông qua bài đọc
- Tự động tạo bài đọc theo chủ đề và tiêu chuẩn tiếng Anh đã chọn
- Bôi đen từ vựng để xem nghĩa và thêm vào thư viện
- Hỗ trợ phiên âm IPA và ví dụ cho mỗi từ vựng

### 📖 Thư viện từ vựng thông minh
- Quản lý từ vựng theo bộ sưu tập
- Tự động tạo từ vựng theo chủ đề và tiêu chuẩn tiếng Anh đã chọn
- Tìm kiếm, lọc và sắp xếp từ vựng
- Theo dõi tiến độ học tập

### ⚙️ Tùy chỉnh
- Chọn tiêu chuẩn tiếng Anh (TOEIC, IELTS, CEFR)
- Chọn model AI (Gemini Pro/Gemini Pro Vision)
- Giao diện sáng/tối và nhiều theme màu sắc
- Cấu hình API key trong ứng dụng

## 🛠️ Công nghệ sử dụng
- **Frontend:** React, TypeScript, TailwindCSS
- **State Management:** React Context
- **AI Integration:** Google Gemini API
- **Routing:** React Router
- **Build Tool:** Vite
- **Package Manager:** pnpm
- **Deployment:** Docker, Nginx

## 📦 Cài đặt

### Cài đặt thông thường

1. Clone repository:
```bash
git clone https://github.com/your-username/juliec.git
cd juliec
```

2. Cài đặt dependencies:
```bash
pnpm install
```

3. Chạy ứng dụng ở môi trường development:
```bash
pnpm dev
```

### Cài đặt với Docker

#### Môi trường phát triển

1. Chạy ứng dụng với Docker Compose:
```bash
docker-compose up juliec-dev
```

2. Truy cập ứng dụng tại: http://localhost:5173

#### Môi trường production

1. Chạy ứng dụng với Docker Compose:
```bash
docker-compose up juliec-prod
```

2. Truy cập ứng dụng tại: http://localhost:80

#### Build và chạy Docker image riêng lẻ

1. Build Docker image cho môi trường phát triển:
```bash
docker build --target development -t juliec-dev .
```

2. Chạy container từ image:
```bash
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules juliec-dev
```

3. Build Docker image cho môi trường production:
```bash
docker build --target production -t juliec-prod .
```

4. Chạy container từ image:
```bash
docker run -p 80:80 juliec-prod
```

## 🔑 Cấu hình API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Thêm API key vào phần Cài đặt trong ứng dụng (Settings > API Key)

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


## 👤 Tác giả
- GitHub: [@julylun](https://github.com/julylun)

## 🙏 Cảm ơn
- [Google Gemini API](https://ai.google.dev/) cho việc tích hợp AI
- [TailwindCSS](https://tailwindcss.com/) cho framework CSS
- [React](https://reactjs.org/) cho framework UI
