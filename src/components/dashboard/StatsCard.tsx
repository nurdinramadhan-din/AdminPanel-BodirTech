import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  trendUp?: boolean;
}

export const StatsCard: React.FC<Props> = ({ title, value, trend, icon: Icon, trendUp }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg hover:border-emerald-500/50 transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-700/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
          <Icon size={24} className="text-emerald-400" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1 font-mono">{value}</p>
    </div>
  );
};