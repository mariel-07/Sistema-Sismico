@echo off
title SEPMS - Backend FastAPI (Puerto 8000)
echo ========================================================
echo       SEPMS - SISTEMA DE MONITOREO SISMICO (BACKEND)
echo ========================================================
echo Conectando a Supabase PostgreSQL...
echo Iniciando servidor FastAPI en http://127.0.0.1:8000
echo.

set PYTHONPATH=%~dp0backend;%~dp0backend\venv\Lib\site-packages;%PYTHONPATH%

"C:\Users\PC Cliente\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
pause

