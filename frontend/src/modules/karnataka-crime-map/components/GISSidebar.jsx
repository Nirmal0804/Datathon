import React, { useState, useMemo } from 'react';
import { Layers, Filter, Calendar, Zap, ShieldAlert, Activity, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { DISTRICTS, POLICE_STATIONS, CATEGORIES, STATUSES } from '../../dashboard/components/mockData';

export default function GISSidebar({
  filters,
  setFilters,
  layers,
  setLayers,
  onReset,
  role
}) {
  const isAnalyst = role === 'analyst';

  // Accordion Expand/Collapse States
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [legendExpanded, setLegendExpanded] = useState(true);

  // Available police stations based on selected district
  const availableStations = useMemo(() => {
    if (!filters.district || filters.district === 'All') {
      const list = [];
      Object.keys(POLICE_STATIONS).slice(0, 5).forEach(d => {
        list.push(...POLICE_STATIONS[d]);
      });
      return ['All', ...new Set(list)];
    }
    return ['All', ...(POLICE_STATIONS[filters.district] || [])];
  }, [filters.district]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'district') {
        next.policeStation = 'All';
      }
      return next;
    });
  };

  const toggleLayer = (key) => {
    setLayers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="h-full bg-white border border-[#E7ECF3] rounded-[20px] shadow-sm flex flex-col justify-between overflow-y-auto no-scrollbar p-5 space-y-5">
      <div className="space-y-5">

        {/* Module Title */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7ECF3]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#0B1F4D]/10 text-[#0B1F4D] flex items-center justify-center shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Map Layers</h2>
          </div>
          <button
            onClick={onReset}
            className="p-2 rounded-[12px] bg-[#F8F9FB] border border-[#E7ECF3] hover:bg-slate-100 text-slate-500 hover:text-[#0F172A] transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. Map Layers Accordion */}
        <div className="border border-[#E7ECF3] rounded-[16px] overflow-hidden bg-[#F8F9FB]">
          <button
            onClick={() => setLayersExpanded(!layersExpanded)}
            className="w-full px-3.5 py-3 bg-white border-b border-[#E7ECF3] flex items-center justify-between text-[11px] font-bold text-[#0F172A] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-police-blue" /> Overlays Toggle
            </span>
            {layersExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {layersExpanded && (
            <div className="p-3 space-y-2">
              <label className="flex items-center justify-between cursor-pointer group p-2 rounded-[10px] hover:bg-white transition-colors">
                <span className="text-xs text-[#334155] font-semibold">Severity Markers</span>
                <input
                  type="checkbox"
                  checked={layers.showMarkers}
                  onChange={() => toggleLayer('showMarkers')}
                  className="w-4 h-4 rounded border-[#D9E2EC] text-[#0B1F4D] focus:ring-[#0B1F4D]"
                />
              </label>

              {isAnalyst && (
                <>
                  <label className="flex items-center justify-between cursor-pointer group p-2 rounded-[10px] hover:bg-white transition-colors">
                    <span className="text-xs text-[#334155] font-semibold">Heatmap Layer</span>
                    <input
                      type="checkbox"
                      checked={layers.showHeatmap}
                      onChange={() => toggleLayer('showHeatmap')}
                      className="w-4 h-4 rounded border-[#D9E2EC] text-emerald-600 focus:ring-emerald-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-2 rounded-[10px] hover:bg-white transition-colors">
                    <span className="text-xs text-[#334155] font-semibold">Crime Clusters</span>
                    <input
                      type="checkbox"
                      checked={layers.showClusters}
                      onChange={() => toggleLayer('showClusters')}
                      className="w-4 h-4 rounded border-[#D9E2EC] text-[#0B1F4D] focus:ring-[#0B1F4D]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-2 rounded-[10px] hover:bg-white transition-colors">
                    <span className="text-xs text-[#334155] font-semibold">Crime Density</span>
                    <input
                      type="checkbox"
                      checked={layers.showDensity}
                      onChange={() => toggleLayer('showDensity')}
                      className="w-4 h-4 rounded border-[#D9E2EC] text-indigo-600 focus:ring-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group p-2 rounded-[10px] hover:bg-white transition-colors">
                    <span className="text-xs text-[#334155] font-semibold">Beat Sectors</span>
                    <input
                      type="checkbox"
                      checked={layers.showJurisdictions}
                      onChange={() => toggleLayer('showJurisdictions')}
                      className="w-4 h-4 rounded border-[#D9E2EC] text-purple-600 focus:ring-purple-600"
                    />
                  </label>
                </>
              )}

              <label className="flex items-center justify-between cursor-pointer group p-2 rounded-[10px] hover:bg-white transition-colors">
                <span className="text-xs text-[#334155] font-semibold">Emerging Hotspots</span>
                <input
                  type="checkbox"
                  checked={layers.showHotspots}
                  onChange={() => toggleLayer('showHotspots')}
                  className="w-4 h-4 rounded border-[#D9E2EC] text-rose-600 focus:ring-rose-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group p-2 rounded-[10px] hover:bg-white transition-colors">
                <span className="text-xs text-[#334155] font-semibold">District Boundaries</span>
                <input
                  type="checkbox"
                  checked={layers.showBoundaries}
                  onChange={() => toggleLayer('showBoundaries')}
                  className="w-4 h-4 rounded border-[#D9E2EC] text-indigo-600 focus:ring-indigo-600"
                />
              </label>
            </div>
          )}
        </div>

        {/* 2. Legend Accordion */}
        <div className="border border-[#E7ECF3] rounded-[16px] overflow-hidden bg-[#F8F9FB]">
          <button
            onClick={() => setLegendExpanded(!legendExpanded)}
            className="w-full px-3.5 py-3 bg-white border-b border-[#E7ECF3] flex items-center justify-between text-[11px] font-bold text-[#0F172A] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Map Legend
            </span>
            {legendExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {legendExpanded && (
            <div className="p-3 space-y-2 text-xs text-[#64748B] font-medium">
              <span className="block text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider mb-1.5">District Crime Risk</span>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded bg-red-500/80 border border-red-500 shadow-xs"></span>
                <span className="text-[#0F172A]">Critical / Very High Risk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded bg-orange-500/80 border border-orange-500 shadow-xs"></span>
                <span className="text-[#0F172A]">High Risk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded bg-amber-500/80 border border-amber-500 shadow-xs"></span>
                <span className="text-[#0F172A]">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded bg-emerald-500/80 border border-emerald-500 shadow-xs"></span>
                <span className="text-[#0F172A]">Low Risk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 shadow-xs"></span>
                <span className="text-[#0F172A]">No Current Data</span>
              </div>

              <div className="pt-2 border-t border-[#E7ECF3] space-y-2">
                <span className="block text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider mb-1">Overlays Legend</span>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border border-dashed border-rose-500 bg-rose-50 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </span>
                  <span className="text-[#0F172A]">Hotspot Circle Zone</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white shadow-xs"></span>
                  <span className="text-[#0F172A]">Incident Case Dot</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-1 bg-[#E00000] rounded-full"></span>
                  <span className="text-[#0F172A]">Karnataka Outer Border</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Station / Officer Info Card */}
        <div className="p-4 rounded-[16px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs">
          <p className="font-bold text-[#0F172A]">Karnataka Police Command</p>
          <p className="text-[#64748B] text-[11px] mt-0.5">Geospatial Telemetry Hub</p>
          <div className="mt-3 pt-2.5 border-t border-[#E7ECF3] flex items-center justify-between text-[11px]">
            <span className="text-[#64748B]">Status:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
