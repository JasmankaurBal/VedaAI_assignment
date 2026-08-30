"use client";

import { useState } from "react";
import { SavedPaperListItem } from "@/types";
import { deleteQuestionPaper, getQuestionPaper } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { AnalyzeStudentModal } from "./AnalyzeStudentModal";
import { AnalysisViewer } from "./AnalysisViewer";

interface QuestionPaperCardProps {
  paper: SavedPaperListItem;
  onDeleted: () => void;
}

export function QuestionPaperCard({ paper, onDeleted }: QuestionPaperCardProps) {
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this question paper?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteQuestionPaper(paper.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete paper");
    } finally {
      setLoading(false);
    }
  };

  if (currentAnalysisId) {
    return (
      <AnalysisViewer
        paperId={paper.id}
        analysisId={currentAnalysisId}
        onBack={() => {
          setCurrentAnalysisId(null);
          setShowAnalyzeModal(false);
        }}
        onAnalyzeAnother={() => {
          setCurrentAnalysisId(null);
          setShowAnalyzeModal(true);
        }}
      />
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-200 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{paper.name}</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {paper.question_count} Questions • {paper.page_count} Pages
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-5">
          Created {formatDate(paper.created_at)}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalyzeModal(true)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Analyze Student
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-3 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors disabled:opacity-50"
            title="Delete this question paper"
          >
            Delete
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mt-3">
            {error}
          </div>
        )}
      </div>

      {showAnalyzeModal && (
        <AnalyzeStudentModal
          paperId={paper.id}
          onClose={() => setShowAnalyzeModal(false)}
          onAnalysisComplete={(analysisId) => {
            setCurrentAnalysisId(analysisId);
          }}
        />
      )}
    </>
  );
}
