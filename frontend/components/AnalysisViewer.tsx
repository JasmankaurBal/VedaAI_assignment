"use client";

import { useEffect, useMemo, useState } from "react";
import { QuestionPaper, StudentAnalysis } from "@/types";
import {
  getQuestionPaper,
  getAnalysis,
  getAnswerSheetUrl,
  getQuestionPaperFileUrl,
} from "@/lib/api";
import { AnswerSheetViewer } from "./AnswerSheetViewer";
import { QuestionPaperViewer } from "./QuestionPaperViewer";
import type { DocumentRegion } from "./DocumentViewer";

interface AnalysisViewerProps {
  paperId: string;
  analysisId: string;
  onBack: () => void;
  onAnalyzeAnother: () => void;
}

function formatQuestionNumber(value: string) {
  return value.toUpperCase().startsWith("Q") ? value : `Q${value}`;
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
  const [questionPage, setQuestionPage] = useState(1);
  const [answerPage, setAnswerPage] = useState(1);

  useEffect(() => {
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

    void loadData();
  }, [paperId, analysisId]);

  const questionPaperFileUrl = useMemo(() => getQuestionPaperFileUrl(paperId), [paperId]);
  const answerSheetFileUrl = useMemo(() => getAnswerSheetUrl(analysisId), [analysisId]);

  useEffect(() => {
    if (!paper || !analysis || !selectedQuestionId) {
      return;
    }

    const question = paper.questions.find((item) => item.id === selectedQuestionId);
    const mapping = analysis.mappings.find((item) => item.question_id === selectedQuestionId);
    const answer = mapping?.answer_id
      ? analysis.answers.find((item) => item.id === mapping.answer_id)
      : null;

    const questionRegionPage = mapping?.question_region?.page ?? question?.region?.page ?? 1;
    const answerRegionPage = mapping?.answer_region?.page ?? answer?.regions?.[0]?.page ?? questionRegionPage;

    setQuestionPage(questionRegionPage);
    setAnswerPage(answerRegionPage);
  }, [analysis, paper, selectedQuestionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !paper || !analysis) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
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

  const selectedQuestion = paper.questions.find((item) => item.id === selectedQuestionId) ?? null;
  const selectedMapping = analysis.mappings.find((item) => item.question_id === selectedQuestionId) ?? null;
  const selectedAnswer = selectedMapping?.answer_id
    ? analysis.answers.find((item) => item.id === selectedMapping.answer_id) ?? null
    : null;

  const summary = analysis.summary || {
    total_questions: paper.questions.length,
    answered: paper.questions.length - analysis.unanswered_questions.length,
    unanswered: analysis.unanswered_questions.length,
    unmatched_answers: analysis.unmatched_answers.length,
  };

  const questionRegions: DocumentRegion[] = paper.questions.flatMap((question) =>
    question.region
      ? [
          {
            ...question.region,
            label: formatQuestionNumber(question.number),
            isActive: question.id === selectedQuestionId,
            onClick: () => setSelectedQuestionId(question.id),
          },
        ]
      : []
  );
  const answerRegions: DocumentRegion[] = selectedAnswer?.regions?.length
    ? selectedAnswer.regions.map((region, index) => ({
        ...region,
        label: index === 0 ? "Selected answer" : undefined,
        isActive: true,
      }))
    : selectedMapping?.answer_region
      ? [
          {
            ...selectedMapping.answer_region,
            label: "Selected answer",
            isActive: true,
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <button
            onClick={onBack}
            className="mb-4 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            {"<"} Back to Question Papers
          </button>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{paper.name}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Click a question hotspot on the paper to sync the handwritten answer highlight.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Total: {summary.total_questions}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                Answered: {summary.answered}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                Unanswered: {summary.unanswered}
              </span>
              {summary.unmatched_answers > 0 && (
                <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                  Unmatched: {summary.unmatched_answers}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Questions
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {paper.questions.map((question) => {
                const mapping = analysis.mappings.find((item) => item.question_id === question.id);
                const isSelected = selectedQuestionId === question.id;
                const scoreLabel = mapping?.max_score != null
                  ? `${mapping.score ?? 0}/${mapping.max_score}`
                  : "0/0";

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setSelectedQuestionId(question.id)}
                    className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-200 hover:border-orange-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-semibold text-slate-800">{question.number}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {scoreLabel}
                    </span>
                  </button>
                );
              })}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="space-y-4">
            <QuestionPaperViewer
              fileUrl={questionPaperFileUrl}
              fileName={paper.original_file_name}
              selectedQuestionNumber={selectedQuestion ? formatQuestionNumber(selectedQuestion.number) : "Q"}
              regions={questionRegions}
              activePage={questionPage}
              onPageChange={setQuestionPage}
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedQuestion ? formatQuestionNumber(selectedQuestion.number) : "Question"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedMapping?.match_type === "direct"
                      ? "Direct match"
                      : selectedMapping?.match_type === "semantic"
                        ? "Semantic match"
                        : "No answer detected"}
                  </p>
                </div>
                {selectedMapping?.max_score != null && (
                  <div className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                    {selectedMapping.score ?? 0}/{selectedMapping.max_score}
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    AI Feedback
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {selectedMapping?.feedback || "No feedback available."}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Answer Status
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {selectedAnswer
                      ? "The original handwritten answer is highlighted on the right."
                      : "No answer region was detected for this question."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <AnswerSheetViewer
              fileUrl={answerSheetFileUrl}
              fileName={analysis.original_file_name}
              selectedQuestionNumber={selectedQuestion ? formatQuestionNumber(selectedQuestion.number) : "Q"}
              regions={answerRegions}
              activePage={answerPage}
              onPageChange={setAnswerPage}
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Selected Question</h3>
                  <p className="text-sm text-slate-600">
                    {selectedQuestion ? formatQuestionNumber(selectedQuestion.number) : "None"}
                  </p>
                </div>
                <button
                  onClick={onAnalyzeAnother}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Analyze Another Student
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
