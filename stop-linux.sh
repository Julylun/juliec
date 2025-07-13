#!/bin/bash

echo "Đang dừng server pnpm dev..."

# Tìm và kill process pnpm dev
pkill -f "pnpm run dev"

echo "Đã dừng server (nếu có)." 