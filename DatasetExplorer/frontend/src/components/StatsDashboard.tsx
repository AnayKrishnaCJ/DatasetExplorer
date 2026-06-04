import React from 'react';
import { Database, Table, Image, FileText, Music } from 'lucide-react';
import type { DatasetStats } from '../types';

interface StatsDashboardProps {
  stats: DatasetStats;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Datasets',
      value: stats.total,
      icon: Database,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10',
    },
    {
      label: 'Tabular',
      value: stats.tabular,
      icon: Table,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10',
    },
    {
      label: 'Image',
      value: stats.image,
      icon: Image,
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-purple-500/10',
    },
    {
      label: 'Text',
      value: stats.text,
      icon: FileText,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/10',
    },
    {
      label: 'Audio',
      value: stats.audio,
      icon: Music,
      color: 'from-pink-500 to-rose-600',
      shadow: 'shadow-pink-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`glass-panel p-5 relative overflow-hidden flex flex-col justify-between shadow-lg ${card.shadow} transition-all duration-300 hover:scale-[1.03] border-white/5`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-xl`}></div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </span>
              <span className="text-slate-500 text-xs ml-1.5 font-medium">datasets</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default StatsDashboard;
