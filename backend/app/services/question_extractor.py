
import os
import json
from typing import List, Optional
from ..models import Question, BoundingBox, AnswerRegion
from ..services.document_processor import ProcessedPage

try:
    from google import genai
    from ..services._gemini_utils import get_gemini_model_name
    from google.genai import types
    USE_GENAI = True
except ImportError:
    USE_GENAI = False

async def extract_questions(pages: List[ProcessedPage]) -> List[Question]:
    """
    Extract questions from processed pages using Gemini Vision API.
    
    Preserves original question numbering (11(a), 11(b), etc).
    Treats sub-parts as separate questions.
    Returns questions in correct order.
    """
    
    if not pages:
        return []
    
    if not USE_GENAI:
        raise ValueError("google.genai library not available. Install: pip install google-genai")
    
    try:
        from app.config import settings
        api_key = settings.get_gemini_api_key()

        client = genai.Client(api_key=api_key)
        
        # Build prompt for Gemini
        prompt = """Analyze this question paper and extract ALL questions.

IMPORTANT RULES:
1. Preserve the EXACT question numbers as printed (e.g., "11(a)", "11(b)", "Q1", "3.", etc.)
2. Treat sub-parts (11(a), 11(b), 11(c)) as SEPARATE questions
3. Extract questions in the order they appear in the document
4. Include only the question text, not answers
5. For each question, provide:
   - The exact question number as printed
   - The question text
   - An order index (0-based, in reading order)
   - The primary question region on the original page as a normalized bounding box
     with page number

Return a JSON array with this structure:
[
  {
    "number": "1",
    "text": "Exact question text here",
    "order": 0,
    "region": {
      "page": 1,
      "bbox": {
        "x": 0.05,
        "y": 0.10,
        "width": 0.90,
        "height": 0.12
      }
    }
  },
  {
    "number": "2(a)",
    "text": "Sub-question text",
    "order": 1
  },
  {
    "number": "2(b)",
    "text": "Another sub-question",
    "order": 2
  }
]

ONLY return valid JSON, no other text."""
        
        # Always send page images for layout-aware extraction. Raw dictionaries are rejected by google-genai.
        request_parts = []
        for page in pages:
            if not isinstance(page.image_bytes, bytes) or not page.image_bytes:
                raise ValueError(f"Page {page.page_num} does not contain valid image bytes")
            request_parts.append(types.Part.from_bytes(
                data=page.image_bytes,
                mime_type="image/png",
            ))
        request_parts.append(prompt)

        print(
            "Gemini question request parts:",
            type(request_parts).__name__,
            [(type(part).__name__, getattr(part, "mime_type", None)) for part in request_parts],
        )
        
        response = client.models.generate_content(
            model=get_gemini_model_name(),
            contents=request_parts,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        
        # Parse response
        response_text = response.text.strip()
        
        # Try to extract JSON from response
        try:
            # Remove markdown code blocks if present
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            
            extracted_data = json.loads(response_text)
        except json.JSONDecodeError:
            raise ValueError(f"AI response was not valid JSON: {response_text}")
        
        if not isinstance(extracted_data, list):
            raise ValueError("AI response should be a JSON array")
        
        # Convert to Question objects
        questions = []
        for idx, item in enumerate(extracted_data):
            region = None
            region_data = item.get("region")
            if isinstance(region_data, dict):
                bbox_data = region_data.get("bbox", {})
                try:
                    region = AnswerRegion(
                        page=int(region_data.get("page", 1)),
                        bbox=BoundingBox(
                            x=float(bbox_data.get("x", 0)),
                            y=float(bbox_data.get("y", 0)),
                            width=float(bbox_data.get("width", 1)),
                            height=float(bbox_data.get("height", 1)),
                        ),
                    )
                except Exception:
                    region = None

            question = Question(
                id=f"q_{item.get('number', '').replace(' ', '').replace('(', '_').replace(')', '')}_{idx}",
                number=item.get("number", f"Q{idx + 1}"),
                text=item.get("text", ""),
                order=item.get("order", idx),
                region=region,
            )
            
            if question.text:  # Only add if has text
                questions.append(question)
        
        # Sort by order
        questions.sort(key=lambda q: q.order)
        
        return questions
        
    except Exception as e:
        raise Exception(f"Failed to extract questions: {str(e)}")
