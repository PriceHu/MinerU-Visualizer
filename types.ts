
export interface Span {
  bbox: [number, number, number, number];
  type: string;
  content: string;
}

export interface Line {
  bbox: [number, number, number, number];
  spans: Span[];
}

export interface Block {
  bbox: [number, number, number, number]; // [x_min, y_min, x_max, y_max]
  type: string;
  lines?: Line[];
  index?: number;
  blocks?: Block[]; // For nested lists or tables
  bbox_type?: 'absolute' | 'relative'; // Support for normalized coordinates
  // Allow for other parsing properties
  [key: string]: any;
}

export interface PageInfo {
  page_size: [number, number]; // [width, height]
  page_idx: number;
  para_blocks: Block[];
  discarded_blocks?: Block[];
}

export interface PDFParsingResult {
  pdf_info: PageInfo[];
  _backend?: string;
  _version_name?: string;
}

export type BlockType = 
  | 'title' 
  | 'text' 
  | 'list' 
  | 'table' 
  | 'image' 
  | 'header' 
  | 'footer' 
  | 'page_number' 
  | 'equation' 
  | 'caption'
  | 'unknown';
