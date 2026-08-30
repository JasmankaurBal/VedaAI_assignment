from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .routes import question_papers, answer_analysis
from .storage import initialize_storage
from .config import settings

# Global storage will be initialized on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    initialize_storage()
    yield
    # Shutdown
    pass

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(question_papers.router, prefix="/api", tags=["question-papers"])
app.include_router(answer_analysis.router, prefix="/api", tags=["answer-analysis"])

@app.get("/config")
async def get_config():
    """Get current configuration and diagnostics"""
    return settings.validate_configuration()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    status = {
        "status": "ok",
        "message": "VedaAI backend is running",
        "environment": settings.ENVIRONMENT,
        "gemini_api_key_set": False,
    }
    try:
        settings.get_gemini_api_key()
        status["gemini_api_key_set"] = True
    except Exception:
        pass
    return status

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=not settings.IS_PRODUCTION,
    )

@app.get("/")
async def root():
    return {"message": "VedaAI Backend is running"}