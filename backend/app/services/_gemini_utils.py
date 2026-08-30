from ..config import settings

def get_gemini_model_name() -> str:
    """Return the Gemini model name to use.

    Preference order:
    1. settings.AI_MODEL (if set)
    2. settings.GEMINI_MODEL (if set)
    3. Fallback to the current supported model "gemini-3.6-flash".
    """
    model = getattr(settings, "AI_MODEL", None) or getattr(settings, "GEMINI_MODEL", None)
    return model or "gemini-3.6-flash"

__all__ = ["get_gemini_model_name"]
