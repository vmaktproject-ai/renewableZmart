@echo off
echo ================================================
echo   Enterprise E-commerce - Development Setup
echo ================================================
echo.

echo Step 1: Installing Frontend Dependencies...
cd /d "%~dp0"
call npm install
if errorlevel 1 (
    echo ERROR: Frontend dependencies installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo Step 2: Installing Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend dependencies installation failed!
    pause
    exit /b 1
)
cd ..
echo Backend dependencies installed successfully!
echo.

echo Step 3: Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo.
    echo You can still run the frontend, but backend requires PostgreSQL, Redis, and Meilisearch.
    pause
) else (
    echo Docker found! Starting services...
    docker-compose up -d
    echo.
    echo Waiting for services to start...
    timeout /t 10 /nobreak >nul
    echo Services started!
)

echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Open a terminal and run: cd backend ^& npm run start:dev
echo 2. Open another terminal and run: npm run dev
echo.
echo Then visit:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:4000/api
echo - API Docs: http://localhost:4000/api/docs
echo.
pause
