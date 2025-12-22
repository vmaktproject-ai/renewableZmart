@echo off
echo ==========================================
echo RenewableZmart Deployment Readiness Check
echo ==========================================
echo.

echo Checking files...
echo.

if exist "vercel.json" (
    echo [OK] vercel.json exists
) else (
    echo [MISSING] vercel.json
)

if exist "render.yaml" (
    echo [OK] render.yaml exists
) else (
    echo [MISSING] render.yaml
)

if exist "DEPLOYMENT_GUIDE.md" (
    echo [OK] DEPLOYMENT_GUIDE.md exists
) else (
    echo [MISSING] DEPLOYMENT_GUIDE.md
)

if exist "backend\.env.example" (
    echo [OK] backend\.env.example exists
) else (
    echo [MISSING] backend\.env.example
)

if exist ".gitignore" (
    echo [OK] .gitignore exists
) else (
    echo [MISSING] .gitignore
)

echo.
echo Checking backend build...
cd backend
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend builds successfully
) else (
    echo [ERROR] Backend build failed
)
cd ..

echo.
echo Checking frontend build...
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend builds successfully
) else (
    echo [ERROR] Frontend build failed
)

echo.
echo ==========================================
echo Deployment Readiness Summary
echo ==========================================
echo.
echo If all checks passed, you're ready to deploy!
echo.
echo Next steps:
echo 1. Run generate-secrets.bat to create JWT secrets
echo 2. Read DEPLOYMENT_GUIDE.md for instructions
echo 3. Deploy database on Render
echo 4. Deploy backend on Render
echo 5. Deploy frontend on Vercel
echo.
pause
