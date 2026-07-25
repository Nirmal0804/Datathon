import React, { useMemo } from 'react';
import RiskBadge from './RiskBadge';
import TrendBadge from './TrendBadge';
import { ArrowUpRight } from 'lucide-react';

const priorityBadge = (priority) => {
  switch (priority) {
    case 'Critical': return 'bg-rose-50 text-rose-600 border border-rose-200';
    case 'High':     return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Medium':   return 'bg-sky-50 text-sky-700 border border-sky-200';
    default:         return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

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
    <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="px-6 py-5 border-b border-[#E7ECF3] flex justify-between items-center bg-[#F8F9FB]">
        <div>
          <h3 className="text-base font-black text-[#0F172A] tracking-tight">Hotspot Risk Registry</h3>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">Prioritized by active threat indexes & density metrics</p>
        </div>
        <span className="bg-[#0B1F4D]/5 text-[#0B1F4D] border border-[#0B1F4D]/10 px-3 py-1 rounded-full font-extrabold text-xs">
          {sortedHotspots.length} Logged Zones
        </span>
      </div>

      <div className="overflow-x-auto min-h-[480px]">
        <table className="w-full text-left border-collapse" aria-label="Hotspots ranking table">
          <thead>
            <tr className="sticky top-0 bg-[#F8F9FB] z-10 border-b border-[#E7ECF3]">
              <th className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8F9FB]">Hotspot ID</th>
              <th className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8F9FB]">Jurisdiction</th>
              <th className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8F9FB]">Incidents</th>
              <th className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8F9FB]">Dominant Category</th>
              <th className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8F9FB]">Threat Level</th>
              <th className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8F9FB]">Trend Status</th>
              <th className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8F9FB]">Priority</th>
              <th className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8F9FB] text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7ECF3]/60">
            {sortedHotspots.map((h) => {
              const isSelected = selectedHotspot?.hotspotId === h.hotspotId;
              return (
                <tr 
                  key={h.hotspotId}
                  onClick={() => onSelect(h)}
                  className={`h-14 border-b border-[#E7ECF3]/60 transition-colors cursor-pointer align-middle ${
                    isSelected ? 'bg-[#0B1F4D]/5 border-l-4 border-l-[#0B1F4D]' : 'hover:bg-[#F8F9FB]/80'
                  }`}
                >
                  <td className="px-6 py-3.5 align-middle font-mono font-extrabold text-xs text-[#0B1F4D]">{h.hotspotId}</td>
                  <td className="px-6 py-3.5 align-middle">
                    <div>
                      <p className="font-bold text-[#0F172A] text-xs">{h.policeStation}</p>
                      <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">{h.district}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 align-middle font-mono font-extrabold text-xs text-[#0F172A]">{h.crimeCount}</td>
                  <td className="px-6 py-3.5 align-middle text-xs font-bold text-[#0F172A]">{h.dominantCrime}</td>
                  <td className="px-6 py-3.5 align-middle">
                    <RiskBadge risk={h.riskLevel} />
                  </td>
                  <td className="px-6 py-3.5 align-middle">
                    <TrendBadge trend={h.trend} />
                  </td>
                  <td className="px-6 py-3.5 align-middle">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[11px] ${priorityBadge(h.patrolPriority)}`}>
                      {h.patrolPriority}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 align-middle text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(h);
                      }}
                      className="w-8 h-8 rounded-[10px] bg-[#F8F9FB] border border-[#E7ECF3] text-slate-500 hover:text-[#0B1F4D] hover:bg-white flex items-center justify-center transition-colors cursor-pointer ml-auto"
                      aria-label={`Inspect ${h.hotspotId}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
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
