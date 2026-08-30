"use client";

import { useState, useRef } from "react";
import { analyzeAnswerSheet } from "@/lib/api";

interface AnalyzeStudentModalProps {
  paperId: string;
  onClose: () => void;
  onAnalysisComplete: (analysisId: string) => void;
}

export function AnalyzeStudentModal({
  paperId,
  onClose,
  onAnalysisComplete,
}: AnalyzeStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileInputRef.current?.files?.[0]) {
      setError("Please select an answer sheet file");
      return;
    }

    const file = fileInputRef.current.files[0];

    try {
      setLoading(true);
      setError(null);
      setProgress("Uploading answer sheet...");
      
      const result = await analyzeAnswerSheet(paperId, file);
      
      setProgress("✓ Analysis complete!");
      setTimeout(() => {
        onAnalysisComplete(result.analysis_id);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze answer sheet");
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8">
          <h2 className="text-2xl font-bold text-white">Analyze Student Answer Sheet</h2>
          <p className="text-orange-50 text-sm mt-2">Against saved question paper</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="answersheet" className="block text-sm font-semibold text-gray-900 mb-3">
              Student Answer Sheet
            </label>
            <div className="relative">
              <input
                id="answersheet"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 font-medium hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                disabled={loading}
              >
                <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {fileName ? fileName : "Select PDF or Image"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported: PDF, PNG, JPG, JPEG
            </p>
          </div>

          {progress && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 text-blue-700 text-sm font-medium flex items-center gap-2">
              {progress.includes("✓") ? (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              )}
              {progress}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
