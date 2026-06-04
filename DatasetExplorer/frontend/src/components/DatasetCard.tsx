import React from 'react';
import { Edit2, Trash2, Calendar, Database, Eye, CheckCircle, ChevronDown } from 'lucide-react';
import type { Dataset, DatasetStatus, DatasetType } from '../types';

interface DatasetCardProps {
  dataset: Dataset;
  onEdit: (dataset: Dataset) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: DatasetStatus) => void;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getStatusStyle = (status: DatasetStatus) => {
    switch (status) {
      case 'Not Explored':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'Exploring':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Ready for Training':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Trained':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusIcon = (status: DatasetStatus) => {
    switch (status) {
      case 'Not Explored':
        return Calendar;
      case 'Exploring':
        return Eye;
      case 'Ready for Training':
        return Database;
      case 'Trained':
        return CheckCircle;
    }
  };

  const getTypeStyle = (type: DatasetType) => {
    switch (type) {
      case 'Tabular':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'Image':
        return 'text-purple-400 bg-purple-500/10';
      case 'Text':
        return 'text-amber-400 bg-amber-500/10';
      case 'Audio':
        return 'text-pink-400 bg-pink-500/10';
    }
  };

  const StatusIcon = getStatusIcon(dataset.status);

  return (
    <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between h-[300px] border-white/5 bg-slate-900/50 backdrop-blur-md">
      <div>
        {/* Header: Name and Type */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1 hover:text-indigo-400 transition-colors cursor-pointer" title={dataset.name}>
            {dataset.name}
          </h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md shrink-0 ${getTypeStyle(dataset.type)}`}>
            {dataset.type}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm mt-3 line-clamp-3 leading-relaxed min-h-[60px]">
          {dataset.description || 'No description provided.'}
        </p>

        {/* Dataset dimensions */}
        <div className="grid grid-cols-2 gap-4 mt-4 py-3 px-4 rounded-xl bg-slate-950/40 border border-white/5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Rows</span>
            <span className="text-sm font-semibold text-white">{dataset.rows.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Features</span>
            <span className="text-sm font-semibold text-white">{dataset.features.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-4">
        {/* Status Dropdown Trigger */}
        <div className="relative group/status">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg cursor-pointer ${getStatusStyle(dataset.status)}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{dataset.status}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 group-hover/status:text-slate-300 transition-colors" />
          </div>
          
          {/* Custom dropdown hover list */}
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover/status:block z-20 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1">
            {(['Not Explored', 'Exploring', 'Ready for Training', 'Trained'] as DatasetStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(dataset.id, status)}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors duration-150 flex items-center gap-2 hover:bg-slate-800 ${
                  dataset.status === status ? 'text-indigo-400 bg-slate-850' : 'text-slate-300 hover:text-white'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  status === 'Not Explored' ? 'bg-slate-500' :
                  status === 'Exploring' ? 'bg-amber-400' :
                  status === 'Ready for Training' ? 'bg-emerald-400' : 'bg-blue-400'
                }`} />
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Edit and Delete Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(dataset)}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 rounded-xl transition-all duration-150"
            title="Edit Dataset"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(dataset.id)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl transition-all duration-150"
            title="Delete Dataset"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default DatasetCard;
