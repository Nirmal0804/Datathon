import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Calendar, MapPin, Building2, Tag, Activity } from 'lucide-react';
import { DISTRICTS, POLICE_STATIONS, CATEGORIES, STATUSES } from './mockData';

export default function FilterBar({ filters, onApply, onReset }) {
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const [availableStations, setAvailableStations] = useState([]);

  // Sync with parent filters when they change (e.g. on reset)
  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters]);

  // Handle cascading dropdown for Police Stations based on selected District
  useEffect(() => {
    if (localFilters.district && localFilters.district !== 'All') {
      setAvailableStations(POLICE_STATIONS[localFilters.district] || []);
    } else {
      setAvailableStations([]);
    }
  }, [localFilters.district]);

  const handleChange = (field, value) => {
    setLocalFilters(prev => {
      const next = { ...prev, [field]: value };
      // If district changes, reset police station to All
      if (field === 'district') {
        next.policeStation = 'All';
      }
      return next;
    });
  };

  const handleApply = (e) => {
    e.preventDefault();
    onApply(localFilters);
  };

  const handleResetClick = () => {
    onReset();
  };

  return (
    <form onSubmit={handleApply} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800/60">
        <Filter className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-slate-200">Intelligence Filter Command</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range */}
        <div>
          <label className="label flex items-center gap-1.5 text-2xs uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Range
          </label>
          <div className="relative">
            <select
              value={localFilters.dateRange}
              onChange={(e) => handleChange('dateRange', e.target.value)}
              className="select"
              aria-label="Date Range Select"
            >
              <option value="Daily">Daily (24 Hours)</option>
              <option value="Weekly">Weekly (7 Days)</option>
              <option value="Monthly">Monthly (30 Days)</option>
              <option value="Quarterly">Quarterly (90 Days)</option>
              <option value="Yearly">Yearly (365 Days)</option>
            </select>
          </div>
        </div>

        {/* District */}
        <div>
          <label className="label flex items-center gap-1.5 text-2xs uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> District
          </label>
          <div className="relative">
            <select
              value={localFilters.district}
              onChange={(e) => handleChange('district', e.target.value)}
              className="select"
              aria-label="District Select"
            >
              <option value="All">All Districts</option>
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Police Station */}
        <div>
          <label className="label flex items-center gap-1.5 text-2xs uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Police Station
          </label>
          <div className="relative">
            <select
              value={localFilters.policeStation}
              onChange={(e) => handleChange('policeStation', e.target.value)}
              disabled={localFilters.district === 'All'}
              className={`select ${localFilters.district === 'All' ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Police Station Select"
            >
              <option value="All">All Stations</option>
              {availableStations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Crime Category */}
        <div>
          <label className="label flex items-center gap-1.5 text-2xs uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
          </label>
          <div className="relative">
            <select
              value={localFilters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="select"
              aria-label="Crime Category Select"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Crime Status */}
        <div>
          <label className="label flex items-center gap-1.5 text-2xs uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" /> Status
          </label>
          <div className="relative">
            <select
              value={localFilters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="select"
              aria-label="Crime Status Select"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-800/40">
        <button
          type="button"
          onClick={handleResetClick}
          className="btn-secondary btn-sm gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
        <button
          type="submit"
          className="btn-primary btn-sm gap-2 px-6"
        >
          <Filter className="w-3.5 h-3.5" />
          Apply Filters
        </button>
      </div>
    </form>
  );
}
