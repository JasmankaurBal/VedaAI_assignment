import os
from typing import List, Tuple
from ..models import Question, ExtractedAnswer, QuestionAnswerMapping
from ..config import settings
try:
    from google import genai
    from ._gemini_utils import get_gemini_model_name
    USE_GENAI = True
except ImportError:
    USE_GENAI = False

async def map_answers(
    questions: List[Question],
    answers: List[ExtractedAnswer]
) -> Tuple[List[QuestionAnswerMapping], List[str], List[str]]:
    """
    Map extracted answers to questions using layered strategy:
    
    1. Direct matching: Compare detected question number with question.number
    2. Semantic matching: Use AI to match based on content
    3. Logic-based: Identify unanswered and unmatched
    
    Returns:
    - mappings: List of question-answer mappings
    - unmatched_answer_ids: Answers that couldn't be matched
    - unanswered_question_ids: Questions with no answers
    """
    
    mappings = []
    matched_answer_ids = set()
    unmatched_answer_ids = []
    
    # Step 1: Direct matching by question number
    for question in questions:
        best_match = None
        best_confidence = 0
        
        # Try direct match first
        for answer in answers:
            if (answer.detected_question_number and 
                _normalize_number(answer.detected_question_number) == _normalize_number(question.number)):
                best_match = answer
                best_confidence = 0.95  # High confidence for direct match
                break
        
        if best_match:
            answer_region = best_match.regions[0] if best_match.regions else None
            mapping = QuestionAnswerMapping(
                question_id=question.id,
                answer_id=best_match.id,
                confidence=best_confidence,
                match_type="direct",
                question_region=question.region,
                answer_region=answer_region,
                score=2,
                max_score=2,
                feedback="Direct question-number match. The original document remains visible with the matched region highlighted.",
            )
            mappings.append(mapping)
            matched_answer_ids.add(best_match.id)
    
    # Step 2: Semantic matching for remaining questions
    unmatched_questions = [q for q in questions if q.id not in [m.question_id for m in mappings]]
    unmatched_answers_for_matching = [a for a in answers if a.id not in matched_answer_ids]
    
    if unmatched_questions and unmatched_answers_for_matching and USE_GENAI:
        try:
            api_key = os.getenv("GEMINI_API_KEY")
              
            try:
                    api_key = settings.get_gemini_api_key()
            except ValueError:
                    # API key not configured, skip semantic matching
                    api_key = None
            
            if api_key:
                client = genai.Client(api_key=api_key)
                
                # Build semantic matching prompt
                questions_list = "\n".join([
                    f"Q{q.number}: {q.text}"
                    for q in unmatched_questions
                ])
                
                answers_list = "\n".join([
                    f"A{a.id}: {a.text[:200]}..."
                    for a in unmatched_answers_for_matching
                ])
                
                prompt = f"""Match these answers to these questions based on SEMANTIC MEANING.

QUESTIONS:
{questions_list}

ANSWERS:
{answers_list}

Return a JSON mapping of answer_id -> question_number.
Example: {{"answer_0": "11(a)", "answer_1": "11(b)"}}

If an answer cannot be matched to any question, omit it.
Return ONLY valid JSON."""
                
                # Debug: print type of prompt before Gemini call
                print("AnswerMapper Gemini call prompt type:", type(prompt).__name__)
                response = client.models.generate_content(
                    model=get_gemini_model_name(),
                    contents=[prompt]  # Ensure contents is a list as required
                )
                
                import json
                response_text = response.text.strip()
                
                # Extract JSON
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end].strip()
                elif "```" in response_text:
                    json_start = response_text.find("```") + 3
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end].strip()
                
                semantic_matches = json.loads(response_text)
                
                # Apply semantic matches
                for answer_id, question_number in semantic_matches.items():
                    matching_question = next(
                        (q for q in unmatched_questions if q.number == question_number),
                        None
                    )
                    if matching_question and answer_id not in matched_answer_ids:
                        matched_answer = next((a for a in unmatched_answers_for_matching if a.id == answer_id), None)
                        answer_region = matched_answer.regions[0] if matched_answer and matched_answer.regions else None
                        mapping = QuestionAnswerMapping(
                            question_id=matching_question.id,
                            answer_id=answer_id,
                            confidence=0.6,  # Lower confidence for semantic
                            match_type="semantic",
                            question_region=matching_question.region,
                            answer_region=answer_region,
                            score=1,
                            max_score=2,
                            feedback="Semantic match. Review the highlighted handwritten answer on the original sheet.",
                        )
                        mappings.append(mapping)
                        matched_answer_ids.add(answer_id)
                        
        except Exception as e:
            # Semantic matching failed, continue with what we have
            pass
    
    # Step 3: Identify unmatched answers
    for answer in answers:
        if answer.id not in matched_answer_ids:
            unmatched_answer_ids.append(answer.id)
    
    # Step 4: Identify unanswered questions
    unanswered_question_ids = []
    for question in questions:
        if question.id not in [m.question_id for m in mappings]:
            mapping_question_region = question.region
            unanswered_question_ids.append(question.id)
            mappings.append(
                QuestionAnswerMapping(
                    question_id=question.id,
                    answer_id=None,
                    confidence=0.0,
                    match_type="unanswered",
                    question_region=mapping_question_region,
                    answer_region=None,
                    score=0,
                    max_score=2,
                    feedback="No answer was detected for this question.",
                )
            )

    return mappings, unmatched_answer_ids, unanswered_question_ids

def _normalize_number(num_str: str) -> str:
    """Normalize question number for comparison"""
    if not num_str:
        return ""
    # Remove 'Q', 'q', spaces, convert to lowercase
    normalized = num_str.replace("Q", "").replace("q", "").replace(" ", "").lower()
    return normalized
