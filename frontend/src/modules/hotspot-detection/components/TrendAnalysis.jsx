import React, { useMemo } from 'react';
import { TrendingUp, MoveRight, TrendingDown, ShieldAlert } from 'lucide-react';

export default function TrendAnalysis({ hotspots }) {
  const trendStats = useMemo(() => {
    const emerging = hotspots.filter(h => h.trend === 'Emerging');
    const persistent = hotspots.filter(h => h.trend === 'Persistent');
    const declining = hotspots.filter(h => h.trend === 'Declining');

    const getAvgGrowth = (list) => {
      if (list.length === 0) return 0;
      const sum = list.reduce((acc, h) => acc + h.growthPercentage, 0);
      return (sum / list.length).toFixed(1);
    };

    return {
      emerging: { count: emerging.length, avgGrowth: getAvgGrowth(emerging) },
      persistent: { count: persistent.length, avgGrowth: getAvgGrowth(persistent) },
      declining: { count: declining.length, avgGrowth: getAvgGrowth(declining) }
    };
  }, [hotspots]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <ShieldAlert className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-white">Trend Progression Analysis</h3>
          <p className="text-4xs text-slate-400 mt-0.5">Statistical trajectory indicators for active spatial clusters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Emerging */}
        <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 rounded-xl flex flex-col justify-between h-28">
          <div className="flex items-center justify-between text-rose-450 font-bold uppercase tracking-wider text-4xs">
            <span>Emerging Threats</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{trendStats.emerging.count}</p>
            <p className="text-4xs text-rose-450 mt-1">Average growth: <span className="font-bold">+{trendStats.emerging.avgGrowth}%</span></p>
          </div>
        </div>

        {/* Persistent */}
        <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex flex-col justify-between h-28">
          <div className="flex items-center justify-between text-amber-450 font-bold uppercase tracking-wider text-4xs">
            <span>Persistent Levels</span>
            <MoveRight className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{trendStats.persistent.count}</p>
            <p className="text-4xs text-amber-450 mt-1">Average growth: <span className="font-bold">+{trendStats.persistent.avgGrowth}%</span></p>
          </div>
        </div>

        {/* Declining */}
        <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex flex-col justify-between h-28">
          <div className="flex items-center justify-between text-emerald-450 font-bold uppercase tracking-wider text-4xs">
            <span>Declining Zones</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">{trendStats.declining.count}</p>
            <p className="text-4xs text-emerald-450 mt-1">Average growth: <span className="font-bold">{trendStats.declining.avgGrowth}%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
