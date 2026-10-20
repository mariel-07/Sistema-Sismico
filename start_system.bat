@echo off
title SEPMS - Lanzador del Sistema Completo
echo ========================================================
echo       SEPMS - SISTEMA DE MONITOREO SISMICO INTEGRAL
echo ========================================================
echo.
echo 1. Levantando servidor Backend FastAPI en ventana independiente...
start "SEPMS Backend (FastAPI :8000)" cmd /c "%~dp0run_backend.bat"

echo 2. Esperando 3 segundos a que inicie el backend...
timeout /t 3 /nobreak > nul

echo 3. Levantando servidor Frontend Vite en ventana independiente...
start "SEPMS Frontend (Vite :5173)" cmd /c "%~dp0run_frontend.bat"

echo 4. Abriendo la plataforma en el navegador...
timeout /t 2 /nobreak > nul
start http://localhost:5173

echo.
echo Todo listo. SEPMS esta ejecutandose en http://localhost:5173
echo.
pause

