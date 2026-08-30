"use client";

import { ExtractedAnswer } from "@/types";

interface AnswerSheetViewerProps {
  paperId: string;
  analysisId: string;
  selectedAnswer: ExtractedAnswer;
}

export function AnswerSheetViewer({
  paperId,
  analysisId,
  selectedAnswer,
}: AnswerSheetViewerProps) {
  // This component will display the answer sheet with highlighting
  // For now, show a placeholder
  
  return (
    <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600 min-h-96">
      <p className="mb-2">Answer Sheet Viewer</p>
      <p className="text-sm text-gray-500">
        Pages: {selectedAnswer.regions.map(r => r.page).join(", ")}
      </p>
      <p className="text-xs text-gray-400 mt-4">
        Answer region highlighting coming soon
      </p>
    </div>
  );
}
