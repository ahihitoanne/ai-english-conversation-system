@echo off
echo === VocabTalk - Starting all services ===

echo [1/3] Starting PostgreSQL + Adminer via Docker...
docker compose up -d

echo [2/3] Starting FastAPI Backend (core_backend)...
start cmd /k "cd core_backend && .venv\Scripts\activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [3/3] Starting Next.js Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo === All services started! ===
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo   DB Admin:  http://localhost:8080
echo.
pause
