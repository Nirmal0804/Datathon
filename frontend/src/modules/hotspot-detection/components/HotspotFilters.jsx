import React from 'react';
import { Search, Calendar, MapPin, Activity, Tag, TrendingUp, RotateCcw, Download } from 'lucide-react';
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

  const inputBase = "h-9 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-xs font-semibold rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all cursor-pointer appearance-none";

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-4 w-full"
    >
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Hotspot ID or Station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputBase} w-full pl-9 pr-3`}
          />
        </div>

        {/* District */}
        <div className="relative min-w-[130px]">
          <MapPin className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className={`${inputBase} pl-8 pr-7`}
          >
            <option value="All">All Districts</option>
            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Risk Level */}
        <div className="relative min-w-[120px]">
          <Activity className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className={`${inputBase} pl-8 pr-7`}
          >
            <option value="All">All Risks</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Crime Type */}
        <div className="relative min-w-[130px]">
          <Tag className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.crimeCategory}
            onChange={(e) => handleFilterChange('crimeCategory', e.target.value)}
            className={`${inputBase} pl-8 pr-7`}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Trend (Analyst Only) */}
        {isAnalyst && (
          <div className="relative min-w-[120px]">
            <TrendingUp className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filters.trend}
              onChange={(e) => handleFilterChange('trend', e.target.value)}
              className={`${inputBase} pl-8 pr-7`}
            >
              <option value="All">All Trends</option>
              <option value="Emerging">Emerging</option>
              <option value="Persistent">Persistent</option>
              <option value="Declining">Declining</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        {/* Start Date */}
        <div className="relative min-w-[130px]">
          <Calendar className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className={`${inputBase} pl-8 pr-3`}
          />
        </div>

        {/* End Date */}
        <div className="relative min-w-[130px]">
          <Calendar className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className={`${inputBase} pl-8 pr-3`}
          />
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          title="Reset all filters"
          className="h-9 w-9 rounded-[12px] bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] hover:bg-[#0B1F4D] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

      </div>
    </form>
  );
}
