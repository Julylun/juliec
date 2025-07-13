@echo off
echo Dang dung server pnpm dev...

REM Kill process pnpm run dev
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /v /fo list ^| findstr /i "pnpm run dev"') do (
    taskkill /PID %%a /F
)

REM Kill process pnpm.cmd neu con
taskkill /IM pnpm.cmd /F >nul 2>nul

echo Da dung server (neu co).
pause 