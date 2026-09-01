"""
Answer Analysis API endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Form
from fastapi.responses import Response

from ..models import (
    StudentAnalysis, AnswerAnalysisResponse,
    ExtractedAnswer, QuestionAnswerMapping
)
from .. import storage, utils
from ..services import document_processor, answer_extractor, answer_mapper

router = APIRouter()

@router.post("/question-papers/{paper_id}/analyze-answer-sheet", response_model=AnswerAnalysisResponse)
async def analyze_answer_sheet(paper_id: str, file: UploadFile = File(...)):
    """
    Analyze a student's handwritten answer sheet.
    - Extracts answers from the sheet
    - Detects answer regions (bounding boxes)
    - Maps answers to questions from the saved question paper
    - Identifies unanswered questions and unmatched answers
    """

    """
    Analyze a student's handwritten answer sheet.
    
    - Extracts answers from the sheet
    - Detects answer regions (bounding boxes)
    - Maps answers to questions from the saved question paper
    - Identifies unanswered questions and unmatched answers
    """
    
    # Retrieve question paper
    paper = storage.get_question_paper(paper_id)
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question paper '{paper_id}' not found. It may have been cleared if the backend was restarted."
        )
    
    # Validate file type
    allowed_types = [".pdf", ".png", ".jpg", ".jpeg", ".docx"]
    if not utils.is_valid_file_type(file.filename, allowed_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not supported. Allowed: {', '.join(allowed_types)}"
        )
    
    try:
        # Read file
        content = await file.read()
        
        # Process answer sheet (convert to images if needed)
        pages = await document_processor.process_document(content, file.filename)
        
        # Extract answers using AI
        answers = await answer_extractor.extract_answers(pages)
        
        # Map answers to questions
        mappings, unmatched_ids, unanswered_ids = await answer_mapper.map_answers(
            paper.questions,
            answers
        )
        
        # Create analysis object
        analysis_id = utils.generate_id("analysis")
        analysis = StudentAnalysis(
            id=analysis_id,
            question_paper_id=paper_id,
            original_file_name=file.filename or "answer-sheet",
            answers=answers,
            mappings=mappings,
            unmatched_answers=unmatched_ids,
            unanswered_questions=unanswered_ids
        )
        
        # Store analysis
        storage.save_analysis(analysis)
        storage.save_analysis_file(
            analysis_id=analysis.id,
            content=content,
            filename=file.filename or "answer-sheet",
            content_type=file.content_type or "application/octet-stream",
        )
        
        return AnswerAnalysisResponse(
            analysis_id=analysis.id,
            summary=analysis.summary,
            answers=analysis.answers,
            mappings=analysis.mappings,
            unanswered_questions=analysis.unanswered_questions,
            unmatched_answers=analysis.unmatched_answers
        )
        
    except ValueError as e:
        # Configuration errors (e.g., missing API key)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Configuration error: {str(e)}"
        )
    except Exception as e:
        # Other errors
        error_msg = str(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze answer sheet: {error_msg}"
        )

@router.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get a specific analysis result"""
    analysis = storage.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' not found"
        )
    return analysis


@router.get("/analyses/{analysis_id}/answer-sheet")
async def get_answer_sheet_file(analysis_id: str):
    """Get the original uploaded answer sheet file."""
    stored_file = storage.get_analysis_file(analysis_id)
    if not stored_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Answer sheet for analysis '{analysis_id}' not found"
        )

    return Response(
        content=stored_file["content"],
        media_type=stored_file["content_type"],
        headers={
            "Content-Disposition": f'inline; filename="{stored_file["filename"]}"'
        },
    )
