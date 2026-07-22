import React from 'react';
import { Flame } from 'lucide-react';

const hotspots = [
  { area: 'Koramangala Block 5', trend: '+15%', priority: 'High' },
  { area: 'Indiranagar 100ft Rd', trend: '+8%', priority: 'Medium' },
  { area: 'Majestic Bus Stand', trend: '-2%', priority: 'Low' },
];

export default function HotspotSummary() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-red-500" />
        Emerging Hotspots
      </h3>
      <div className="space-y-3">
        {hotspots.map((hs, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 border border-slate-800 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-slate-200">{hs.area}</p>
              <p className={`text-xs mt-0.5 ${hs.trend.startsWith('+') ? 'text-red-400' : 'text-emerald-400'}`}>
                {hs.trend} this week
              </p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              hs.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
              hs.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {hs.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
