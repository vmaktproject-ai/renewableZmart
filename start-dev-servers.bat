@echo off
echo Starting Frontend and Backend servers...
echo.

REM Kill any existing node processes on ports 3000 and 4000
echo Cleaning up ports...
netstat -ano | findstr :3000 >nul && taskkill /PID %1 /F >nul 2>&1
netstat -ano | findstr :4000 >nul && taskkill /PID %1 /F >nul 2>&1

echo.
echo Starting Backend Server on port 4000...
start cmd /k "cd /d %CD%\backend && npm run dev"

timeout /t 3 /nobreak

echo.
echo Starting Frontend Server on port 3000...
start cmd /k "npm run dev"

echo.
echo Servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:4000
echo.
