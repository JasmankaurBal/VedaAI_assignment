
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load local configuration before reading any environment-dependent settings.
env_local_path = Path(__file__).parent.parent / ".env.local"
requested_environment = os.getenv("ENVIRONMENT", "development")
is_production = requested_environment in ("production", "prod")

if not is_production and env_local_path.exists():
    print(f"✓ Loading environment variables from {env_local_path}")
    load_dotenv(env_local_path, override=True)
elif not is_production:
    print(f"ℹ No .env.local found at {env_local_path} - using system environment variables")
else:
    print("✓ Running in production mode - using system environment variables")

ENVIRONMENT = os.getenv("ENVIRONMENT", requested_environment)
IS_PRODUCTION = ENVIRONMENT in ("production", "prod")

# Configuration class
class Settings:
   
    
    # API Configuration
    API_TITLE: str = "VedaAI API"
    API_DESCRIPTION: str = "Assessment Extraction & Answer Mapping API"
    API_VERSION: str = "1.0.0"
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-3.6-flash")
    
    # Backend Configuration
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    
    # Frontend Configuration (for CORS and redirects)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Environment
    ENVIRONMENT: str = ENVIRONMENT
    IS_PRODUCTION: bool = IS_PRODUCTION
    
    # Gemini API Configuration
    @classmethod
    def get_gemini_api_key(cls) -> str:
       
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        
        if not api_key:
            env_source = ".env.local file" if not IS_PRODUCTION else "environment variables"
            raise ValueError(
                f"GEMINI_API_KEY not configured. "
                f"Please set it in your {env_source}. "
                f"Get your API key from: https://aistudio.google.com/app/apikey"
            )
        
        if api_key == "your_gemini_api_key_here":
            raise ValueError(
                "GEMINI_API_KEY is still a placeholder. "
                "Please replace it with your actual Gemini API key from: https://aistudio.google.com/app/apikey"
            )
        
        return api_key
    
    @classmethod
    def validate_configuration(cls) -> dict:
        
        config_status = {
            "environment": cls.ENVIRONMENT,
            "is_production": cls.IS_PRODUCTION,
            "backend_url": f"http://{cls.BACKEND_HOST}:{cls.BACKEND_PORT}",
            "frontend_url": cls.FRONTEND_URL,
            "gemini_api_key": "⚠ NOT SET" if not os.getenv("GEMINI_API_KEY") else "✓ SET",
            "warnings": []
        }
        
       
        try:
            cls.get_gemini_api_key()
        except ValueError as e:
            config_status["warnings"].append(str(e))
        
        return config_status

# Create settings instance
settings = Settings()
