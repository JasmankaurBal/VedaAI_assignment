"use client";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">VedaAI</h1>
            <p className="text-sm text-gray-500 font-medium">Assessment Extraction & Answer Mapping</p>
          </div>
        </div>
      </div>
    </header>
  );
}
