import React, { useState, useMemo } from 'react';
import { Columns, ShieldAlert } from 'lucide-react';
import RiskBadge from './RiskBadge';
import TrendBadge from './TrendBadge';

export default function HotspotComparison({ hotspots }) {
  const [hotspotAId, setHotspotAId] = useState(hotspots[0]?.hotspotId || '');
  const [hotspotBId, setHotspotBId] = useState(hotspots[1]?.hotspotId || '');

  const hotspotA = useMemo(() => hotspots.find(h => h.hotspotId === hotspotAId), [hotspots, hotspotAId]);
  const hotspotB = useMemo(() => hotspots.find(h => h.hotspotId === hotspotBId), [hotspots, hotspotBId]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Columns className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-white">Hotspot Comparison Tool</h3>
          <p className="text-4xs text-slate-400 mt-0.5">Evaluate threat indices side-by-side to optimize security deployments.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" htmlFor="comp-hotspot-a">Hotspot Zone A</label>
          <select
            id="comp-hotspot-a"
            value={hotspotAId}
            onChange={(e) => setHotspotAId(e.target.value)}
            className="select text-xs h-9 bg-slate-950/40 border-slate-700"
          >
            {hotspots.map(h => (
              <option key={h.hotspotId} value={h.hotspotId}>{h.hotspotId} ({h.policeStation})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" htmlFor="comp-hotspot-b">Hotspot Zone B</label>
          <select
            id="comp-hotspot-b"
            value={hotspotBId}
            onChange={(e) => setHotspotBId(e.target.value)}
            className="select text-xs h-9 bg-slate-950/40 border-slate-700"
          >
            {hotspots.map(h => (
              <option key={h.hotspotId} value={h.hotspotId}>{h.hotspotId} ({h.policeStation})</option>
            ))}
          </select>
        </div>
      </div>

      {hotspotA && hotspotB ? (
        <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-850 space-y-4 text-xs">
          <div className="grid grid-cols-3 text-center font-semibold text-slate-500 text-4xs uppercase tracking-wider pb-1.5 border-b border-slate-850/40">
            <span className="text-left truncate">{hotspotA.hotspotId}</span>
            <span>Indicator</span>
            <span className="text-right truncate">{hotspotB.hotspotId}</span>
          </div>

          <div className="grid grid-cols-3 text-center py-0.5">
            <span className="text-left font-mono font-bold text-slate-200">{hotspotA.policeStation}</span>
            <span className="text-[10px] text-slate-500">Police Station</span>
            <span className="text-right font-mono font-bold text-slate-200">{hotspotB.policeStation}</span>
          </div>

          <div className="grid grid-cols-3 text-center py-0.5">
            <span className="text-left font-mono font-bold text-slate-250">{hotspotA.crimeCount} cases</span>
            <span className="text-[10px] text-slate-500">Crime Count</span>
            <span className="text-right font-mono font-bold text-slate-250">{hotspotB.crimeCount} cases</span>
          </div>

          <div className="grid grid-cols-3 text-center py-0.5">
            <span className={`text-left font-mono font-bold ${hotspotA.growthPercentage >= 0 ? 'text-rose-450' : 'text-emerald-450'}`}>
              {hotspotA.growthPercentage >= 0 ? '+' : ''}{hotspotA.growthPercentage}%
            </span>
            <span className="text-[10px] text-slate-500">YoY Growth %</span>
            <span className={`text-right font-mono font-bold ${hotspotB.growthPercentage >= 0 ? 'text-rose-450' : 'text-emerald-450'}`}>
              {hotspotB.growthPercentage >= 0 ? '+' : ''}{hotspotB.growthPercentage}%
            </span>
          </div>

          <div className="grid grid-cols-3 text-center py-0.5">
            <span className="text-left font-mono font-bold text-slate-250">{hotspotA.densityIndex} /10</span>
            <span className="text-[10px] text-slate-500">Density Index</span>
            <span className="text-right font-mono font-bold text-slate-250">{hotspotB.densityIndex} /10</span>
          </div>

          <div className="grid grid-cols-3 text-center py-0.5">
            <span className="text-left font-semibold text-slate-200">{hotspotA.dominantCrime}</span>
            <span className="text-[10px] text-slate-500">Dominant Crime</span>
            <span className="text-right font-semibold text-slate-200">{hotspotB.dominantCrime}</span>
          </div>

          <div className="grid grid-cols-3 text-center py-0.5 items-center">
            <span className="text-left"><RiskBadge risk={hotspotA.riskLevel} /></span>
            <span className="text-[10px] text-slate-500">Risk Level</span>
            <span className="text-right"><RiskBadge risk={hotspotB.riskLevel} /></span>
          </div>

          <div className="grid grid-cols-3 text-center py-0.5 items-center">
            <span className="text-left"><TrendBadge trend={hotspotA.trend} /></span>
            <span className="text-[10px] text-slate-500">Trend Status</span>
            <span className="text-right"><TrendBadge trend={hotspotB.trend} /></span>
          </div>

          <div className="grid grid-cols-3 text-center py-0.5">
            <span className="text-left font-mono font-bold text-slate-300">{hotspotA.historicalAverage}</span>
            <span className="text-[10px] text-slate-500">Historical Avg</span>
            <span className="text-right font-mono font-bold text-slate-300">{hotspotB.historicalAverage}</span>
          </div>

          <div className="pt-2 border-t border-slate-850/50 space-y-2">
            <span className="block text-4xs text-slate-500 font-bold uppercase tracking-wider">Strategic Recommendations</span>
            <div className="grid grid-cols-2 gap-4 text-3xs text-slate-450 leading-relaxed">
              <div className="p-2 rounded bg-slate-950/20 border border-slate-850">
                <span className="block font-bold text-slate-300 mb-0.5">{hotspotA.hotspotId} Recommendation:</span>
                {hotspotA.recommendation}
              </div>
              <div className="p-2 rounded bg-slate-950/20 border border-slate-850">
                <span className="block font-bold text-slate-300 mb-0.5">{hotspotB.hotspotId} Recommendation:</span>
                {hotspotB.recommendation}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 bg-slate-950/40 rounded border border-slate-850 text-slate-500">
          Pick two hotspots from the dropdowns above to compare metrics.
        </div>
      )}
    </div>
  );
}
