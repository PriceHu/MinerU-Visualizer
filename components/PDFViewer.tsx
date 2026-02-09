import React, { useState } from 'react';
import { Document, pdfjs } from 'react-pdf';
import { PDFParsingResult, Block, PageInfo } from '../types';
import { PDFPageWrapper } from './PDFPageWrapper';
import { ZoomIn, ZoomOut, Maximize, Loader2 } from 'lucide-react';

// Set up the worker
// Using .mjs extension which is standard for newer pdfjs-dist versions
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl: string;
  parsingResult: PDFParsingResult | null;
  onBlockSelect: (block: Block) => void;
  selectedBlock: Block | null;
  visibleTypes: Set<string>;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  parsingResult, 
  onBlockSelect,
  selectedBlock,
  visibleTypes 
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const getPageInfo = (pageIndex: number): PageInfo | undefined => {
    if (!parsingResult) return undefined;
    // PDF pages are 1-based, JSON page_idx is typically 0-based.
    // We need to match them.
    return parsingResult.pdf_info.find(p => p.page_idx === pageIndex);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-600">
            {numPages > 0 ? `${numPages} Pages` : 'Loading PDF...'}
          </span>
          {parsingResult && (
             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
               JSON Linked
             </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs font-medium w-12 text-center text-slate-600">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(s => Math.min(3.0, s + 0.1))}
            className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          <button 
            onClick={() => setScale(1.0)}
            className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
            title="Reset Zoom"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col items-center gap-8"
          loading={
            <div className="flex flex-col items-center gap-4 mt-20">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-slate-500 font-medium">Processing Document...</p>
            </div>
          }
          error={
            <div className="mt-20 text-red-500 font-medium">
              Failed to load PDF file.
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => {
            const pageNum = index + 1;
            const pageInfo = getPageInfo(index);

            return (
              <PDFPageWrapper
                key={`page_${pageNum}`}
                pageNumber={pageNum}
                pageInfo={pageInfo}
                scale={scale}
                onBlockSelect={onBlockSelect}
                selectedBlock={selectedBlock}
                visibleTypes={visibleTypes}
              />
            );
          })}
        </Document>
      </div>
    </div>
  );
};