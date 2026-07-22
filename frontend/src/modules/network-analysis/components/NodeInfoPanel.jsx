import React from 'react';
import { X, User, AlertTriangle, Link2 } from 'lucide-react';

export default function NodeInfoPanel({ onClose }) {
  return (
    <div className="w-80 h-full bg-slate-900 flex flex-col shrink-0 absolute right-0 top-0 shadow-[-4px_0_15px_rgba(0,0,0,0.5)] z-20 border-l border-slate-800">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
        <h2 className="text-lg font-semibold text-white">Entity Details</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col items-center border-b border-slate-800 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4 relative">
            <User className="w-8 h-8 text-red-500" />
            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-800">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white">Ramesh Kumar</h3>
          <p className="text-sm text-slate-400 font-mono mt-1">ID: SUS-2023-8914</p>
          <span className="mt-3 px-2 py-1 bg-red-500/10 text-red-500 text-xs font-semibold rounded border border-red-500/20 uppercase tracking-wider">
            Primary Target
          </span>
        </div>

        <div className="p-4 space-y-5">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Known Aliases</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">Rami</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">RK</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Factors</h4>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div> Repeat Offender (Property)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div> Flight Risk</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Direct Connections (12)</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="p-1.5 bg-primary/20 rounded-md">
                  <Link2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">9845X XXXXX</p>
                  <p className="text-xs text-slate-500">Frequent Contact (45 calls)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="p-1.5 bg-emerald-500/20 rounded-md">
                  <Link2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">KA-01-XX-9921</p>
                  <p className="text-xs text-slate-500">Registered Vehicle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <button className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors">
          Expand Sub-Network
        </button>
      </div>
    </div>
  );
}
