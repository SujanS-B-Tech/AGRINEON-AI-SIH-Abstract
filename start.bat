@echo off
echo Starting AGRONEON Local Environment...

:: Start Backend
echo Starting Backend (FastAPI)...
cd backend
start cmd /k "set HF_HOME=D:\PROJECTS\Projects\AGRONEON\backend\.cache\huggingface && pip install -r requirements.txt && python -m uvicorn app.main:app --reload"
cd ..

:: Start Frontend
echo Starting Frontend (Vite)...
cd frontend
start cmd /k "set npm_config_cache=D:\PROJECTS\Projects\AGRONEON\frontend\.npm-cache && npm install && npm run dev"
cd ..

echo Both Backend and Frontend are starting in separate windows.
echo - Backend will be available at: http://localhost:8000
echo - Frontend will be available at: http://localhost:5173
echo.
pause
