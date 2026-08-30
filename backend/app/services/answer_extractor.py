"""
Answer extraction service
Uses Gemini Vision API to extract handwritten answers from answer sheets
"""

import os
import json
from typing import List
from ..models import ExtractedAnswer, AnswerRegion, BoundingBox
from ..services.document_processor import ProcessedPage

try:
    from ..config import settings
    from ._gemini_utils import get_gemini_model_name
    from google.genai import types
    from google import genai
    USE_GENAI = True
except ImportError:
    USE_GENAI = False

async def extract_answers(pages: List[ProcessedPage]) -> List[ExtractedAnswer]:
    """
    Extract handwritten answers from processed pages using Gemini Vision API.
    
    Detects:
    - Answer text (handwritten or typed)
    - Question numbers (if marked by student)
    - Bounding boxes for each answer
    - Confidence level
    
    Returns answers in order found.
    """
    
    if not pages:
        return []
    
    if not USE_GENAI:
        raise ValueError("google.genai library not available")
    
    try:
        from ..config import settings
        api_key = settings.get_gemini_api_key()

        client = genai.Client(api_key=api_key)
        
        prompt = """Analyze these answer sheet pages and extract ALL written answers.

FOR EACH ANSWER FOUND:
1. Extract the handwritten/typed text
2. Try to identify any question number the student marked (if any)
3. Provide bounding box coordinates (normalized 0-1):
   - x: left position (0 = left edge, 1 = right edge)
   - y: top position (0 = top edge, 1 = bottom edge)
   - width: box width (0-1)
   - height: box height (0-1)
4. Provide confidence (0-1) for text extraction quality

RETURN A JSON ARRAY LIKE THIS:
[
  {
    "detected_question_number": "1",
    "text": "This is the student's answer text...",
    "regions": [
      {
        "page": 1,
        "bbox": {
          "x": 0.05,
          "y": 0.1,
          "width": 0.9,
          "height": 0.15
        }
      }
    ],
    "confidence": 0.95
  },
  {
    "detected_question_number": "2(a)",
    "text": "Another answer here...",
    "regions": [
      {
        "page": 1,
        "bbox": {
          "x": 0.05,
          "y": 0.3,
          "width": 0.9,
          "height": 0.2
        }
      }
    ],
    "confidence": 0.87
  }
]

IMPORTANT:
- If answer spans multiple pages, add multiple regions
- detected_question_number can be null if student didn't mark it
- Extract text as accurately as possible, including formatting
- ONLY return JSON, no other text"""
        
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
        
        response = client.models.generate_content(
            model=get_gemini_model_name(),
            contents=request_parts,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        
        response_text = response.text.strip()
        
        # Parse response
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
            extracted_data = []
        
        # Convert to ExtractedAnswer objects
        answers = []
        for idx, item in enumerate(extracted_data):
            # Build regions
            regions = []
            for region_data in item.get("regions", []):
                bbox_data = region_data.get("bbox", {})
                bbox = BoundingBox(
                    x=float(bbox_data.get("x", 0)),
                    y=float(bbox_data.get("y", 0)),
                    width=float(bbox_data.get("width", 1)),
                    height=float(bbox_data.get("height", 1))
                )
                region = AnswerRegion(
                    page=int(region_data.get("page", 1)),
                    bbox=bbox
                )
                regions.append(region)
            
            answer = ExtractedAnswer(
                id=f"answer_{idx}",
                detected_question_number=item.get("detected_question_number"),
                text=item.get("text", ""),
                regions=regions,
                confidence=float(item.get("confidence", 0.5))
            )
            
            if answer.text:  # Only add if has text
                answers.append(answer)
        
        return answers
        
    except Exception as e:
        raise Exception(f"Failed to extract answers: {str(e)}")
