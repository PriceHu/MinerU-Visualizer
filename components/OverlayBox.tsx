import React from 'react';
import { Block } from '../types';
import { getBlockStyle } from '../utils/colors';

interface OverlayBoxProps {
  block: Block;
  scale: number;
  isSelected?: boolean;
  onSelect?: (block: Block) => void;
  showLabel?: boolean;
}

export const OverlayBox: React.FC<OverlayBoxProps> = ({ 
  block, 
  scale, 
  isSelected, 
  onSelect, 
  showLabel = true 
}) => {
  const [x_min, y_min, x_max, y_max] = block.bbox;
  
  const width = (x_max - x_min) * scale;
  const height = (y_max - y_min) * scale;
  const top = y_min * scale;
  const left = x_min * scale;

  const style = getBlockStyle(block.type);

  return (
    <div
      className={`absolute transition-all duration-150 group cursor-pointer ${style.border} ${style.bg}`}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        borderWidth: isSelected ? '2px' : '1px',
        zIndex: isSelected ? 20 : 10,
        opacity: isSelected ? 0.9 : 0.6
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(block);
      }}
      title={`Type: ${block.type}\nBbox: [${block.bbox.join(', ')}]`}
    >
      {/* Label Tag - Always rendered if showLabel is true */}
      {showLabel && (
        <div className={`
          absolute -top-4 left-0 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none
          ${isSelected ? 'opacity-100 ring-1 ring-black/10' : ''}
          bg-white ${style.text} border ${style.border}
        `}>
          {style.label}
        </div>
      )}
      
      {/* Index indicator if available */}
      {block.index !== undefined && (
         <div className="absolute top-0 right-0 p-0.5 text-[8px] text-slate-500 bg-white/80 rounded-bl opacity-0 group-hover:opacity-100">
           #{block.index}
         </div>
      )}
    </div>
  );
};