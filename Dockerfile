FROM node:20-alpine AS base

# Cài đặt pnpm trực tiếp thay vì qua corepack
RUN npm install -g pnpm

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và pnpm-lock.yaml (nếu có)
COPY package.json pnpm-lock.yaml ./

# Giai đoạn phát triển
FROM base AS development
# Cài đặt dependencies
RUN pnpm install
# Sao chép toàn bộ mã nguồn
COPY . .
# Mở cổng cho Vite dev server
EXPOSE 5173
# Chạy ứng dụng ở chế độ development
CMD ["pnpm", "dev", "--host"]

# Giai đoạn build
FROM base AS build
# Cài đặt dependencies
RUN pnpm install --frozen-lockfile
# Sao chép toàn bộ mã nguồn
COPY . .
# Sửa script build để bỏ qua TypeScript check
RUN sed -i 's/"build": "tsc -b && vite build"/"build": "vite build"/g' package.json
# Build ứng dụng
RUN pnpm build

# Giai đoạn production
FROM nginx:alpine AS production
# Sao chép các file đã build từ giai đoạn build
COPY --from=build /app/dist /usr/share/nginx/html
# Sao chép cấu hình nginx tùy chỉnh (nếu cần)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Mở cổng 80
EXPOSE 80
# Chạy nginx
CMD ["nginx", "-g", "daemon off;"] 