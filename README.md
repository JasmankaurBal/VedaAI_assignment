# AI Assessment Extraction & Answer Mapping

A web application for teachers to extract questions from question papers and map student handwritten answers to those questions with precise bounding-box highlighting.

## Overview

**VedaAI** processes question papers using computer vision and LLMs to:

1. Extract all questions while preserving original numbering (11(a), 11(b), etc)
2. Process student answer sheets and extract handwritten answers
3. Automatically map answers to questions
4. Highlight exact answer regions with bounding boxes
5. Support reusing the same question paper for multiple students

## Key Features

### Question Paper Processing
- Upload PDF or image question papers
- AI-powered question extraction with preserved numbering
- Separate handling of sub-parts (11(a), 11(b) as distinct questions)
- Automatic question ordering in document sequence

### Student Answer Analysis
- Extract handwritten answers from answer sheets
- Detect answer regions with normalized bounding boxes
- Support for multi-page answers
- Automatic question-to-answer mapping

### Saved Question Papers
- **Process once, reuse forever**: Upload a question paper once and save it
- Analyze multiple students against the same question paper without re-uploading
- No need to re-process questions for each student
- Backend in-memory storage for current session

### Results & Highlighting
- Two-panel interface: Questions on left, answers on right
- Click any question to see extracted answer and location
- Bounding box highlighting on answer sheet
- Summary of answered, unanswered, and unmatched answers
- Confidence scores for AI-extracted content

## Architecture

### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Structure**:
  - `app/` - Page components and layout
  - `components/` - Reusable React components
  - `lib/` - API client and utilities
  - `types/` - TypeScript type definitions

### Backend
- **Framework**: FastAPI (Python)
- **AI**: Google Gemini Vision API
- **Document Processing**: PyMuPDF, Pillow
- **Validation**: Pydantic
- **Structure**:
  - `app/main.py` - FastAPI application setup
  - `app/models.py` - Pydantic data models
  - `app/routes/` - API endpoints
  - `app/services/` - Processing logic
  - `app/storage.py` - In-memory storage

### Processing Pipeline

```
Question Paper Upload
    ↓
PDF/Image Processing (PyMuPDF, Pillow)
    ↓
Gemini Vision API (Extract questions)
    ↓
Validate & Store in Backend Memory
    ↓
Question Paper Ready for Student Analysis
    ↓
Student Answer Sheet Upload
    ↓
PDF/Image Processing
    ↓
Gemini Vision API (Extract answers + regions)
    ↓
Answer Mapping (Direct + Semantic matching)
    ↓
Results with Bounding Boxes
```

## AI Approach

This is a **multimodal Document AI pipeline** that:

**Uses AI for:**
- Question extraction from visual documents
- Handwritten answer recognition
- Answer text understanding
- Semantic matching (when question numbers aren't marked)

**Uses Application Logic for:**
- Question ordering and numbering preservation
- Bounding box coordinate normalization
- Unanswered question detection
- Unmatched answer detection
- Question-to-answer direct matching (when numbers match)

**Does NOT:**
- Train custom ML models
- Use traditional OCR only
- Perform keyword-only matching

## Storage Model

### Saved Question Papers (In-Memory)
Papers are stored in backend memory during the current session:
```python
{
  "id": "paper_123",
  "name": "Class 10 Science - Mid Term 2026",
  "original_file_name": "science.pdf",
  "created_at": "2026-08-30T...",
  "questions": [...],
  "page_count": 25
}
```

### Student Analysis (In-Memory)
Analysis results are also stored in memory:
```python
{
  "id": "analysis_456",
  "question_paper_id": "paper_123",
  "created_at": "2026-08-30T...",
  "answers": [...],
  "mappings": [...],
  "unanswered_questions": [...],
  "unmatched_answers": [...]
}
```

### Storage Limitations

**Important**: This application uses **in-memory storage only**. No database is required as per the assignment specification.

- Browser refresh (Ctrl+R): Does NOT clear backend data (backend remains running)
- Backend restart: Clears ALL saved papers and analyses
- Backend redeploy: Clears ALL data
- Session-level persistence: Saved papers survive frontend refreshes but NOT backend restarts

## API Endpoints

### Question Papers

```
POST /api/question-papers
  Upload and process a new question paper
  
GET /api/question-papers
  List all saved question papers
  
GET /api/question-papers/{paper_id}
  Get details of a specific question paper
  
DELETE /api/question-papers/{paper_id}
  Delete a question paper from memory
```

### Answer Analysis

```
POST /api/question-papers/{paper_id}/analyze-answer-sheet
  Analyze a student's answer sheet against a saved question paper
  
GET /api/analyses/{analysis_id}
  Get a specific analysis result
```

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key ([Get from Google AI Studio](https://aistudio.google.com/))

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Run backend
python -m uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment (already configured in .env.local)
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Run frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage Workflow

### First Time Setup (Save a Question Paper)

1. Open http://localhost:3000
2. Click "+ New Question Paper"
3. Enter: "Class 10 Science - Mid Term 2026"
4. Upload the question paper PDF
5. Click "Upload & Process"
6. Wait for extraction (shows progress)
7. Question paper is now saved in backend memory

### Analyze First Student

1. Click "Analyze Student" on the saved paper card
2. Upload Student A's answer sheet
3. System extracts answers and maps them to questions
4. Results display with:
   - All questions listed (answered ✓, unanswered ○, unmatched ?)
   - Click any question to see extracted answer
   - View exact location on answer sheet
   - Confidence scores

### Analyze Another Student

1. From results page, click "Analyze Another Student"
2. Upload Student B's answer sheet
3. Same question paper is reused (NOT re-uploaded)
4. Results show immediately

Repeat for Students C, D, E, etc. without re-uploading or re-processing the question paper.

## Question Numbering & Sub-Parts

The application preserves exact question numbering:

**Input:**
```
11(a) Explain supervised learning
11(b) Explain unsupervised learning
```

**Extraction (preserved as-is):**
```
Q11(a) - Explain supervised learning
Q11(b) - Explain unsupervised learning
```

Each sub-part is treated as a separate question.

## Bounding Boxes

Answer regions use **normalized coordinates (0 to 1)**:

```python
{
  "x": 0.12,      # Left edge (0 = left, 1 = right)
  "y": 0.30,      # Top edge (0 = top, 1 = bottom)
  "width": 0.70,  # Box width
  "height": 0.22  # Box height
}
```

This allows highlighting to scale correctly regardless of viewer zoom/resize.

## Multi-Page Answers

Answers can span multiple pages:

```python
{
  "answer_id": "answer_1",
  "text": "Long answer continues...",
  "regions": [
    {"page": 2, "bbox": {...}},
    {"page": 3, "bbox": {...}}
  ]
}
```

When clicking a multi-page answer, you can navigate between pages.

## Answer Mapping Strategy

Three-layer approach:

1. **Direct Matching**: If student marks "Q3(b)" and we have question "3(b)", match directly
2. **Semantic Matching**: If question number unclear, use AI to match based on content meaning
3. **Unmatched**: Answer has no matching question → marked as unmatched

## Error Handling

The application gracefully handles:

- Invalid file formats → Clear error message
- Corrupted PDFs → Error shown to user
- Missing question paper → "Please upload/process again"
- Backend restart → Clear message with recovery instructions
- Gemini API failures → Error message with retry option
- Malformed AI responses → Validation error shown

## Testing Scenarios

Verify these cases:

1. ✓ Normal sequential answers (Q1, Q2, Q3...)
2. ✓ Answers out of order (Q3 then Q1 then Q2)
3. ✓ Sub-parts (11(a), 11(b), 11(c) as separate questions)
4. ✓ Unanswered question (missing answer for Q4)
5. ✓ Unmatched answer (answer with no matching question)
6. ✓ Multi-page answer (answer spanning pages 2-3)
7. ✓ Answer without question number (semantic matching)
8. ✓ Browser refresh → Saved papers still available
9. ✓ Backend restart → Papers cleared, user prompted to re-upload
10. ✓ Different display sizes → Highlighting still accurate

## Assumptions & Limitations

- **Handwriting Quality**: Highly illegible handwriting may not extract correctly
- **Scan Quality**: Poor scans/images may result in lower accuracy
- **AI Confidence**: Vision models have inherent confidence levels
- **Semantic Matching**: Fallback for unclear question numbers
- **Session Storage**: Papers are cleared on backend restart (by design)
- **No Database**: In-memory storage only for current session
- **Single User**: No authentication required

## Deployment

### Backend Deployment (Vercel, Railway, Heroku)

```bash
cd backend
# Environment variables:
#   GEMINI_API_KEY=...

# Start command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend Deployment (Vercel)

```bash
cd frontend
# Environment variables:
#   NEXT_PUBLIC_API_URL=https://your-backend-url/api

vercel deploy
```

## Code Style

- TypeScript for type safety on frontend
- Python Pydantic models for validation on backend
- Modular component structure
- Clear separation of concerns
- Reusable API clients
- Meaningful variable and function names
- Comments explain WHY, not WHAT

## Project Structure

```
VedaAi_assignment/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # Pydantic models
│   │   ├── storage.py       # In-memory storage
│   │   ├── utils.py         # Utilities
│   │   ├── routes/
│   │   │   ├── question_papers.py
│   │   │   └── answer_analysis.py
│   │   └── services/
│   │       ├── document_processor.py
│   │       ├── question_extractor.py
│   │       ├── answer_extractor.py
│   │       └── answer_mapper.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env.local
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main page
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ExamsList.tsx
│   │   ├── QuestionPaperCard.tsx
│   │   ├── NewQuestionPaperModal.tsx
│   │   ├── AnalyzeStudentModal.tsx
│   │   ├── AnalysisViewer.tsx
│   │   └── AnswerSheetViewer.tsx
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   └── utils.ts         # Utilities
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.local
│   └── .env.example
```

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, Pydantic
- **AI**: Google Gemini Vision API
- **Document Processing**: PyMuPDF, Pillow
- **Database**: In-memory (Python dict)
- **Deployment**: Vercel (frontend), Cloud Run/Railway/Heroku (backend)

## Future Enhancements

Potential features (not required for MVP):

- Optional grading/feedback using Gemini
- PDF viewer with embedded answer highlighting
- Permanent database storage (PostgreSQL)
- User authentication and multi-tenant support
- Batch analysis for multiple students
- Export results to PDF/Excel
- Custom question paper templates
- Student performance analytics

## License

Educational assignment project.

## Support

For issues or questions about setup:
1. Check that backend is running (`http://localhost:8000/health`)
2. Verify GEMINI_API_KEY is set
3. Check browser console for frontend errors
4. Check terminal for backend logs
