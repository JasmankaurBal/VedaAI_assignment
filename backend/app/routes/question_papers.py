"""
Question Papers API endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Form
from fastapi.responses import Response

from ..models import (
    QuestionPaper, Question, QuestionPaperResponse,
    SavedPaperListItem, QuestionPaperUploadRequest
)
from .. import storage, utils
from ..services import document_processor, question_extractor
from typing import List, Optional
import io
from datetime import datetime




router = APIRouter()

@router.post("/question-papers", response_model=QuestionPaperResponse)
async def upload_question_paper(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None)
):
    """
    Upload and process a question paper.
    
    - Extracts questions while preserving original numbering
    - Handles sub-parts (11(a), 11(b)) as separate questions
    - Stores processed paper in backend memory
    """
    
    # Generate default name if not provided
    if not name or not name.strip():
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        name = f"Question Paper - {timestamp}"
    
    # Validate file type
    allowed_types = [".pdf", ".png", ".jpg", ".jpeg", ".docx"]
    if not file.filename or not utils.is_valid_file_type(file.filename, allowed_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not supported. Allowed: {', '.join(allowed_types)}"
        )
    
    try:
        # Read file content
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
        
        # Process document (convert to images if PDF)
        pages = await document_processor.process_document(content, file.filename)
        
        # Extract questions using AI
        questions = await question_extractor.extract_questions(pages)
        
        # Create question paper object
        paper_id = utils.generate_id("paper")
        paper = QuestionPaper(
            id=paper_id,
            name=name,
            original_file_name=file.filename,
            questions=questions,
            page_count=len(pages)
        )
        
        # Store in memory
        storage.save_question_paper(paper)
        storage.save_question_paper_file(
            paper_id=paper.id,
            content=content,
            filename=file.filename or "question-paper",
            content_type=file.content_type or "application/octet-stream",
        )
        
        return QuestionPaperResponse(
            id=paper.id,
            name=paper.name,
            question_count=len(paper.questions),
            page_count=paper.page_count,
            created_at=paper.created_at
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
            detail=f"Failed to process question paper: {error_msg}"
        )

@router.get("/question-papers", response_model=List[SavedPaperListItem])
async def list_question_papers():
    """List all saved question papers"""
    papers = storage.list_question_papers()
    return [
        SavedPaperListItem(
            id=p.id,
            name=p.name,
            original_file_name=p.original_file_name,
            question_count=len(p.questions),
            page_count=p.page_count,
            created_at=p.created_at
        )
        for p in papers
    ]

@router.get("/question-papers/{paper_id}", response_model=QuestionPaper)
async def get_question_paper(paper_id: str):
    """Get a specific question paper"""
    paper = storage.get_question_paper(paper_id)
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question paper '{paper_id}' not found. It may have been cleared if the backend was restarted."
    )
    return paper

@router.get("/question-papers/{paper_id}/file")
async def get_question_paper_file(paper_id: str):
    """Get the original uploaded question paper file."""
    stored_file = storage.get_question_paper_file(paper_id)
    if not stored_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question paper '{paper_id}' file not found"
        )

    return Response(
        content=stored_file["content"],
        media_type=stored_file["content_type"],
        headers={
            "Content-Disposition": f'inline; filename="{stored_file["filename"]}"'
        },
    )

@router.delete("/question-papers/{paper_id}")
async def delete_question_paper(paper_id: str):
    """Delete a saved question paper"""
    if storage.delete_question_paper(paper_id):
        return {"message": f"Question paper '{paper_id}' deleted"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question paper '{paper_id}' not found"
        )
