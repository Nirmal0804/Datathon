import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Filter, Calendar, Zap, ShieldAlert, Activity, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { getDistricts, getFieldMapFilters } from '../../../api/endpoints';

export default function GISSidebar({ 
  filters, 
  setFilters, 
  layers, 
  setLayers, 
  onReset,
  role,
  onFilterChange
}) {
  const isAnalyst = role === 'analyst';

  const [districtsList, setDistrictsList] = useState([]);
  const [stationsMap, setStationsMap] = useState({});
  const [categoriesList, setCategoriesList] = useState([]);
  const [statusesList] = useState(['Active', 'Investigating', 'Closed', 'Under Review']);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [distRes, filterRes] = await Promise.allSettled([
          getDistricts(),
          getFieldMapFilters(),
        ]);
        if (distRes.status === 'fulfilled' && distRes.value?.districts) {
          setDistrictsList(distRes.value.districts.map(d => d.district_name));
        }
        if (filterRes.status === 'fulfilled') {
          const f = filterRes.value;
          if (f?.crime_heads) setCategoriesList(f.crime_heads);
          if (f?.stations) {
            const map = {};
            f.stations.forEach(s => {
              if (!map[s.district]) map[s.district] = [];
              map[s.district].push(s.station_name);
            });
            setStationsMap(map);
          }
        }
      } catch (e) {
        console.error('Failed to load filter options:', e);
      }
    }
    loadFilters();
  }, []);

  // Accordion Expand/Collapse States
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [legendExpanded, setLegendExpanded] = useState(true);

  // Available police stations based on selected district
  const availableStations = useMemo(() => {
    if (!filters.district || filters.district === 'All') {
      const list = [];
      Object.keys(stationsMap).slice(0, 5).forEach(d => {
        list.push(...stationsMap[d]);
      });
      return ['All', ...new Set(list)];
    }
    return ['All', ...(stationsMap[filters.district] || [])];
  }, [filters.district, stationsMap]);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    if (key === 'district') {
      next.policeStation = 'All';
    }
    setFilters(next);
    if (onFilterChange) onFilterChange(next);
  };

  const toggleLayer = (key) => {
    setLayers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between overflow-y-auto no-scrollbar">
      <div className="p-4 space-y-4">
        
        {/* Module Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-primary" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Map Command Panel</h2>
          </div>
          <button 
            onClick={onReset}
            className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. Map Layers Accordion */}
        <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/20">
          <button 
            onClick={() => setLayersExpanded(!layersExpanded)}
            className="w-full px-3 py-2.5 bg-slate-950/40 hover:bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-2xs font-bold text-slate-400 uppercase tracking-widest transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary" /> Map Layers
            </span>
            {layersExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {layersExpanded && (
            <div className="p-3 space-y-2">
              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                <span className="text-xs text-slate-300 font-medium">Severity Markers</span>
                <input 
                  type="checkbox" 
                  checked={layers.showMarkers}
                  onChange={() => toggleLayer('showMarkers')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900" 
                />
              </label>

              {isAnalyst && (
                <>
                  <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                    <span className="text-xs text-slate-300 font-medium">Heatmap Layer</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showHeatmap}
                      onChange={() => toggleLayer('showHeatmap')}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" 
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                    <span className="text-xs text-slate-300 font-medium">Crime Clusters</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showClusters}
                      onChange={() => toggleLayer('showClusters')}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900" 
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                    <span className="text-xs text-slate-300 font-medium">Crime Density</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showDensity}
                      onChange={() => toggleLayer('showDensity')}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900" 
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                    <span className="text-xs text-slate-300 font-medium">Precinct Beat Sectors</span>
                    <input 
                      type="checkbox" 
                      checked={layers.showJurisdictions}
                      onChange={() => toggleLayer('showJurisdictions')}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900" 
                    />
                  </label>
                </>
              )}

              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                <span className="text-xs text-slate-300 font-medium">Emerging Hotspots</span>
                <input 
                  type="checkbox" 
                  checked={layers.showHotspots}
                  onChange={() => toggleLayer('showHotspots')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900" 
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group p-1.5 rounded hover:bg-slate-800/40 transition-colors">
                <span className="text-xs text-slate-300 font-medium">District Boundaries</span>
                <input 
                  type="checkbox" 
                  checked={layers.showBoundaries}
                  onChange={() => toggleLayer('showBoundaries')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900" 
                />
              </label>
            </div>
          )}
        </div>

        {/* 2. Filters Accordion */}
        <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/20">
          <button 
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="w-full px-3 py-2.5 bg-slate-950/40 hover:bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-2xs font-bold text-slate-400 uppercase tracking-widest transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-primary" /> Filter Criteria
            </span>
            {filtersExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {filtersExpanded && (
            <div className="p-3 space-y-4">
              {/* District Selector */}
              <div>
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-widest mb-1.5" htmlFor="district-select">District / Division</label>
                <select 
                  id="district-select"
                  value={filters.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  className="select text-xs h-9 bg-slate-800 border-slate-700"
                >
                  <option value="All">All Karnataka</option>
                  {districtsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Station Selector */}
              <div>
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-widest mb-1.5" htmlFor="station-select">Police Station</label>
                <select 
                  id="station-select"
                  value={filters.policeStation}
                  onChange={(e) => handleFilterChange('policeStation', e.target.value)}
                  className="select text-xs h-9 bg-slate-800 border-slate-700"
                >
                  {availableStations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              {/* Crime Category Selector */}
              <div>
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-widest mb-1.5" htmlFor="crime-select">Crime Category</label>
                <select 
                  id="crime-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="select text-xs h-9 bg-slate-800 border-slate-700"
                >
                  <option value="All">All Categories</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Severity Selector */}
              <div>
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-widest mb-1.5" htmlFor="severity-select">Severity Level</label>
                <select 
                  id="severity-select"
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="select text-xs h-9 bg-slate-800 border-slate-700"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Crime Status Selector */}
              {isAnalyst && (
                <div>
                  <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" htmlFor="status-select">Investigation Status</label>
                  <select 
                    id="status-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="select text-xs h-9 bg-slate-800 border-slate-700"
                  >
                    <option value="All">All Statuses</option>
                    {statusesList.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Ranges */}
              <div>
                <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date Range
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-4xs text-slate-500 w-8" id="start-date-label">Start:</span>
                    <input 
                      aria-labelledby="start-date-label"
                      type="date" 
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="input text-xs h-9 bg-slate-800 border-slate-700 py-1" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-4xs text-slate-500 w-8" id="end-date-label">End:</span>
                    <input 
                      aria-labelledby="end-date-label"
                      type="date" 
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="input text-xs h-9 bg-slate-800 border-slate-700 py-1" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Legend Accordion */}
        <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/20">
          <button 
            onClick={() => setLegendExpanded(!legendExpanded)}
            className="w-full px-3 py-2.5 bg-slate-950/40 hover:bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-2xs font-bold text-slate-400 uppercase tracking-widest transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Interactive Legend
            </span>
            {legendExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {legendExpanded && (
            <div className="p-3 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"></span>
                <span>Critical / High Incident</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"></span>
                <span>Medium Incident</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
                <span>Low Incident</span>
              </div>
              
              {isAnalyst && layers.showHeatmap && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-gradient-to-r from-red-500/20 via-amber-500/20 to-emerald-500/20 border border-slate-700"></span>
                  <span>Heatmap Intensity Glow</span>
                </div>
              )}

              {isAnalyst && layers.showClusters && (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/30 border border-primary flex items-center justify-center text-[8px] font-bold text-white font-mono">12</span>
                  <span>Crime cluster symbol</span>
                </div>
              )}

              {layers.showHotspots && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-dashed border-red-500/40 bg-red-500/10"></span>
                  <span>Emerging Hotspot Ring</span>
                </div>
              )}

              {layers.showBoundaries && (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-2.5 rounded border border-dashed border-indigo-400/80 bg-indigo-500/5"></span>
                  <span>District Boundary Lines</span>
                </div>
              )}

              {isAnalyst && layers.showJurisdictions && (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-2.5 rounded border border-dashed border-purple-500/50 bg-purple-500/5"></span>
                  <span>Precinct Beat Sectors</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
