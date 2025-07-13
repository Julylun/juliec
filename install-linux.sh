#!/bin/bash

# 1. Kiểm tra npm
if ! command -v npm &> /dev/null
then
    echo "npm chưa được cài. Đang cài đặt Node.js & npm..."
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt install -y nodejs npm
    else
        echo "Vui lòng tự cài Node.js và npm cho distro của bạn."
        exit 1
    fi
    echo "Đã cài xong npm. Vui lòng restart terminal rồi chạy lại script này."
    exit 0
fi

# 2. Kiểm tra pnpm
if ! command -v pnpm &> /dev/null
then
    echo "Đang cài đặt pnpm..."
    npm install -g pnpm
fi

# 3. Cài dependencies và chạy server nền
pnpm install
nohup pnpm run dev > server.log 2>&1 &

# 4. Mở trình duyệt
sleep 2
xdg-open http://localhost:5173

echo "App đã được chạy nền. Nếu muốn dừng, hãy kill process pnpm." 