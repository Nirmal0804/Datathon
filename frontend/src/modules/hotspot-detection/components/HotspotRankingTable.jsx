import React, { useMemo } from 'react';
import RiskBadge from './RiskBadge';
import TrendBadge from './TrendBadge';
import { ArrowUpRight, ArrowUpDown, ShieldAlert } from 'lucide-react';

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
    <div className="bg-white border border-[#E7ECF3] rounded-[20px] overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-6 py-5 border-b border-[#E7ECF3] flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">Karnataka Crime Hotspot Rankings</h3>
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Ranked by composite threat indexes, growth spikes, and precinct density rates.</p>
        </div>
        <span className="text-xs font-bold font-mono bg-[#F8F9FB] border border-[#E7ECF3] text-[#0B1F4D] px-2.5 py-1 rounded-lg uppercase tracking-wider">
          {sortedList.length} hotspots tracked
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse" aria-label="Analyst hotspots ranking table">
          <thead className="bg-[#F8F9FB] sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <tr className="border-b border-[#E7ECF3] text-xs font-bold text-[#64748B] uppercase tracking-wider select-none">
              <th className="py-3 px-4 text-center w-12">Rank</th>
              <th className="py-3 px-3">Hotspot ID & Station</th>
              <th 
                className="py-3 px-3 cursor-pointer hover:text-[#0B1F4D] transition-colors group"
                onClick={() => toggleSort('crimeCount')}
              >
                <div className="flex items-center gap-1">
                  <span>Crime Count</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8] group-hover:text-[#0B1F4D] transition-colors" />
                </div>
              </th>
              <th className="py-3 px-3">Category</th>
              <th 
                className="py-3 px-3 cursor-pointer hover:text-[#0B1F4D] transition-colors group"
                onClick={() => toggleSort('density')}
              >
                <div className="flex items-center gap-1">
                  <span>Density</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8] group-hover:text-[#0B1F4D] transition-colors" />
                </div>
              </th>
              <th 
                className="py-3 px-3 cursor-pointer hover:text-[#0B1F4D] transition-colors group"
                onClick={() => toggleSort('growth')}
              >
                <div className="flex items-center gap-1">
                  <span>Growth %</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8] group-hover:text-[#0B1F4D] transition-colors" />
                </div>
              </th>
              <th className="py-3 px-3">Trend History</th>
              <th className="py-3 px-3">Status</th>
              <th 
                className="py-3 px-3 cursor-pointer hover:text-[#0B1F4D] transition-colors group"
                onClick={() => toggleSort('risk')}
              >
                <div className="flex items-center gap-1">
                  <span>Risk Level</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8] group-hover:text-[#0B1F4D] transition-colors" />
                </div>
              </th>
              <th className="py-3 px-3">Last Incident</th>
              <th className="py-3 px-4 text-right">Inspect</th>
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

              // Dummy sparkline points based on growth/trend
              const sparkPts = h.growthPercentage > 0 
                ? [2, 5, 8, 12, 18, 25, 30] 
                : h.growthPercentage < 0 
                  ? [30, 28, 22, 18, 15, 10, 5] 
                  : [10, 12, 9, 11, 10, 13, 12];
              
              const sparkMax = Math.max(...sparkPts);
              const sparkMin = Math.min(...sparkPts);
              const pathD = sparkPts.map((p, i) => {
                const x = (i / (sparkPts.length - 1)) * 40;
                const y = 16 - ((p - sparkMin) / (sparkMax - sparkMin || 1)) * 16;
                return `${i===0?'M':'L'} ${x} ${y}`;
              }).join(' ');

              return (
                <tr 
                  key={h.hotspotId}
                  onClick={() => onSelect(h)}
                  className={`border-b border-[#F1F5F9] text-[11px] font-medium hover:bg-[#F8F9FB] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#F1F5F9] border-l-4 border-l-[#0B1F4D]' : 'border-l-4 border-l-transparent'
                  } ${isAnomaly ? 'bg-red-50/30' : ''}`}
                >
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#64748B]">
                    #{h.hotspotRank}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-[#0B1F4D] uppercase tracking-wide">{h.policeStation}</p>
                          {isAnomaly && <ShieldAlert className="w-3 h-3 text-[#B91C1C]" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[#64748B] uppercase text-xs">{h.hotspotId}</span>
                          <span className="text-[#94A3B8]">•</span>
                          <span className="text-[#64748B] uppercase text-xs tracking-wide font-bold">{h.district}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-3 font-mono font-black text-[#0B1F4D] text-xs">
                    {h.crimeCount}
                  </td>
                  
                  <td className="py-3 px-3 text-[#0F172A] font-semibold">{h.dominantCrime}</td>
                  
                  <td className="py-3 px-3 font-mono font-bold text-[#64748B]">
                    {h.densityIndex} <span className="text-xs opacity-70">/10</span>
                  </td>
                  
                  <td className={`py-3 px-3 font-mono font-black ${
                    h.growthPercentage >= 0 ? 'text-[#B91C1C]' : 'text-[#15803D]'
                  }`}>
                    {h.growthPercentage >= 0 ? '+' : ''}{h.growthPercentage}%
                  </td>
                  
                  <td className="py-3 px-3">
                    <div className="w-10 h-4">
                      <svg viewBox="0 0 40 16" className="w-full h-full overflow-visible">
                        <path 
                          d={pathD} 
                          fill="none" 
                          stroke={h.growthPercentage > 0 ? '#B91C1C' : h.growthPercentage < 0 ? '#15803D' : '#64748B'} 
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <TrendBadge trend={trendStatus} />
                  </td>
                  
                  <td className="py-3 px-3">
                    <RiskBadge risk={h.riskLevel} />
                  </td>
                  
                  <td className="py-3 px-3 font-mono text-[#64748B] text-xs font-semibold">
                    {h.lastIncidentDate}
                  </td>
                  
                  <td className="py-3 px-4 text-right">
                    <div className={`p-1.5 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#0B1F4D] text-white' : 'bg-[#F8F9FB] text-[#64748B] hover:bg-[#0B1F4D] hover:text-white border border-[#E7ECF3]'
                    }`}>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
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
