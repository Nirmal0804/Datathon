import React from 'react';
import { Flame, Map } from 'lucide-react';

export default function HotspotAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Spatial Hotspot Analytics</h2>
          <p className="text-sm text-slate-400">KDE (Kernel Density Estimation) and spatial shift analysis over time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" /> Density Map (Local Context)
          </h3>
          <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 bg-slate-900 overflow-hidden relative">
             <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at center, rgba(239,68,68,1) 0%, rgba(239,68,68,0) 70%)' }}></div>
            <Flame className="w-12 h-12 mb-3 opacity-50 text-red-500 z-10" />
            <p className="text-sm font-medium z-10 text-white shadow-black drop-shadow-md">Heatmap / Hexbin Layer</p>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Spatial Shift Vector</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Hotspots have migrated <strong className="text-white bg-slate-800 px-2 py-1 rounded">2.4km East</strong> over the last 6 months in the Hubballi region, towards newly developing commercial zones.
            </p>
            <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded text-sm font-medium transition-colors">
              View Time-lapse Animation
            </button>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Top Generators</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Commercial ATMS</span> <span className="font-mono text-white">42 alerts</span></li>
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Late-night Bars</span> <span className="font-mono text-white">28 alerts</span></li>
              <li className="flex justify-between border-b border-slate-800 pb-2 border-none"><span>Tech Corridors</span> <span className="font-mono text-white">19 alerts</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
