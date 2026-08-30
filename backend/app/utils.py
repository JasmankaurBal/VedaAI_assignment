"""
Utility functions for VedaAI backend
"""

import uuid
import os
import json
from typing import Optional
from pathlib import Path

def generate_id(prefix: str = "") -> str:
    """Generate a unique ID"""
    unique_id = uuid.uuid4().hex[:12]
    if prefix:
        return f"{prefix}_{unique_id}"
    return unique_id

def get_file_extension(filename: str) -> str:
    """Get file extension"""
    return Path(filename).suffix.lower()

def is_valid_file_type(filename: str, allowed_types: list[str]) -> bool:
    """Check if file type is allowed"""
    ext = get_file_extension(filename)
    return ext in allowed_types

def safe_json_dump(obj) -> str:
    """Safely dump object to JSON string"""
    try:
        return json.dumps(obj, default=str)
    except Exception as e:
        return json.dumps({"error": str(e)})

def safe_parse_json(json_str: str) -> Optional[dict]:
    """Safely parse JSON string"""
    try:
        return json.loads(json_str)
    except:
        return None
