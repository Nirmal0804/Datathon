import React, { useMemo } from 'react';
import RiskBadge from './RiskBadge';
import TrendBadge from './TrendBadge';
import { ArrowUpRight } from 'lucide-react';

export default function HotspotTable({ 
  hotspots, 
  selectedHotspot, 
  onSelect 
}) {

  // Sort hotspots by risk level weight descending (Critical = 4, High = 3, Medium = 2, Low = 1)
  const sortedHotspots = useMemo(() => {
    const riskWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return [...hotspots].sort((a, b) => {
      const weightA = riskWeights[a.riskLevel] || 0;
      const weightB = riskWeights[b.riskLevel] || 0;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return b.crimeCount - a.crimeCount; // tie-breaker by crime count
    });
  }, [hotspots]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
        <div>
          <h3 className="text-sm font-bold text-white">Hotspot Risk Registry</h3>
          <p className="text-4xs text-slate-400 mt-0.5">Prioritized by active threat indexes and crime density metrics.</p>
        </div>
        <span className="text-4xs font-mono font-bold bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded uppercase">
          {sortedHotspots.length} Logged zones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Hotspots ranking table">
          <thead>
            <tr className="border-b border-slate-800/80 text-3xs font-semibold text-slate-500 uppercase">
              <th className="py-3 px-4">Hotspot ID</th>
              <th className="py-3 px-4">Jurisdiction</th>
              <th className="py-3 px-4">Incidents</th>
              <th className="py-3 px-4">Dominant Category</th>
              <th className="py-3 px-4">Threat Level</th>
              <th className="py-3 px-4">Trend Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody>
            {sortedHotspots.map((h) => {
              const isSelected = selectedHotspot?.hotspotId === h.hotspotId;
              return (
                <tr 
                  key={h.hotspotId}
                  onClick={() => onSelect(h)}
                  className={`border-b border-slate-850 text-xs hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-350">{h.hotspotId}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-slate-200">{h.policeStation}</p>
                      <p className="text-4xs text-slate-500">{h.district}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">{h.crimeCount}</td>
                  <td className="py-3 px-4 text-slate-300">{h.dominantCrime}</td>
                  <td className="py-3 px-4">
                    <RiskBadge risk={h.riskLevel} />
                  </td>
                  <td className="py-3 px-4">
                    <TrendBadge trend={h.trend} />
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block py-0.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      h.patrolPriority === 'Critical' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                      h.patrolPriority === 'High' ? 'bg-orange-500/10 text-orange-450 border border-orange-500/20' :
                      h.patrolPriority === 'Medium' ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {h.patrolPriority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(h);
                      }}
                      className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
