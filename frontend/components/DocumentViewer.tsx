"use client";

import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { AnswerRegion } from "@/types";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface DocumentRegion extends AnswerRegion {
  label?: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface DocumentViewerProps {
  fileUrl: string;
  fileName: string;
  activePage?: number;
  regions: DocumentRegion[];
  selectedLabel: string;
  highlightColor?: "orange" | "green";
  onPageChange?: (page: number) => void;
}

const BASE_WIDTH = 760;
const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2];

function isPdfFile(fileName: string) {
  return fileName.toLowerCase().endsWith(".pdf");
}

function isRenderableImageFile(fileName: string) {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp");
}

function getDisplayBox(region: AnswerRegion, width: number, height: number) {
  return {
    left: region.bbox.x * width,
    top: region.bbox.y * height,
    width: region.bbox.width * width,
    height: region.bbox.height * height,
  };
}

export function DocumentViewer({
  fileUrl,
  fileName,
  activePage = 1,
  regions,
  selectedLabel,
  highlightColor = "orange",
  onPageChange,
}: DocumentViewerProps) {
  const pdfMode = useMemo(() => isPdfFile(fileName), [fileName]);
  const imageMode = useMemo(() => isRenderableImageFile(fileName), [fileName]);
  const [currentPage, setCurrentPage] = useState(activePage);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pdfPageSize, setPdfPageSize] = useState<{ width: number; height: number } | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const zoom = ZOOM_STEPS[zoomIndex];
  const pageRegions = regions.filter((region) => region.page === currentPage);

  useEffect(() => {
    setCurrentPage(activePage);
    setPageCount(1);
    setPdfPageSize(null);
    setImageSize(null);
  }, [fileUrl, fileName, activePage]);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
      onPageChange?.(pageCount);
    }
  }, [currentPage, pageCount, onPageChange]);

  const renderedWidth = BASE_WIDTH * zoom;
  const renderedHeight = pdfMode
    ? pdfPageSize
      ? pdfPageSize.height * (renderedWidth / pdfPageSize.width)
      : BASE_WIDTH * 1.3 * zoom
    : imageSize
      ? imageSize.height * (renderedWidth / imageSize.width)
      : BASE_WIDTH * 1.3 * zoom;

  const handlePrev = () => {
    const nextPage = Math.max(1, currentPage - 1);
    setCurrentPage(nextPage);
    onPageChange?.(nextPage);
  };

  const handleNext = () => {
    const nextPage = Math.min(pageCount, currentPage + 1);
    setCurrentPage(nextPage);
    onPageChange?.(nextPage);
  };

  const handleZoomOut = () => setZoomIndex((index) => Math.max(0, index - 1));
  const handleZoomIn = () => setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1));
  const handleZoomReset = () => setZoomIndex(1);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-sm font-semibold text-slate-700">
          {selectedLabel}
          <span className="ml-2 font-normal text-slate-400">
            Page {currentPage} of {pageCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Zoom Out
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            100%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Zoom In
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous Page
        </button>
        <span className="font-medium">Zoom {Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= pageCount}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next Page
        </button>
      </div>

      <div className="overflow-auto bg-slate-100 p-4">
        <div className="relative mx-auto w-fit" style={{ width: renderedWidth }}>
          {pdfMode ? (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }: { numPages: number }) => {
                setPageCount(numPages);
                const nextPage = Math.min(activePage, numPages);
                setCurrentPage(nextPage);
                onPageChange?.(nextPage);
              }}
              loading={<div className="rounded-xl bg-white p-10 text-sm text-slate-500">Loading document...</div>}
              error={<div className="rounded-xl bg-red-50 p-10 text-sm text-red-700">Unable to load document.</div>}
            >
              <div className="relative" style={{ width: renderedWidth, height: renderedHeight }}>
                <Page
                  pageNumber={currentPage}
                  width={renderedWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onRenderSuccess={(page: any) => {
                    const viewport = page.getViewport({ scale: 1 });
                    setPdfPageSize({ width: viewport.width, height: viewport.height });
                  }}
                />
                {pageRegions.map((region, index) => {
                  const box = getDisplayBox(region, renderedWidth, renderedHeight);
                  const isActive = Boolean(region.isActive);
                  const activeClasses = highlightColor === "green"
                    ? "border-emerald-600 bg-emerald-300/35 shadow-[0_0_0_2px_rgba(16,185,129,0.18)]"
                    : "border-orange-600 bg-orange-500/20 shadow-[0_0_0_2px_rgba(249,115,22,0.12)]";
                  return (
                    <button
                      type="button"
                      key={`${region.page}-${index}`}
                      onClick={region.onClick}
                      className={`absolute rounded-lg border-2 transition-all ${
                        region.onClick ? "cursor-pointer" : "cursor-default"
                      } ${
                        isActive
                          ? activeClasses
                          : "border-transparent bg-transparent hover:border-slate-300/50 hover:bg-slate-200/10"
                      }`}
                      style={{
                        left: box.left,
                        top: box.top,
                        width: box.width,
                        height: box.height,
                      }}
                    >
                      {isActive && (region.label || index === 0) && (
                        <div
                          className={`-translate-y-1/2 absolute left-0 top-0 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm ${
                            highlightColor === "green" ? "bg-emerald-600" : "bg-orange-600"
                          }`}
                        >
                          {region.label || selectedLabel}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Document>
          ) : imageMode ? (
            <div className="relative" style={{ width: renderedWidth, height: renderedHeight }}>
              <img
                src={fileUrl}
                alt={selectedLabel}
                className="block h-full w-full select-none object-contain"
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  setImageSize({ width: naturalWidth, height: naturalHeight });
                }}
              />
              {pageRegions.map((region, index) => {
                const box = getDisplayBox(region, renderedWidth, renderedHeight);
                const isActive = Boolean(region.isActive);
                const activeClasses = highlightColor === "green"
                  ? "border-emerald-600 bg-emerald-300/35 shadow-[0_0_0_2px_rgba(16,185,129,0.18)]"
                  : "border-orange-600 bg-orange-500/20 shadow-[0_0_0_2px_rgba(249,115,22,0.12)]";
                return (
                  <button
                    type="button"
                    key={`${region.page}-${index}`}
                    onClick={region.onClick}
                    className={`absolute rounded-lg border-2 transition-all ${
                      region.onClick ? "cursor-pointer" : "cursor-default"
                    } ${
                      isActive
                        ? activeClasses
                        : "border-transparent bg-transparent hover:border-slate-300/50 hover:bg-slate-200/10"
                    }`}
                    style={{
                      left: box.left,
                      top: box.top,
                      width: box.width,
                      height: box.height,
                    }}
                  >
                    {isActive && (region.label || index === 0) && (
                      <div
                        className={`-translate-y-1/2 absolute left-0 top-0 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm ${
                          highlightColor === "green" ? "bg-emerald-600" : "bg-orange-600"
                        }`}
                      >
                        {region.label || selectedLabel}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              Preview unavailable for this file type. The backend can still process the upload, but the
              annotation canvas is designed for PDF and image documents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
