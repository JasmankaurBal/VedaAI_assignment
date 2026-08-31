"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useRef, useState } from "react";
import { AnalysisViewer } from "@/components/AnalysisViewer";
import { ExamsList } from "@/components/ExamsList";
import { analyzeAnswerSheet, uploadQuestionPaper } from "@/lib/api";

const MAX_SIZE_TEXT = "Max 10MB";
const FILE_ACCEPT = ".pdf,.png,.jpg,.jpeg";

export default function Home() {
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [selectedQuestionPaperId, setSelectedQuestionPaperId] = useState<string | null>(null);
  const [analysisView, setAnalysisView] = useState<{ paperId: string; analysisId: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionPaperInputRef = useRef<HTMLInputElement>(null);
  const answerSheetInputRef = useRef<HTMLInputElement>(null);

  const hasQuestionPaperSource = Boolean(questionPaperFile || selectedQuestionPaperId);
  const canStartMapping = hasQuestionPaperSource && Boolean(answerSheetFile) && !isSubmitting;

  const handleQuestionPaperFileChange = (file: File | null) => {
    setQuestionPaperFile(file);
    setSelectedQuestionPaperId(null);
    setError(null);
  };

  const handleAnswerSheetFileChange = (file: File | null) => {
    setAnswerSheetFile(file);
    setError(null);
  };

  const handleStartMapping = async () => {
    if (!canStartMapping || !answerSheetFile) {
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      let paperId = selectedQuestionPaperId;
      if (!paperId && questionPaperFile) {
        const uploadedPaper = await uploadQuestionPaper(
          questionPaperFile,
          questionPaperFile.name.replace(/\.[^/.]+$/, "") || "Question Paper"
        );
        paperId = uploadedPaper.id;
      }

      if (!paperId) {
        throw new Error("Please select or upload a question paper before starting mapping.");
      }

      const result = await analyzeAnswerSheet(paperId, answerSheetFile);
      setAnalysisView({ paperId, analysisId: result.analysis_id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start mapping");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (analysisView) {
    return (
      <AnalysisViewer
        paperId={analysisView.paperId}
        analysisId={analysisView.analysisId}
        onBack={() => setAnalysisView(null)}
        onAnalyzeAnother={() => setAnalysisView(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Question Paper &amp; Answer Sheets</h1>
          <p className="text-lg text-gray-600">Upload both files to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          <UploadCard
            title="Upload Question Paper"
            description="Teacher's question paper source for extraction"
            accent="orange"
            file={questionPaperFile}
            helperText={MAX_SIZE_TEXT}
            inputRef={questionPaperInputRef}
            accept={FILE_ACCEPT}
            onFileChange={handleQuestionPaperFileChange}
            onReplace={() => questionPaperInputRef.current?.click()}
          />

          <UploadCard
            title="Upload Answer Sheet"
            description="Student handwritten answer pages for analysis"
            accent="amber"
            file={answerSheetFile}
            helperText={MAX_SIZE_TEXT}
            inputRef={answerSheetInputRef}
            accept={FILE_ACCEPT}
            onFileChange={handleAnswerSheetFileChange}
            onReplace={() => answerSheetInputRef.current?.click()}
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 mb-10">
          <div className="text-sm font-medium text-gray-600">
            {questionPaperFile || selectedQuestionPaperId ? "Question Paper ✓" : "Question Paper ✕"}
            <span className="mx-3 text-gray-300">|</span>
            {answerSheetFile ? "Answer Sheet ✓" : "Answer Sheet ✕"}
          </div>

          {questionPaperFile || selectedQuestionPaperId ? (
            answerSheetFile ? (
              <div className="text-sm font-semibold text-green-700">Ready to evaluate</div>
            ) : (
              <div className="text-sm text-gray-600">Upload both files to start evaluation</div>
            )
          ) : (
            <div className="text-sm text-gray-600">Upload both files to start evaluation</div>
          )}

          <button
            type="button"
            onClick={handleStartMapping}
            disabled={!canStartMapping}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Start Mapping →"}
          </button>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Question Papers</h2>
            <p className="text-sm text-gray-600 mt-1">Use an existing paper or upload a fresh one above.</p>
          </div>

          <ExamsList
            selectionMode
            selectedPaperId={selectedQuestionPaperId}
            onSelectPaper={(paperId) => {
              setSelectedQuestionPaperId(paperId);
              setQuestionPaperFile(null);
              setError(null);
            }}
          />
        </div>
      </main>
    </div>
  );
}

interface UploadCardProps {
  title: string;
  description: string;
  accent: "orange" | "amber";
  file: File | null;
  helperText: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onFileChange: (file: File | null) => void;
  onReplace: () => void;
}

function UploadCard({
  title,
  description,
  accent,
  file,
  helperText,
  inputRef,
  accept,
  onFileChange,
  onReplace,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const accentClasses =
    accent === "orange"
      ? "bg-orange-50 text-orange-600 border-orange-200"
      : "bg-amber-50 text-amber-600 border-amber-200";

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    if (droppedFile) {
      onFileChange(droppedFile);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 shadow-sm transition-all duration-200 ${
        isDragging
          ? "border-orange-400 bg-orange-50 shadow-md"
          : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full border ${accentClasses}`}>
          <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.9A5.5 5.5 0 0116.5 8H17a4 4 0 110 8H7zm5-8v6m0 0l-2-2m2 2l2-2" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            onFileChange(nextFile);
            if (event.target) {
              event.target.value = "";
            }
          }}
        />

        {!file ? (
          <>
            <div className="mb-4 text-lg font-semibold text-gray-900 transition-colors">{title}</div>
            <p className="mb-4 text-sm text-gray-500">{description}</p>
            <p className="text-sm font-medium text-gray-500">{helperText}</p>
          </>
        ) : (
          <>
            <div className="mb-4 w-full rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-left">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-base text-green-600">✓</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900">{file.name}</div>
                  <div className="mt-1 text-xs text-gray-600">{title}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onReplace();
              }}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              Replace
            </button>
          </>
        )}
      </div>
    </div>
  );
}
