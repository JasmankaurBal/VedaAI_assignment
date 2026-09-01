export interface AnalysisSummary {
  total_questions: number;
  answered: number;
  unanswered: number;
  unmatched_answers: number;
}


export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnswerRegion {
  page: number;
  bbox: BoundingBox;
}

export interface Question {
  id: string;
  number: string;
  order: number;
  text: string;
  region?: AnswerRegion | null;
}

export interface QuestionPaper {
  id: string;
  name: string;
  original_file_name: string;
  created_at: string;
  questions: Question[];
  page_count: number;
}

export interface ExtractedAnswer {
  id: string;
  detected_question_number: string | null;
  text: string;
  regions: AnswerRegion[];
  confidence: number | null;
}

export interface QuestionAnswerMapping {
  question_id: string;
  answer_id: string | null;
  confidence: number | null;
  match_type: string;
  question_region?: AnswerRegion | null;
  answer_region?: AnswerRegion | null;
  score?: number | null;
  max_score?: number | null;
  feedback?: string | null;
}

export interface StudentAnalysis {
  id: string;
  question_paper_id: string;
  original_file_name: string;
  created_at: string;
  answers: ExtractedAnswer[];
  mappings: QuestionAnswerMapping[];
  unmatched_answers: string[];
  unanswered_questions: string[];
  summary?: AnalysisSummary;
}

export interface SavedPaperListItem {
  id: string;
  name: string;
  original_file_name: string;
  question_count: number;
  page_count: number;
  created_at: string;
}
