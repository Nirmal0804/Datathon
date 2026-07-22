import React, { useState } from 'react';
import { Layers, MapPin, Filter, Calendar, Zap, ShieldAlert, Activity } from 'lucide-react';

export default function GISSidebar() {
  const [activeTab, setActiveTab] = useState('layers');

  return (
    <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex gap-2">
        <button 
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'layers' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:bg-slate-800 border border-transparent'}`}
        >
          Layers
        </button>
        <button 
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'filters' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:bg-slate-800 border border-transparent'}`}
        >
          Filters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {activeTab === 'layers' && (
          <>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Base Overlays
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900" />
                  <span className="text-sm text-slate-300 group-hover:text-white">District Boundaries</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900" />
                  <span className="text-sm text-slate-300 group-hover:text-white">Police Jurisdictions</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Intelligence Layers
              </h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer group bg-slate-800/50 p-2 rounded-md border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-200">Heatmap (Density)</span>
                  </div>
                  <div className="relative inline-block w-8 h-4 rounded-full bg-primary/40">
                    <span className="absolute left-4 top-0.5 w-3 h-3 rounded-full bg-primary transition-all"></span>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer group p-2 rounded-md hover:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-300">Crime Markers</span>
                  </div>
                  <div className="relative inline-block w-8 h-4 rounded-full bg-slate-700">
                    <span className="absolute left-1 top-0.5 w-3 h-3 rounded-full bg-slate-500 transition-all"></span>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer group bg-slate-800/50 p-2 rounded-md border border-slate-700">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-slate-200">High-Risk Hotspots</span>
                  </div>
                  <div className="relative inline-block w-8 h-4 rounded-full bg-red-500/40">
                    <span className="absolute left-4 top-0.5 w-3 h-3 rounded-full bg-red-500 transition-all"></span>
                  </div>
                </label>
              </div>
            </div>
          </>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">District / Region</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-200 p-2 focus:ring-1 focus:ring-primary focus:outline-none">
                <option>All Karnataka</option>
                <option>Bengaluru City</option>
                <option>Mysuru</option>
                <option>Hubballi-Dharwad</option>
                <option>Mangaluru</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Crime Type</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-200 p-2 focus:ring-1 focus:ring-primary focus:outline-none">
                <option>All Types</option>
                <option>Cybercrime</option>
                <option>Property</option>
                <option>Violent</option>
                <option>Narcotics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date Range
              </label>
              <div className="flex gap-2">
                <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-400 p-2 focus:outline-none" />
                <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-400 p-2 focus:outline-none" />
              </div>
            </div>

            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-md text-sm font-medium transition-colors">
              Apply Filters
            </button>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span className="text-xs text-slate-400">Critical Hotspot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
            <span className="text-xs text-slate-400">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
            <span className="text-xs text-slate-400">Low Risk / Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
