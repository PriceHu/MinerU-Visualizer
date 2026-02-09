import React, { useState, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { PDFViewer } from './components/PDFViewer';
import { PDFParsingResult, Block, PageInfo } from './types';
import { getBlockStyle } from './utils/colors';
import { Layers, Box, Info, Eye, EyeOff, Layout } from 'lucide-react';

// Default types to show
const ALL_TYPES = ['title', 'text', 'list', 'table', 'image', 'header', 'footer', 'page_number', 'equation', 'caption'];

export default function App() {
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [parsingResult, setParsingResult] = useState<PDFParsingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(ALL_TYPES));

  // Handle PDF File Selection
  const handlePdfSelect = (file: File) => {
    setPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  };

  // Handle JSON File Selection and Parsing
  const handleJsonSelect = (file: File) => {
    setJsonFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        
        // Basic validation
        if (!json.pdf_info && !Array.isArray(json)) {
           throw new Error("Invalid JSON format: missing 'pdf_info' or not an array structure.");
        }

        // Support both { pdf_info: [...] } and direct array formats if applicable, 
        // but user prompt suggests { pdf_info: [...] }
        const result: PDFParsingResult = json.pdf_info ? json : { pdf_info: json };
        
        setParsingResult(result);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to parse JSON file. Please check the format.");
        setParsingResult(null);
      }
    };
    reader.readAsText(file);
  };

  const toggleTypeVisibility = (type: string) => {
    const newSet = new Set(visibleTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setVisibleTypes(newSet);
  };

  const toggleAllTypes = () => {
    if (visibleTypes.size === ALL_TYPES.length) {
      setVisibleTypes(new Set());
    } else {
      setVisibleTypes(new Set(ALL_TYPES));
    }
  };

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar - Controls */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-30 shadow-lg">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Layout className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-slate-800">MinerU Visualizer</h1>
          </div>
          <p className="text-xs text-slate-500">Layout Analysis & Inspection Tool</p>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
          {/* File Inputs */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Input Files</h2>
            <FileUploader 
              label="1. Upload PDF Document" 
              accept=".pdf" 
              file={pdfFile} 
              onFileSelect={handlePdfSelect} 
              icon="pdf"
            />
            <FileUploader 
              label="2. Upload Analysis JSON" 
              accept=".json" 
              file={jsonFile} 
              onFileSelect={handleJsonSelect} 
              error={error || undefined}
              icon="json"
            />
          </section>

          {/* Layer Controls */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Layers</h2>
              <button 
                onClick={toggleAllTypes}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {visibleTypes.size === ALL_TYPES.length ? 'Hide All' : 'Show All'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {ALL_TYPES.map(type => {
                const style = getBlockStyle(type);
                const isVisible = visibleTypes.has(type);
                
                return (
                  <button
                    key={type}
                    onClick={() => toggleTypeVisibility(type)}
                    className={`
                      flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all border
                      ${isVisible 
                        ? 'bg-white border-slate-200 shadow-sm text-slate-700' 
                        : 'bg-slate-50 border-transparent text-slate-400 opacity-60'
                      }
                    `}
                  >
                    <div className={`w-2 h-2 rounded-full ${style.bg.replace('/10', '')} ${style.border}`}></div>
                    <span className="capitalize flex-1 text-left">{type.replace('_', ' ')}</span>
                    {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Selected Block Info */}
          <section className="flex-1 min-h-[200px] flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Inspector</h2>
            <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 p-4 overflow-auto">
              {selectedBlock ? (
                <div className="space-y-4">
                  <div>
                    <span className={`
                      inline-block px-2 py-1 rounded text-xs font-bold uppercase mb-2
                      ${getBlockStyle(selectedBlock.type).bg} ${getBlockStyle(selectedBlock.type).text}
                    `}>
                      {selectedBlock.type}
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-mono mt-1">
                      <div className="bg-white px-2 py-1 rounded border">x: {Math.round(selectedBlock.bbox[0])}</div>
                      <div className="bg-white px-2 py-1 rounded border">y: {Math.round(selectedBlock.bbox[1])}</div>
                      <div className="bg-white px-2 py-1 rounded border">w: {Math.round(selectedBlock.bbox[2] - selectedBlock.bbox[0])}</div>
                      <div className="bg-white px-2 py-1 rounded border">h: {Math.round(selectedBlock.bbox[3] - selectedBlock.bbox[1])}</div>
                    </div>
                  </div>

                  {/* Recursively show content if available in lines/spans */}
                  {selectedBlock.lines && (
                     <div className="space-y-2">
                       <p className="text-xs font-semibold text-slate-700">Content:</p>
                       <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 max-h-40 overflow-y-auto">
                         {selectedBlock.lines.map((line, i) => (
                           <p key={i} className="mb-1 leading-relaxed">
                             {line.spans?.map(s => s.content).join(' ')}
                           </p>
                         ))}
                       </div>
                     </div>
                  )}
                  
                  {/* Fallback for table HTML content if exists */}
                  {(selectedBlock as any).html && (
                    <div className="space-y-2">
                       <p className="text-xs font-semibold text-slate-700">HTML Preview:</p>
                       <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded max-h-40 overflow-auto font-mono">
                         {(selectedBlock as any).html}
                       </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Raw Data</p>
                    <pre className="text-[10px] text-slate-500 mt-1 overflow-x-auto">
                      {JSON.stringify({ ...selectedBlock, lines: '[...]' }, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Box size={24} />
                  <p className="text-sm text-center">Select a block on the PDF<br/>to inspect details</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col">
        {pdfUrl ? (
          <PDFViewer 
            pdfUrl={pdfUrl}
            parsingResult={parsingResult}
            onBlockSelect={setSelectedBlock}
            selectedBlock={selectedBlock}
            visibleTypes={visibleTypes}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Layers size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Ready to Visualize</h2>
            <p className="text-center max-w-md text-slate-500">
              Upload both a PDF document and its corresponding JSON analysis file from the sidebar to start visualizing the layout detection.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}