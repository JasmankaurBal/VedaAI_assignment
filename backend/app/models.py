"""
Pydantic data models for VedaAI
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BoundingBox(BaseModel):
    """Normalized bounding box coordinates (0 to 1)"""
    x: float = Field(..., ge=0, le=1, description="Left edge position")
    y: float = Field(..., ge=0, le=1, description="Top edge position")
    width: float = Field(..., ge=0, le=1, description="Box width")
    height: float = Field(..., ge=0, le=1, description="Box height")

class AnswerRegion(BaseModel):
    """Single region of an answer (can be multiple if spanning pages)"""
    page: int = Field(..., ge=1, description="Page number (1-indexed)")
    bbox: BoundingBox

class Question(BaseModel):
    """Extracted question from question paper"""
    id: str = Field(..., description="Unique question ID")
    number: str = Field(..., description="Question number (e.g., '11(a)')")
    order: int = Field(..., ge=0, description="Display order")
    text: str = Field(..., description="Question text")
    region: Optional[AnswerRegion] = Field(
        None,
        description="Primary region for the question on the original document",
    )

class QuestionPaper(BaseModel):
    """Saved question paper"""
    id: str = Field(..., description="Unique paper ID")
    name: str = Field(..., description="Teacher-given name")
    original_file_name: str = Field(..., description="Original upload filename")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    questions: List[Question] = Field(default_factory=list)
    page_count: int = Field(default=1, description="Total pages in question paper")

class ExtractedAnswer(BaseModel):
    """Extracted answer from student answer sheet"""
    id: str = Field(..., description="Unique answer ID")
    detected_question_number: Optional[str] = Field(None, description="Detected question number if available")
    text: str = Field(..., description="Extracted answer text")
    regions: List[AnswerRegion] = Field(default_factory=list)
    confidence: Optional[float] = Field(None, ge=0, le=1, description="Extraction confidence (0-1)")

class QuestionAnswerMapping(BaseModel):
    """Mapping between a question and an answer"""
    question_id: str
    answer_id: Optional[str] = None  # None if unanswered
    confidence: Optional[float] = Field(None, ge=0, le=1)
    match_type: str = Field(default="direct")  # "direct" or "semantic"
    question_region: Optional[AnswerRegion] = None
    answer_region: Optional[AnswerRegion] = None
    score: Optional[float] = Field(None, ge=0)
    max_score: Optional[float] = Field(None, ge=0)
    feedback: Optional[str] = None

class StudentAnalysis(BaseModel):
    """Analysis result for a student's answer sheet"""
    id: str = Field(..., description="Unique analysis ID")
    question_paper_id: str = Field(..., description="Reference to saved question paper")
    original_file_name: str = Field(..., description="Original upload filename for the answer sheet")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    answers: List[ExtractedAnswer] = Field(default_factory=list)
    mappings: List[QuestionAnswerMapping] = Field(default_factory=list)
    unmatched_answers: List[str] = Field(default_factory=list)  # Answer IDs
    unanswered_questions: List[str] = Field(default_factory=list)  # Question IDs
    
    @property
    def summary(self):
        """Quick summary stats"""
        total_questions = len(self.mappings)
        answered = sum(1 for m in self.mappings if m.answer_id is not None)
        return {
            "total_questions": total_questions,
            "answered": answered,
            "unanswered": total_questions - answered,
            "unmatched_answers": len(self.unmatched_answers)
        }

# API Request/Response Models

class QuestionPaperUploadRequest(BaseModel):
    """Request to upload and process a question paper"""
    name: str = Field(..., min_length=1, max_length=200)

class QuestionPaperResponse(BaseModel):
    """Response after question paper processing"""
    id: str
    name: str
    question_count: int
    page_count: int
    created_at: datetime

class AnswerAnalysisResponse(BaseModel):
    """Response for answer sheet analysis"""
    analysis_id: str
    summary: dict
    answers: List[ExtractedAnswer]
    mappings: List[QuestionAnswerMapping]
    unanswered_questions: List[str]
    unmatched_answers: List[str]

class SavedPaperListItem(BaseModel):
    """Single item in saved papers list"""
    id: str
    name: str
    original_file_name: str
    question_count: int
    page_count: int
    created_at: datetime
