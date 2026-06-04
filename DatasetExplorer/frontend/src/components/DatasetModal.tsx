import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Dataset, DatasetStatus, DatasetType } from '../types';

interface DatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  dataset?: Dataset | null; // If provided, we are in Edit Mode
}

export const DatasetModal: React.FC<DatasetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  dataset,
}) => {
  const isEditMode = !!dataset;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DatasetType>('Tabular');
  const [rows, setRows] = useState<number>(0);
  const [features, setFeatures] = useState<number>(0);
  const [status, setStatus] = useState<DatasetStatus>('Not Explored');
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync state with selected dataset on edit mode changes
  useEffect(() => {
    if (dataset) {
      setName(dataset.name);
      setDescription(dataset.description);
      setType(dataset.type);
      setRows(dataset.rows);
      setFeatures(dataset.features);
      setStatus(dataset.status);
    } else {
      // Default creation state
      setName('');
      setDescription('');
      setType('Tabular');
      setRows(0);
      setFeatures(0);
      setStatus('Not Explored');
    }
    setError(null);
  }, [dataset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple Validations
    if (!isEditMode && name.trim() === '') {
      setError('Dataset Name is required.');
      return;
    }
    if (rows < 0) {
      setError('Number of rows cannot be negative.');
      return;
    }
    if (features < 0) {
      setError('Number of features cannot be negative.');
      return;
    }

    try {
      setSubmitting(true);
      const data = isEditMode
        ? { description, type, rows, features, status }
        : { name: name.trim(), description, type, rows, features, status };
      
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur effect */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative glass-panel w-full max-w-lg bg-slate-900 border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isEditMode ? 'Edit Dataset Details' : 'Register New Dataset'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Dataset Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Dataset Name {isEditMode && <span className="text-[10px] text-slate-500 font-normal">(Read-only)</span>}
            </label>
            <input
              type="text"
              required
              disabled={isEditMode}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Iris Dataset"
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of the dataset characteristics..."
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
            />
          </div>

          {/* Row layout for Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Dataset Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DatasetType)}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="Tabular">Tabular</option>
                <option value="Image">Image</option>
                <option value="Text">Text</option>
                <option value="Audio">Audio</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DatasetStatus)}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="Not Explored">Not Explored</option>
                <option value="Exploring">Exploring</option>
                <option value="Ready for Training">Ready for Training</option>
                <option value="Trained">Trained</option>
              </select>
            </div>
          </div>

          {/* Row layout for Rows and Features */}
          <div className="grid grid-cols-2 gap-4">
            {/* Rows */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Number of Rows
              </label>
              <input
                type="number"
                min="0"
                required
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Number of Features
              </label>
              <input
                type="number"
                min="0"
                required
                value={features}
                onChange={(e) => setFeatures(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DatasetModal;
