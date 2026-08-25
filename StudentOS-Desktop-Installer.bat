@echo off
title StudentOS Desktop Launcher & Installer
echo ========================================================
echo        StudentOS AI Mentor Copilot - Desktop App
echo ========================================================
echo Starting StudentOS Desktop Environment...
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js Environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js v18+ from https://nodejs.org
    pause
    exit /b
)

echo [2/3] Building Production Next.js Bundle...
call npm run build

echo [3/3] Launching StudentOS Local Server...
start "" "http://localhost:3000"
call npm run start

pause
