import React from 'react';
import { ZoomIn, ZoomOut, Maximize, MousePointer2, Move, Share2, Download } from 'lucide-react';

export default function NetworkToolbar() {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl flex flex-col p-1">
        <button className="p-2 text-primary bg-primary/10 hover:bg-slate-800 rounded transition-colors" title="Select">
          <MousePointer2 className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Pan">
          <Move className="w-5 h-5" />
        </button>
      </div>
      
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl flex flex-col p-1">
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Fit to Screen">
          <Maximize className="w-5 h-5" />
        </button>
      </div>
      
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl flex flex-col p-1 mt-2">
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Export Graph">
          <Download className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Share Network">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
