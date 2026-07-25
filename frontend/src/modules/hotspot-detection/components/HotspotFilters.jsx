import React, { useMemo } from 'react';
import { Search, Calendar, RefreshCw } from 'lucide-react';
import { DISTRICTS, CATEGORIES } from '../../dashboard/components/mockData';

export default function HotspotFilters({ 
  filters, 
  setFilters, 
  searchQuery, 
  setSearchQuery, 
  onReset,
  role
}) {
  const isAnalyst = role === 'analyst';
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-md">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" htmlFor="search-hotspots">Search Area</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-hotspots"
              type="text"
              placeholder="Search by Hotspot ID or Station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8.5 text-xs h-9 bg-slate-950/40 border-slate-700 w-full"
            />
          </div>
        </div>

        {/* District Selector */}
        <div className="w-full md:w-44">
          <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" htmlFor="district-select">District</label>
          <select
            id="district-select"
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className="select text-xs h-9 bg-slate-950/40 border-slate-700"
          >
            <option value="All">All Districts</option>
            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Risk Level Selector */}
        <div className="w-full md:w-36">
          <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" htmlFor="risk-select">Risk Level</label>
          <select
            id="risk-select"
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="select text-xs h-9 bg-slate-950/40 border-slate-700"
          >
            <option value="All">All Risks</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Trend Selector (Analyst only) */}
        {isAnalyst && (
          <div className="w-full md:w-36">
            <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" htmlFor="trend-select">Trend</label>
            <select
              id="trend-select"
              value={filters.trend}
              onChange={(e) => handleFilterChange('trend', e.target.value)}
              className="select text-xs h-9 bg-slate-950/40 border-slate-700"
            >
              <option value="All">All Trends</option>
              <option value="Emerging">Emerging</option>
              <option value="Persistent">Persistent</option>
              <option value="Declining">Declining</option>
            </select>
          </div>
        )}

        {/* Crime Category Selector */}
        <div className="w-full md:w-44">
          <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" htmlFor="crime-select">Crime Type</label>
          <select
            id="crime-select"
            value={filters.crimeCategory}
            onChange={(e) => handleFilterChange('crimeCategory', e.target.value)}
            className="select text-xs h-9 bg-slate-950/40 border-slate-700"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <button 
          onClick={onReset}
          className="btn-secondary btn-sm h-9 gap-1.5 px-4 cursor-pointer hover:bg-slate-800 shrink-0 w-full md:w-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Secondary filter: Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-slate-800/40">
        <div>
          <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Start Incident Date
          </label>
          <input 
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="input text-xs h-9 bg-slate-950/40 border-slate-700 py-1"
          />
        </div>
        <div>
          <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> End Incident Date
          </label>
          <input 
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="input text-xs h-9 bg-slate-950/40 border-slate-700 py-1"
          />
        </div>
      </div>

    </div>
  );
}
