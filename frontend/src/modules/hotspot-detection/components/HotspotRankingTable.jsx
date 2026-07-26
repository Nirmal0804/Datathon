import React, { useMemo } from 'react';
import RiskBadge from './RiskBadge';
import TrendBadge from './TrendBadge';
import { ArrowUpRight, ArrowUpDown } from 'lucide-react';

export default function HotspotRankingTable({ 
  hotspots, 
  selectedHotspot, 
  onSelect,
  sortKey,
  setSortKey
}) {

  // Risk weighting for sorting
  const riskWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  // Dynamic sorting based on sortKey
  const sortedList = useMemo(() => {
    return [...hotspots].sort((a, b) => {
      if (sortKey === 'crimeCount') {
        return b.crimeCount - a.crimeCount;
      }
      if (sortKey === 'growth') {
        return b.growthPercentage - a.growthPercentage;
      }
      if (sortKey === 'density') {
        return b.densityIndex - a.densityIndex;
      }
      if (sortKey === 'risk') {
        const weightA = riskWeights[a.riskLevel] || 0;
        const weightB = riskWeights[b.riskLevel] || 0;
        return weightB - weightA;
      }
      // default sort: hotspotRank ascending
      return a.hotspotRank - b.hotspotRank;
    });
  }, [hotspots, sortKey]);

  const toggleSort = (key) => {
    setSortKey(prev => prev === key ? 'rank' : key);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
        <div>
          <h3 className="text-sm font-bold text-white">Karnataka Crime Hotspot Rankings</h3>
          <p className="text-4xs text-slate-400 mt-0.5">Ranked by composite threat indexes, growth spikes, and precinct density rates.</p>
        </div>
        <span className="text-4xs font-mono font-bold bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded uppercase">
          {sortedList.length} hotspots tracked
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Analyst hotspots ranking table">
          <thead>
            <tr className="border-b border-slate-800/80 text-3xs font-semibold text-slate-500 uppercase select-none">
              <th className="py-2.5 px-2 w-12 text-center">Rank</th>
              <th className="py-2.5 px-2">Hotspot ID</th>
              <th className="py-2.5 px-2">District</th>
              
              <th 
                className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('crimeCount')}
              >
                <div className="flex items-center gap-1">
                  <span>Crime Count</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th className="py-2.5 px-2">Dominant Category</th>

              <th 
                className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('density')}
              >
                <div className="flex items-center gap-1">
                  <span>Density</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th 
                className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('growth')}
              >
                <div className="flex items-center gap-1">
                  <span>Growth %</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th className="py-2.5 px-2">Trend</th>

              <th 
                className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSort('risk')}
              >
                <div className="flex items-center gap-1">
                  <span>Risk Level</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th className="py-2.5 px-2">Last Incident</th>
              <th className="py-2.5 px-2 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((h) => {
              const isSelected = selectedHotspot?.hotspotId === h.hotspotId;
              
              // Configurable anomaly thresholds
              const ANOMALY_GROWTH_THRESHOLD = 15.0;
              const FREQUENCY_DEVIATION_THRESHOLD = 20.0;
              
              const expectedWeekly = h.historicalAverage ? (h.historicalAverage / 4) : 5.0;
              const currentWeekly = h.crimeCount ? (h.crimeCount / 4) : 8.0;
              const freqDeviation = ((currentWeekly - expectedWeekly) / expectedWeekly) * 100;
              
              const isAnomaly = 
                h.growthPercentage > ANOMALY_GROWTH_THRESHOLD ||
                freqDeviation > FREQUENCY_DEVIATION_THRESHOLD;

              const hotspotStatus = 
                h.trend === 'Emerging' ? 'NEW HOTSPOT' :
                h.growthPercentage < 0 ? 'Resolved' : 'Persistent';

              const trendStatus = 
                h.growthPercentage > 30 ? 'Critical Spike' :
                h.growthPercentage > 15 ? 'Escalating' :
                h.dominantCrime === 'Property Theft' ? 'Seasonal' :
                h.growthPercentage > 5 ? 'Increasing' : 'Stable';

              return (
                <tr 
                  key={h.hotspotId}
                  onClick={() => onSelect(h)}
                  className={`border-b border-slate-850 text-xs hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  } ${isAnomaly ? 'shadow-[inset_0_0_8px_rgba(239,68,68,0.15)] bg-red-950/5' : ''}`}
                >
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-400 bg-slate-950/10">
                    #{h.hotspotRank}
                  </td>
                  <td className="py-2.5 px-2 font-mono font-bold text-slate-350">
                    <div className="flex items-center gap-1">
                      <span>{h.hotspotId}</span>
                      {isAnomaly && <span title="Active Anomaly Warning" className="text-red-400">🚨</span>}
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-200">{h.policeStation}</p>
                        {hotspotStatus === 'NEW HOTSPOT' ? (
                          <span className="px-1.5 py-0.2 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-bold uppercase rounded animate-pulse-soft">NEW</span>
                        ) : hotspotStatus === 'Resolved' ? (
                          <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[8px] font-bold uppercase rounded">Resolved</span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 border border-slate-700/50 text-[8px] font-bold uppercase rounded">Persistent</span>
                        )}
                      </div>
                      <p className="text-4xs text-slate-500">{h.district}</p>
                    </div>
                  </td>
                  
                  <td className="py-2.5 px-2 font-mono font-bold text-slate-200">
                    {h.crimeCount}
                  </td>
                  
                  <td className="py-2.5 px-2 text-slate-300">{h.dominantCrime}</td>
                  
                  <td className="py-2.5 px-2 font-mono font-semibold text-slate-250">
                    {h.densityIndex} /10
                  </td>
                  
                  <td className={`py-2.5 px-2 font-mono font-bold ${
                    h.growthPercentage >= 0 ? 'text-rose-450' : 'text-emerald-450'
                  }`}>
                    {h.growthPercentage >= 0 ? '+' : ''}{h.growthPercentage}%
                  </td>
                  
                  <td className="py-2.5 px-2">
                    <TrendBadge trend={trendStatus} />
                  </td>
                  
                  <td className="py-2.5 px-2">
                    <RiskBadge risk={h.riskLevel} />
                  </td>
                  
                  <td className="py-2.5 px-2 font-mono text-slate-450 text-3xs">
                    {h.lastIncidentDate}
                  </td>
                  
                  <td className="py-2.5 px-2 text-right">
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
