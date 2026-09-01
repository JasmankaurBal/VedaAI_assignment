"""
In-memory storage for question papers and analyses
Backend memory persists across frontend refreshes but is lost on backend restart
"""

from typing import Dict, Optional
from .models import QuestionPaper, StudentAnalysis

# Global in-memory storage
_question_papers: Dict[str, QuestionPaper] = {}
_analyses: Dict[str, StudentAnalysis] = {}
_question_paper_files: Dict[str, dict] = {}
_analysis_files: Dict[str, dict] = {}


def initialize_storage():
    """Initialize storage on app startup"""
    global _question_papers, _analyses, _question_paper_files, _analysis_files
    _question_papers = {}
    _analyses = {}
    _question_paper_files = {}
    _analysis_files = {}
    print("âœ“ In-memory storage initialized")


# Question Papers Storage


def save_question_paper(paper: QuestionPaper) -> None:
    """Save a question paper to in-memory storage"""
    _question_papers[paper.id] = paper


def save_question_paper_file(
    paper_id: str,
    content: bytes,
    filename: str,
    content_type: str,
) -> None:
    """Save the original uploaded question paper file."""
    _question_paper_files[paper_id] = {
        "content": content,
        "filename": filename,
        "content_type": content_type,
    }


def get_question_paper(paper_id: str) -> Optional[QuestionPaper]:
    """Retrieve a question paper by ID"""
    return _question_papers.get(paper_id)


def get_question_paper_file(paper_id: str) -> Optional[dict]:
    """Retrieve the stored original question paper file."""
    return _question_paper_files.get(paper_id)


def list_question_papers() -> list[QuestionPaper]:
    """List all saved question papers"""
    return list(_question_papers.values())


def delete_question_paper(paper_id: str) -> bool:
    """Delete a question paper"""
    if paper_id in _question_papers:
        del _question_papers[paper_id]
        _question_paper_files.pop(paper_id, None)
        return True
    return False


# Student Analysis Storage


def save_analysis(analysis: StudentAnalysis) -> None:
    """Save a student analysis result"""
    _analyses[analysis.id] = analysis


def save_analysis_file(
    analysis_id: str,
    content: bytes,
    filename: str,
    content_type: str,
) -> None:
    """Save the original uploaded answer sheet file."""
    _analysis_files[analysis_id] = {
        "content": content,
        "filename": filename,
        "content_type": content_type,
    }


def get_analysis(analysis_id: str) -> Optional[StudentAnalysis]:
    """Retrieve an analysis by ID"""
    return _analyses.get(analysis_id)


def get_analysis_file(analysis_id: str) -> Optional[dict]:
    """Retrieve the stored original answer sheet file."""
    return _analysis_files.get(analysis_id)


def get_analyses_for_paper(paper_id: str) -> list[StudentAnalysis]:
    """Get all analyses for a specific question paper"""
    return [a for a in _analyses.values() if a.question_paper_id == paper_id]


# Debug / Info


def get_storage_info() -> dict:
    """Get current storage statistics"""
    return {
        "question_papers": len(_question_papers),
        "analyses": len(_analyses),
        "paper_ids": list(_question_papers.keys())
    }
