import React from 'react';
import { Search, Filter, Users, Phone, Car } from 'lucide-react';

export default function RelationshipSidebar() {
  return (
    <div className="w-80 h-full bg-slate-900 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">Network Analysis</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search suspect name, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        {/* Filters Button */}
        <button className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-sm text-slate-300 transition-colors">
          <Filter className="w-4 h-4" />
          Advanced Filters
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Connection Depth */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Connection Depth</label>
          <input type="range" min="1" max="5" defaultValue="2" className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Direct (1)</span>
            <span>Extended (5)</span>
          </div>
        </div>

        {/* Edge Types */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Relationship Types</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary" />
              <span className="text-sm text-slate-300 group-hover:text-white">Call Records (CDR)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary" />
              <span className="text-sm text-slate-300 group-hover:text-white">Financial Transactions</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary" />
              <span className="text-sm text-slate-300 group-hover:text-white">Family / Associate</span>
            </label>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Node Legend</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center"><Users className="w-3 h-3 text-red-500"/></div>
            <span className="text-xs text-slate-400">Suspect</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center"><Phone className="w-3 h-3 text-blue-500"/></div>
            <span className="text-xs text-slate-400">Device</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center"><Car className="w-3 h-3 text-amber-500"/></div>
            <span className="text-xs text-slate-400">Vehicle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
