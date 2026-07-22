import React from 'react';
import { MapPin, Download, ChevronDown } from 'lucide-react';

export default function DistrictHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-white">District Intelligence</h1>
        </div>
        <p className="text-sm text-slate-400">In-depth analytics and AI risk profiling at the district level.</p>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <select className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-md py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium">
            <option>Bengaluru City</option>
            <option>Mysuru</option>
            <option>Hubballi-Dharwad</option>
            <option>Mangaluru</option>
            <option>Belagavi</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-sm text-white transition-colors shrink-0">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Report</span>
        </button>
      </div>
    </div>
  );
}
