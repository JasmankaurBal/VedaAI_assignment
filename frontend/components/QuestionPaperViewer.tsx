"use client";

import { DocumentViewer, type DocumentRegion } from "./DocumentViewer";

interface QuestionPaperViewerProps {
  fileUrl: string;
  fileName: string;
  selectedQuestionNumber: string;
  regions: DocumentRegion[];
  activePage?: number;
  onPageChange?: (page: number) => void;
}

export function QuestionPaperViewer({
  fileUrl,
  fileName,
  selectedQuestionNumber,
  regions,
  activePage = 1,
  onPageChange,
}: QuestionPaperViewerProps) {
  return (
    <DocumentViewer
      fileUrl={fileUrl}
      fileName={fileName}
      activePage={activePage}
      regions={regions}
      selectedLabel={selectedQuestionNumber}
      highlightColor="orange"
      onPageChange={onPageChange}
    />
  );
}
