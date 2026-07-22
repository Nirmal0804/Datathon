import React, { useState } from 'react';
import GISMap from './components/GISMap';
import GISSidebar from './components/GISSidebar';
import { Menu } from 'lucide-react';

export default function CrimeMapLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-slate-950 rounded-xl border border-slate-800 shadow-xl">
      
      {/* GIS Sidebar (Filters, Layers) */}
      <div className={`shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="w-80 h-full">
          <GISSidebar />
        </div>
      </div>
      
      {/* Map Area */}
      <div className="flex-1 relative h-full flex flex-col">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-[400] p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-300 hover:text-white shadow-lg transition-colors hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <GISMap />
      </div>
    </div>
  );
}
