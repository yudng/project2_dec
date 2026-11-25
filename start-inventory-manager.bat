@echo off
setlocal

if /I "%~1"==":backend" goto backend
if /I "%~1"==":frontend" goto frontend

echo Starting Inventory Manager...
echo.
start "Inventory Manager - Backend" cmd /k call "%~f0" :backend
start "Inventory Manager - Frontend" cmd /k call "%~f0" :frontend
echo.
echo Backend:  http://localhost:8080/swagger-ui.html
echo Frontend: http://localhost:5173
echo.
echo Two terminals have been opened. Keep them running while using the application.
exit /b 0

:backend
cd /d "%~dp0inventory-manager\backend"
echo Starting Spring Boot backend...
mvn spring-boot:run
echo.
echo Backend stopped. Press any key to close this window.
pause >nul
exit /b %errorlevel%

:frontend
cd /d "%~dp0inventory-manager\frontend"

if not exist "node_modules\" (
  echo Installing frontend dependencies for the first run...
  npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Press any key to close this window.
    pause >nul
    exit /b 1
  )
)

echo Starting Vite frontend...
npm run dev
echo.
echo Frontend stopped. Press any key to close this window.
pause >nul
exit /b %errorlevel%
