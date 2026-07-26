import React from 'react';
import RiskBadge from './RiskBadge';
import TrendBadge from './TrendBadge';
import { Shield, MapPin, Navigation, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function HotspotDetailPanel({ 
  hotspot, 
  onClose, 
  onNavigate,
  role
}) {
  const isAnalyst = role === 'analyst';
  if (!hotspot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center h-full flex flex-col justify-center items-center text-slate-500 shadow-md">
        <Shield className="w-10 h-10 text-slate-700 mb-3 animate-pulse-soft" />
        <h3 className="text-sm font-bold text-white mb-1">Select a Hotspot</h3>
        <p className="text-4xs text-slate-400">Click a record in the registry to inspect threat details and recommended patrol activities.</p>
      </div>
    );
  }

  const handleViewOnMap = () => {
    // Save map coordinates in localStorage to be consumed by CrimeMapLayout on mount
    localStorage.setItem('selectedMapPosition', JSON.stringify({
      center: [hotspot.latitude, hotspot.longitude],
      zoom: 12
    }));
    onNavigate('map');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-md flex flex-col justify-between h-full">
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{hotspot.hotspotId}</span>
              <h3 className="text-sm font-bold text-white">{hotspot.policeStation}</h3>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-850 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

        {/* Dynamic Threat Metrics */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
            <span className="block text-4xs text-slate-500 font-bold uppercase mb-1">Risk Score</span>
            <RiskBadge risk={hotspot.riskLevel} />
          </div>
          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
            <span className="block text-4xs text-slate-500 font-bold uppercase mb-1">Trend Status</span>
            <TrendBadge trend={hotspot.trend} />
          </div>
        </div>

        {/* Hotspot details data list */}
        <div className="space-y-2.5 p-3.5 bg-slate-950/40 rounded-lg border border-slate-850 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40">
            <span className="text-slate-400">Total Incident Count</span>
            <span className="font-semibold text-slate-200 font-mono">{hotspot.crimeCount} cases</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-slate-8-40 border-slate-850/40">
            <span className="text-slate-400">Dominant Category</span>
            <span className="font-semibold text-slate-200">{hotspot.dominantCrime}</span>
          </div>
          {isAnalyst && hotspot.densityIndex !== undefined && (
            <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40 font-mono">
              <span className="text-slate-400">Density Index</span>
              <span className="font-semibold text-slate-200">{hotspot.densityIndex} /10</span>
            </div>
          )}
          {isAnalyst && hotspot.growthPercentage !== undefined && (
            <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40 font-mono">
              <span className="text-slate-400">Growth Rate (YoY)</span>
              <span className={`font-semibold ${hotspot.growthPercentage >= 0 ? 'text-rose-450' : 'text-emerald-450'}`}>
                {hotspot.growthPercentage >= 0 ? '+' : ''}{hotspot.growthPercentage}%
              </span>
            </div>
          )}
          {isAnalyst && hotspot.historicalAverage !== undefined && (
            <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40 font-mono">
              <span className="text-slate-400">Historical Average</span>
              <span className="font-semibold text-slate-200">{hotspot.historicalAverage}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40">
            <span className="text-slate-400">Patrol Priority</span>
            <span className="font-semibold text-rose-450 uppercase">{hotspot.patrolPriority}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40">
            <span className="text-slate-400">District Center</span>
            <span className="font-semibold text-slate-200">{hotspot.district}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-slate-400">Last Incident Date</span>
            <span className="font-semibold text-slate-200 font-mono">{hotspot.lastIncidentDate}</span>
          </div>
        </div>

        {/* Activity log details description */}
        <div className="space-y-1.5">
          <h4 className="text-slate-500 font-bold uppercase text-4xs tracking-widest flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" /> Active Incident log
          </h4>
          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg text-slate-350 leading-relaxed text-xs">
            {hotspot.activitySummary}
          </div>
        </div>

        {/* Recommended action list */}
        <div className="space-y-1.5">
          <h4 className="text-slate-500 font-bold uppercase text-4xs tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Recommended Action
          </h4>
          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg text-slate-200 font-medium text-xs leading-relaxed">
            {hotspot.recommendedAction}
          </div>
        </div>

      </div>

      {/* View on Crime Map Button */}
      <button
        onClick={handleViewOnMap}
        className="w-full btn-primary btn-sm h-10 gap-2 cursor-pointer mt-4"
      >
        <Eye className="w-4.5 h-4.5" />
        <span>View on Crime Map</span>
      </button>

    </div>
  );
}
