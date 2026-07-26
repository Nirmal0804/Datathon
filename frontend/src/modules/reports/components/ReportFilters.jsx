import React from 'react';
import { Search, Filter, Calendar, FileText, BarChart2, Map, Network } from 'lucide-react';

export default function ReportFilters({ searchQuery, setSearchQuery }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search reports by title, type, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-md py-2 pl-4 pr-10 text-sm text-slate-300 focus:outline-none focus:border-primary transition-colors cursor-pointer">
            <option value="">All Types</option>
            <option>Crime Summary</option>
            <option>District Report</option>
            <option>Network Analysis</option>
            <option>Predictive Risk</option>
            <option>Hotspot Analysis</option>
          </select>
          <Filter className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <select className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-md py-2 pl-4 pr-10 text-sm text-slate-300 focus:outline-none focus:border-primary transition-colors cursor-pointer">
            <option>This Month</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
