import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, AlertCircle, Loader2, Check } from 'lucide-react';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: File, description?: string) => Promise<void>;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setErrorMessage(null);
      setStatus('idle');
    } else {
      setFile(null);
      setErrorMessage('Please select a valid CSV file (.csv)');
      setStatus('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setStatus('uploading');
      setErrorMessage(null);
      await onUploadSuccess(file, description.trim());
      setStatus('success');
      // Close after a brief delay to show success checkmark
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Failed to upload and parse CSV. Ensure it is a valid format.');
    }
  };

  const handleClose = () => {
    setFile(null);
    setDescription('');
    setStatus('idle');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative glass-panel w-full max-w-lg bg-slate-900 border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-tight">Upload CSV Dataset</h2>
          <button 
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Body */}
        <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/5 scale-[0.99]' 
                : file 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {status === 'success' ? (
              <div className="flex flex-col items-center animate-in zoom-in-90 duration-300">
                <div className="p-4 rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 mb-4">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <p className="text-emerald-400 font-bold text-base">Upload Complete!</p>
                <p className="text-slate-400 text-xs mt-1">Dataset registered successfully.</p>
              </div>
            ) : status === 'uploading' ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-white font-semibold text-sm">Analyzing CSV file with Pandas...</p>
                <p className="text-slate-500 text-xs mt-1">Extracting features and row counts.</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center text-center">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/25">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <p className="text-white font-semibold text-sm line-clamp-1 px-4">{file.name}</p>
                <p className="text-slate-500 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-3 text-xs text-rose-400 hover:text-rose-300 hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 mb-3 group-hover:text-white transition-colors">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-white font-semibold text-sm">
                  Drag and drop your CSV file here
                </p>
                <p className="text-slate-500 text-xs mt-1.5">
                  or <span className="text-indigo-400 hover:underline font-medium">browse files</span>
                </p>
                <span className="text-[10px] text-slate-600 mt-3 font-semibold uppercase tracking-wider">
                  Supports .csv files up to 20MB
                </span>
              </div>
            )}
          </div>

          {/* Description field (optional, only enabled when file is selected) */}
          {file && status !== 'uploading' && status !== 'success' && (
            <div className="animate-in slide-in-from-bottom-3 duration-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Dataset Description <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this uploaded dataset (e.g. Kaggle sales records)..."
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              />
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={status === 'uploading'}
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || status === 'uploading' || status === 'success'}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/25 disabled:opacity-30 disabled:scale-100 disabled:pointer-events-none transition-all duration-200 hover:scale-[1.02]"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Upload & Parse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CSVUploadModal;
