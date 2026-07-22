import React from 'react';
import { Calendar, Filter } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">State Command Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time metrics across all 31 districts of Karnataka.</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Last 30 Days</span>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-300 hover:bg-slate-700 transition-colors">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
}
