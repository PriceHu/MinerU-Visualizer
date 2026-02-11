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
  // We store the original PDF dimensions to convert relative coordinates
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number} | null>(null);

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
    return flattened.sort((a, b) => {
      // Calculate area roughly. If relative, values are small <1, but relative comparison still holds 
      // as long as they are on the same page.
      const widthA = a.bbox[2] - a.bbox[0];
      const heightA = a.bbox[3] - a.bbox[1];
      const widthB = b.bbox[2] - b.bbox[0];
      const heightB = b.bbox[3] - b.bbox[1];
      return (widthB * heightB) - (widthA * heightA);
    });
  }, [pageInfo]);

  const handlePageLoadSuccess = (page: any) => {
    // page.originalWidth/originalHeight are in PDF points (72dpi typically)
    setPageDimensions({ width: page.originalWidth, height: page.originalHeight });
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
                let effectiveType = block.type;
                if (block.type.startsWith('table_')) effectiveType = 'table';
                if (block.type.startsWith('image_')) effectiveType = 'image';

                if (!visibleTypes.has(effectiveType) && !visibleTypes.has('all')) {
                   return null;
                }

                // Handle Relative Coordinates
                let displayBlock = block;
                if (block.bbox_type === 'relative') {
                   // If dimensions aren't loaded yet, we can't render relative blocks correctly
                   if (!pageDimensions) return null;

                   displayBlock = {
                     ...block,
                     bbox: [
                       block.bbox[0] * pageDimensions.width,
                       block.bbox[1] * pageDimensions.height,
                       block.bbox[2] * pageDimensions.width,
                       block.bbox[3] * pageDimensions.height
                     ]
                   };
                }
                
                return (
                  <OverlayBox
                    key={`${pageInfo.page_idx}-${idx}-${block.index || idx}`}
                    block={displayBlock} // Pass the possibly modified block with absolute coords
                    scale={scale}
                    isSelected={selectedBlock === block} // Compare with original block ref for equality check
                    onSelect={() => onBlockSelect(block)} // Select the original block data
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