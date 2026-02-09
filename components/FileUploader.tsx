import React, { useRef } from 'react';
import { Upload, FileJson, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  error?: string;
  icon?: 'json' | 'pdf';
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  label, 
  accept, 
  file, 
  onFileSelect,
  error,
  icon = 'pdf'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div 
        onClick={handleClick}
        className={`
          relative flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
          ${file 
            ? 'border-green-500 bg-green-50' 
            : error 
              ? 'border-red-300 bg-red-50 hover:bg-red-100' 
              : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
          }
        `}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept={accept} 
          className="hidden" 
          onChange={handleChange}
        />
        
        <div className={`
          p-2 rounded-lg
          ${file ? 'bg-green-200 text-green-700' : 'bg-slate-200 text-slate-600'}
        `}>
          {icon === 'json' ? <FileJson size={20} /> : <FileText size={20} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${file ? 'text-green-800' : 'text-slate-600'}`}>
            {file ? file.name : 'Click to browse...'}
          </p>
          {file && (
            <p className="text-xs text-green-600 mt-0.5">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>

        {file && <CheckCircle className="text-green-500" size={20} />}
        {error && !file && <AlertCircle className="text-red-500" size={20} />}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
