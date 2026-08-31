"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { SavedPaperListItem } from "@/types";
import { listQuestionPapers } from "@/lib/api";
import { QuestionPaperCard } from "./QuestionPaperCard";

interface ExamsListProps {
  refreshTrigger?: number;
  selectionMode?: boolean;
  selectedPaperId?: string | null;
  onSelectPaper?: (paperId: string) => void;
}

export function ExamsList({
  refreshTrigger = 0,
  selectionMode = false,
  selectedPaperId = null,
  onSelectPaper,
}: ExamsListProps) {
  const [papers, setPapers] = useState<SavedPaperListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPapers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listQuestionPapers();
      setPapers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load papers");
    } finally {
      setLoading(false);
    }
  };

  const handlePaperDeleted = () => {
    loadPapers();
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadPapers();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading question papers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-semibold mb-2">Error loading papers</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center shadow-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">No question papers yet</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Upload your first question paper to get started. You can then reuse it for analyzing multiple students&apos; answer sheets.
        </p>
      </div>
    );
  }

  if (selectionMode) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {papers.map((paper) => {
          const isSelected = selectedPaperId === paper.id;

          return (
            <div
              key={paper.id}
              className={`rounded-xl border p-5 transition-all duration-200 ${
                isSelected
                  ? "border-orange-300 bg-orange-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-orange-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{paper.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {paper.question_count} Questions • {paper.page_count} Pages
                  </p>
                </div>
                {isSelected && (
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                    Selected
                  </span>
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectPaper?.(paper.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSelected
                      ? "bg-orange-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:text-orange-700"
                  }`}
                >
                  {isSelected ? "Selected" : "Use this paper"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {papers.map((paper) => (
        <QuestionPaperCard
          key={paper.id}
          paper={paper}
          onDeleted={handlePaperDeleted}
        />
      ))}
    </div>
  );
}
