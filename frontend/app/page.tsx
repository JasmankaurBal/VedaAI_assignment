"use client";

import { useState } from "react";
import { ExamsList } from "@/components/ExamsList";
import { NewQuestionPaperModal } from "@/components/NewQuestionPaperModal";
import { Header } from "@/components/Header";

export default function Home() {
  const [showNewPaperModal, setShowNewPaperModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Saved Question Papers</h1>
              <p className="text-lg text-gray-600">Upload a question paper once, analyze multiple student answer sheets without re-uploading</p>
            </div>
            <button
              onClick={() => setShowNewPaperModal(true)}
              className="ml-6 px-8 py-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Question Paper
            </button>
          </div>
        </div>

        <ExamsList refreshTrigger={refreshTrigger} />
      </main>

      {showNewPaperModal && (
        <NewQuestionPaperModal
          onClose={() => setShowNewPaperModal(false)}
          onSuccess={() => {
            setShowNewPaperModal(false);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}
