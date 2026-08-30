import {
  SavedPaperListItem,
  QuestionPaper,
  StudentAnalysis,
  AnalysisSummary,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface QuestionPaperUploadResponse {
  id: string;
  name: string;
  question_count: number;
  page_count: number;
  created_at: string;
}

interface AnswerAnalysisResponse {
  analysis_id: string;
  summary: AnalysisSummary;
  answers: StudentAnalysis["answers"];
  mappings: StudentAnalysis["mappings"];
  unanswered_questions: string[];
  unmatched_answers: string[];
}

// Question Papers API

export async function uploadQuestionPaper(
  file: File,
  name: string
): Promise<QuestionPaperUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  const response = await fetch(`${API_URL}/question-papers`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload question paper");
  }

  return response.json();
}

export async function listQuestionPapers(): Promise<SavedPaperListItem[]> {
  const response = await fetch(`${API_URL}/question-papers`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch question papers");
  }

  return response.json();
}

export async function getQuestionPaper(paperId: string): Promise<QuestionPaper> {
  const response = await fetch(`${API_URL}/question-papers/${paperId}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch question paper");
  }

  return response.json();
}

export async function deleteQuestionPaper(paperId: string): Promise<void> {
  const response = await fetch(`${API_URL}/question-papers/${paperId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete question paper");
  }
}

// Answer Analysis API

export async function analyzeAnswerSheet(
  paperId: string,
  file: File
): Promise<AnswerAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/question-papers/${paperId}/analyze-answer-sheet`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to analyze answer sheet");
  }

  return response.json();
}

export async function getAnalysis(analysisId: string): Promise<StudentAnalysis> {
  const response = await fetch(`${API_URL}/analyses/${analysisId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analysis");
  }

  return response.json();
}
