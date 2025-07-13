@echo off

REM 1. Kiểm tra npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm chua duoc cai. Vui long cai Node.js tu https://nodejs.org/en/download
    pause
    exit /b
)

REM 2. Kiểm tra pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo Dang cai pnpm...
    npm install -g pnpm
)

REM 3. Cai dependencies va chay server
pnpm install
start /min cmd /c "pnpm run dev > server.log 2>&1"

REM 4. Mo trinh duyet
timeout /t 2 >nul
start http://localhost:5173

echo App da duoc chay nen. Neu muon dung, hay kill process pnpm.
pause 