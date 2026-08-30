# VedaAI Backend - Setup & Deployment Guide

## Quick Start - Local Development

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Gemini API Key
1. Visit https://aistudio.google.com/app/apikey
2. Click "Create API Key" button
3. Copy the generated API key
4. Open `backend/.env.local` and replace `your_gemini_api_key_here` with your actual key:
   ```
   GEMINI_API_KEY=AIzaSyD...
   ```

### 3. Start the Backend Server
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
============================================================
VedaAI Backend Configuration
============================================================
environment............................ development
is_production........................... False
backend_url........................... http://0.0.0.0:8000
frontend_url.......................... http://localhost:3000
gemini_api_key....................... ✓ SET
============================================================

INFO:     Application startup complete
```

### 4. Verify Backend is Running
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "VedaAI backend is running",
  "environment": "development",
  "gemini_api_key_set": true
}
```

### 5. Check Configuration
```bash
curl http://localhost:8000/api/config
```

---

## Environment Variables

### Local Development (.env.local)
The backend automatically loads `.env.local` when running locally. This file:
- ✅ Is loaded automatically in development mode
- ❌ Should NOT be committed to version control (in .gitignore)
- ✅ Supports all configuration options

### Production Deployment
For production:
1. Set environment variables directly in your deployment platform:
   - Vercel: Settings → Environment Variables
   - Docker: Environment variables in docker-compose or Dockerfile
   - Server: Export variables in shell profile or systemd service
2. Set `ENVIRONMENT=production` to disable .env.local loading and disable hot reload

### Configuration Options

| Variable | Default | Development | Production |
|----------|---------|-------------|-----------|
| `GEMINI_API_KEY` | (none - required) | .env.local | Env var or secrets |
| `BACKEND_HOST` | 0.0.0.0 | localhost:8000 | e.g., 0.0.0.0 |
| `BACKEND_PORT` | 8000 | 8000 | 8000 |
| `FRONTEND_URL` | http://localhost:3000 | localhost:3000 | Your domain |
| `ENVIRONMENT` | development | development | production |

---

## Common Issues & Solutions

### "GEMINI_API_KEY not configured"
**Problem:** Error when uploading question paper
```
Failed to extract questions: GEMINI_API_KEY not configured. 
Please set it in your .env.local file. 
Get your API key from: https://aistudio.google.com/app/apikey
```

**Solution:**
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Edit `backend/.env.local`:
   ```
   GEMINI_API_KEY=AIzaSyD...your_actual_key...
   ```
4. Save the file (no restart needed - backend reloads on file change)

### "GEMINI_API_KEY is still a placeholder"
**Problem:** .env.local still has default value
```
GEMINI_API_KEY is still a placeholder. 
Please replace it with your actual Gemini API key
```

**Solution:**
- Don't keep the file with the default. Edit it immediately after cloning.
- Example invalid: `GEMINI_API_KEY=your_gemini_api_key_here`
- Example valid: `GEMINI_API_KEY=AIzaSyD9mJ0Zvq5...`

### Backend on different port
**Solution:** Change `BACKEND_PORT` in `.env.local`:
```
BACKEND_PORT=8001
```

### Frontend can't connect to backend
**Problem:** CORS error or 404

**Solution:**
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify `FRONTEND_URL` in `.env.local` matches your frontend URL
3. If frontend on port 3001: Add to CORS origins in `app/main.py`

---

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Backend on Railway/Render:**
1. Push code to GitHub
2. Create new project pointing to `/backend` folder
3. Set environment variables:
   - `GEMINI_API_KEY=your_key`
   - `ENVIRONMENT=production`
   - `FRONTEND_URL=your-vercel-domain.vercel.app`
4. Deploy
5. Note your backend URL (e.g., `https://vedaai-backend.railway.app`)

**Frontend on Vercel:**
1. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://vedaai-backend.railway.app/api`
2. Deploy

### Option 2: Docker (Both Frontend & Backend)

**Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ENVIRONMENT=production
      - FRONTEND_URL=http://localhost:3000
    
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000/api
    depends_on:
      - backend
```

**Run:**
```bash
docker-compose up
```

### Option 3: Local Containerized Development

**Create backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Run:**
```bash
docker build -f backend/Dockerfile -t vedaai-backend .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key vedaai-backend
```

---

## Configuration Validation

The backend provides diagnostic endpoints:

### Check Health
```bash
curl http://localhost:8000/health
```

### Check Configuration
```bash
curl http://localhost:8000/api/config
```

Example output:
```json
{
  "environment": "development",
  "is_production": false,
  "backend_url": "http://0.0.0.0:8000",
  "frontend_url": "http://localhost:3000",
  "gemini_api_key": "✓ SET",
  "warnings": []
}
```

If there are warnings (e.g., missing API key), they'll appear in the warnings array.

---

## Architecture Overview

```
Local Development Flow:
┌──────────────────────┐
│ Frontend (Next.js)   │  Runs on http://localhost:3000
│ Port: 3000           │
└──────────┬───────────┘
           │ Requests to /api/*
           ↓
┌──────────────────────┐
│ Backend (FastAPI)    │  Runs on http://localhost:8000
│ Port: 8000           │
│ Reads: .env.local    │  ← Set GEMINI_API_KEY here
└──────────┬───────────┘
           │ API calls
           ↓
┌──────────────────────┐
│ Google Gemini API    │
│ vision-2.0-flash     │
└──────────────────────┘

Production Deployment:
┌──────────────────────────┐
│ Frontend (Vercel)        │  Your domain + /api proxy
│ NEXT_PUBLIC_API_URL      │  Points to backend domain
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│ Backend (Railway/Render) │  Backend domain
│ Environment Variables    │  GEMINI_API_KEY in secrets
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│ Google Gemini API        │
└──────────────────────────┘
```

---

## Production Checklist

- [ ] Backend running on production server/platform
- [ ] `GEMINI_API_KEY` set in production environment
- [ ] `ENVIRONMENT=production` set
- [ ] `FRONTEND_URL` set to actual frontend domain
- [ ] CORS properly configured for frontend domain
- [ ] Backend health check working
- [ ] Frontend can connect to backend API
- [ ] Test end-to-end workflow (upload paper → analyze)
- [ ] Monitor backend logs for errors
- [ ] Set up uptime monitoring
- [ ] Enable HTTPS everywhere

---

## Switching Between Local & Production

### Local Development
```bash
# .env.local
ENVIRONMENT=development
GEMINI_API_KEY=your_key
FRONTEND_URL=http://localhost:3000
```

### Switch to Production
```bash
# production environment (e.g., Vercel settings)
ENVIRONMENT=production
GEMINI_API_KEY=your_key
FRONTEND_URL=https://your-domain.com
```

The system automatically adapts:
- ✅ Development: Uses .env.local, hot reload enabled, all CORS origins allowed
- ✅ Production: Uses env vars only, hot reload disabled, stricter CORS
