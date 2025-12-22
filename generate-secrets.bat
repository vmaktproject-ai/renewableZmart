@echo off
echo ==========================================
echo JWT Secret Generator for Production
echo ==========================================
echo.
echo Generating JWT_SECRET...
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
echo.
echo Generating JWT_REFRESH_SECRET...
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
echo.
echo ==========================================
echo Copy these values to your Render environment variables
echo ==========================================
pause
