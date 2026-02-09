import React, { useState, useMemo } from 'react';
import { Page } from 'react-pdf';
import { PageInfo, Block } from '../types';
import { OverlayBox } from './OverlayBox';

interface PDFPageWrapperProps {
  pageNumber: number; // 1-based page number for react-pdf
  pageInfo?: PageInfo; // Data from JSON
  scale: number;
  width?: number;
  onBlockSelect: (block: Block) => void;
  selectedBlock?: Block | null;
  visibleTypes: Set<string>;
}

// Helper to flatten blocks recursively
const flattenBlocks = (blocks: Block[]): Block[] => {
  let result: Block[] = [];
  for (const block of blocks) {
    result.push(block);
    if (block.blocks && block.blocks.length > 0) {
      result = result.concat(flattenBlocks(block.blocks));
    }
  }
  return result;
};

export const PDFPageWrapper: React.FC<PDFPageWrapperProps> = ({ 
  pageNumber, 
  pageInfo, 
  scale, 
  width,
  onBlockSelect,
  selectedBlock,
  visibleTypes
}) => {
  const [renderedDimensions, setRenderedDimensions] = useState<{width: number, height: number} | null>(null);

  // Combine regular paragraph blocks and discarded blocks (headers/footers)
  // And flatten them to include nested blocks (table captions, bodies, etc)
  const allBlocks = useMemo(() => {
    if (!pageInfo) return [];
    
    const topLevel = [
      ...(pageInfo.para_blocks || []),
      ...(pageInfo.discarded_blocks || [])
    ];

    const flattened = flattenBlocks(topLevel);

    // Sort by area descending (largest first) so small blocks sit on top in Z-order
    // Note: In HTML, later elements are on top. So we want largest first, smallest last.
    return flattened.sort((a, b) => {
      const areaA = (a.bbox[2] - a.bbox[0]) * (a.bbox[3] - a.bbox[1]);
      const areaB = (b.bbox[2] - b.bbox[0]) * (b.bbox[3] - b.bbox[1]);
      return areaB - areaA;
    });
  }, [pageInfo]);

  const handlePageLoadSuccess = (page: any) => {
    setRenderedDimensions({ width: page.originalWidth * scale, height: page.originalHeight * scale });
  };

  return (
    <div className="relative mb-8 shadow-md border border-slate-200 bg-white inline-block">
      {/* PDF Layer */}
      <Page 
        pageNumber={pageNumber} 
        scale={scale} 
        width={width}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        onLoadSuccess={handlePageLoadSuccess}
        className="block"
        loading={<div className="h-[800px] w-[600px] bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Page {pageNumber}...</div>}
      />

      {/* Overlay Layer */}
      {pageInfo && (
        <div className="absolute inset-0 z-10 pointer-events-none">
           <div className="relative w-full h-full pointer-events-auto">
             {allBlocks.map((block, idx) => {
                // Determine effective type for visibility check
                // This ensures 'table_caption' shows up when 'table' is selected
                let effectiveType = block.type;
                if (block.type.startsWith('table_')) effectiveType = 'table';
                if (block.type.startsWith('image_')) effectiveType = 'image';

                if (!visibleTypes.has(effectiveType) && !visibleTypes.has('all')) {
                   // If specific type is not checked
                   return null;
                }
                
                return (
                  <OverlayBox
                    key={`${pageInfo.page_idx}-${idx}-${block.index || idx}`}
                    block={block}
                    scale={scale}
                    isSelected={selectedBlock === block}
                    onSelect={onBlockSelect}
                  />
                );
             })}
           </div>
        </div>
      )}
      
      <div className="absolute -left-10 top-0 text-slate-400 font-bold text-lg">
        {pageNumber}
      </div>
    </div>
  );
};