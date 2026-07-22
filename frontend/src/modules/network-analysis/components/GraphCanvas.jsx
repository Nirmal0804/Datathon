import React from 'react';
import { Network } from 'lucide-react';

export default function GraphCanvas() {
  return (
    <div className="flex-1 w-full h-full bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center border-l border-r border-slate-800">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      
      <Network className="w-16 h-16 text-slate-700 mb-4" />
      <h2 className="text-xl font-semibold text-slate-500 mb-2">Interactive Graph Canvas</h2>
      <p className="text-sm text-slate-600 max-w-md text-center">
        D3.js or Cytoscape visualization goes here. Displays nodes (suspects, vehicles, locations) and edges (relationships, transactions).
      </p>
      
      {/* Dummy nodes for visualization effect */}
      <div className="absolute top-1/4 left-1/3 w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-pulse">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
      </div>
      <div className="absolute bottom-1/3 right-1/3 w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
      </div>
      
      {/* SVG Connecting Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="33%" y1="25%" x2="50%" y2="50%" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" strokeDasharray="4" />
        <line x1="50%" y1="50%" x2="66%" y2="66%" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="2" />
      </svg>
    </div>
  );
}
