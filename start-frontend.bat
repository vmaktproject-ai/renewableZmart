@echo off
echo Starting RenewableZmart Frontend on 127.0.0.1:3000...
cd /d "%~dp0"
REM Use npx.cmd to avoid PowerShell execution policy issues with npm.ps1
"%SystemRoot%\System32\where.exe" npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
	echo Error: npx not found in PATH. Please install Node.js.
	exit /b 1
)
call npx.cmd next dev -p 3000 --hostname 127.0.0.1
