"use client";

import { useState, useRef } from "react";
import { uploadQuestionPaper } from "@/lib/api";

interface NewQuestionPaperModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NewQuestionPaperModal({
  onClose,
  onSuccess,
}: NewQuestionPaperModalProps) {
  const [examName, setExamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionFileName, setQuestionFileName] = useState<string | null>(null);
  const questionFileRef = useRef<HTMLInputElement>(null);
  const [answerFileName, setAnswerFileName] = useState<string | null>(null);
  const answerFileRef = useRef<HTMLInputElement>(null);

  const handleQuestionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuestionFileName(file.name);
      setError(null);
    }
  };

  const handleAnswerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnswerFileName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionFileRef.current?.files?.[0]) {
      setError("Please select a question paper file");
      return;
    }

    const file = questionFileRef.current.files[0];

    try {
      setLoading(true);
      setError(null);
      setProgress("Uploading and processing...");
      
      await uploadQuestionPaper(file, examName.trim() || "");
      
      setProgress("✓ Question paper processed successfully");
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload paper");
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8">
          <h2 className="text-2xl font-bold text-white">Upload Exam Documents</h2>
          <p className="text-orange-50 text-sm mt-2">Question Paper & Answer Sheet</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Question Paper Name <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Class 10 Science - Mid Term 2026"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">If left empty, a name will be auto-generated with the current date/time</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-center text-gray-700 font-medium mb-4">UPLOAD DOCUMENTS</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Question Paper Card */}
              <div className="flex-1 min-w-[260px]">
                <label className="block text-sm font-semibold text-gray-900 mb-2">QUESTION PAPER</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <button
                    type="button"
                    onClick={() => questionFileRef.current?.click()}
                    className="w-full focus:outline-none"
                    disabled={loading}
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-md flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v12a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    {questionFileName ? (
                      <div className="text-sm flex items-center justify-center gap-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        {questionFileName}
                      </div>
                    ) : (
                      "Select PDF or Image"
                    )}
                  </button>
                  <input
                    id="question-file"
                    ref={questionFileRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleQuestionFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">Supported: PDF, PNG, JPG, JPEG</p>
                </div>
              </div>

              {/* Connector */}
              <div className="hidden md:block text-2xl font-bold text-gray-400">+</div>

              {/* Answer Sheet Card */}
              <div className="flex-1 min-w-[260px]">
                <label className="block text-sm font-semibold text-gray-900 mb-2">ANSWER SHEET</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <button
                    type="button"
                    onClick={() => answerFileRef.current?.click()}
                    className="w-full focus:outline-none"
                    disabled={loading}
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-md flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M12 4v16M8 8h8M8 12h8M8 16h8" />
                      </svg>
                    </div>
                    {answerFileName ? (
                      <div className="text-sm flex items-center justify-center gap-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        {answerFileName}
                      </div>
                    ) : (
                      "Select PDF or Image"
                    )}
                  </button>
                  <input
                    id="answer-file"
                    ref={answerFileRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleAnswerFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">Supported: PDF, PNG, JPG, JPEG</p>
                </div>
              </div>
            </div>
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
              {loading ? "Processing..." : "Upload & Process"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
