"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { QuestionPaper, StudentAnalysis } from "@/types";
import { getQuestionPaper, getAnalysis } from "@/lib/api";
import { AnswerSheetViewer } from "./AnswerSheetViewer";
import { AnalyzeStudentModal } from "./AnalyzeStudentModal";

interface AnalysisViewerProps {
  paperId: string;
  analysisId: string;
  onBack: () => void;
  onAnalyzeAnother: () => void;
}

export function AnalysisViewer({
  paperId,
  analysisId,
  onBack,
  onAnalyzeAnother,
}: AnalysisViewerProps) {
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [analysis, setAnalysis] = useState<StudentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [paperData, analysisData] = await Promise.all([
        getQuestionPaper(paperId),
        getAnalysis(analysisId),
      ]);
      setPaper(paperData);
      setAnalysis(analysisData);
      if (paperData.questions.length > 0) {
        setSelectedQuestionId(paperData.questions[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadData();
  }, [paperId, analysisId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !paper || !analysis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error || "Failed to load analysis"}</p>
        <button
          onClick={onBack}
          className="mt-3 text-sm underline hover:no-underline"
        >
          Back to papers
        </button>
      </div>
    );
  }

  const selectedQuestion = paper.questions.find(q => q.id === selectedQuestionId);
  const selectedMapping = analysis.mappings.find(m => m.question_id === selectedQuestionId);
  const selectedAnswer = selectedMapping && selectedMapping.answer_id
    ? analysis.answers.find(a => a.id === selectedMapping.answer_id)
    : null;

  const summary = analysis.summary || {
    total_questions: paper.questions.length,
    answered: paper.questions.length - analysis.unanswered_questions.length,
    unanswered: analysis.unanswered_questions.length,
    unmatched_answers: analysis.unmatched_answers.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium mb-4"
          >
            ← Back to Question Papers
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{paper.name}</h1>
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Total: {summary.total_questions} Questions</span>
            <span className="text-green-600">✓ {summary.answered} Answered</span>
            <span className="text-yellow-600">○ {summary.unanswered} Unanswered</span>
            {summary.unmatched_answers > 0 && (
              <span className="text-red-600">⚠ {summary.unmatched_answers} Unmatched</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Questions List */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4">Questions</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {paper.questions.map((question) => {
                  const mapping = analysis.mappings.find(m => m.question_id === question.id);
                  const isAnswered = mapping?.answer_id !== null && mapping?.answer_id !== undefined;
                  const isUnanswered = analysis.unanswered_questions.includes(question.id);
                  const isSelected = selectedQuestionId === question.id;

                  return (
                    <button
                      key={question.id}
                      onClick={() => setSelectedQuestionId(question.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-orange-100 text-orange-900 border border-orange-300"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {isAnswered ? "✓" : isUnanswered ? "○" : "?"}
                        </span>
                        <span className="flex-1 truncate">{question.number}</span>
                      </div>
                    </button>
                  );
                })}

                {analysis.unmatched_answers.length > 0 && (
                  <>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-medium text-gray-700 text-xs mb-2">Unmatched Answers</h3>
                      {analysis.unmatched_answers.map((answerId) => {
                        const answer = analysis.answers.find(a => a.id === answerId);
                        return (
                          <div
                            key={answerId}
                            className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded mb-2 border border-red-200"
                          >
                            ⚠ {answer?.text?.substring(0, 30)}...
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Answer Detail */}
          <div className="lg:w-1/2 w-full">
            {selectedQuestion ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Question {selectedQuestion.number}
                </h2>
                <p className="text-gray-700 mb-6 whitespace-pre-wrap">
                  {selectedQuestion.text}
                </p>

                {selectedAnswer ? (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Student Answer</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedAnswer.text}
                      </p>
                      {selectedAnswer.confidence && (
                        <p className="text-xs text-gray-500 mt-3">
                          Confidence: {(selectedAnswer.confidence * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>

                    {selectedAnswer.regions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Answer Location: Page {selectedAnswer.regions[0].page}
                        </p>
                        <AnswerSheetViewer
                          paperId={paperId}
                          analysisId={analysisId}
                          selectedAnswer={selectedAnswer}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-t pt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
                      <p>○ This question was not answered</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 border-t pt-6">
                  <button
                    onClick={onAnalyzeAnother}
                    className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Analyze Another Student
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
                No question selected
              </div>
            )}
          </div>
        </div>
      </div>

      {showAnalyzeModal && (
        <AnalyzeStudentModal
          paperId={paperId}
          onClose={() => setShowAnalyzeModal(false)}
          onAnalysisComplete={(newAnalysisId) => {
            // In real app, would navigate to new analysis
            setShowAnalyzeModal(false);
          }}
        />
      )}
    </div>
  );
}
