"""
In-memory storage for question papers and analyses
Backend memory persists across frontend refreshes but is lost on backend restart
"""

from typing import Dict, Optional
from .models import QuestionPaper, StudentAnalysis

# Global in-memory storage
_question_papers: Dict[str, QuestionPaper] = {}
_analyses: Dict[str, StudentAnalysis] = {}

def initialize_storage():
    """Initialize storage on app startup"""
    global _question_papers, _analyses
    _question_papers = {}
    _analyses = {}
    print("✓ In-memory storage initialized")

# Question Papers Storage

def save_question_paper(paper: QuestionPaper) -> None:
    """Save a question paper to in-memory storage"""
    _question_papers[paper.id] = paper

def get_question_paper(paper_id: str) -> Optional[QuestionPaper]:
    """Retrieve a question paper by ID"""
    return _question_papers.get(paper_id)

def list_question_papers() -> list[QuestionPaper]:
    """List all saved question papers"""
    return list(_question_papers.values())

def delete_question_paper(paper_id: str) -> bool:
    """Delete a question paper"""
    if paper_id in _question_papers:
        del _question_papers[paper_id]
        return True
    return False

# Student Analysis Storage

def save_analysis(analysis: StudentAnalysis) -> None:
    """Save a student analysis result"""
    _analyses[analysis.id] = analysis

def get_analysis(analysis_id: str) -> Optional[StudentAnalysis]:
    """Retrieve an analysis by ID"""
    return _analyses.get(analysis_id)

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
