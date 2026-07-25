import React from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldAlert } from 'lucide-react';

export default function DistrictRanking({ districtData }) {
  // Take top 5 districts for compact view
  const topList = (districtData || []).slice(0, 5);
  const maxCount = topList[0]?.count || 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[280px] justify-between">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-white">District Rankings</h3>
        </div>
        <button className="text-4xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors shrink-0">
          View More
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
        {topList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <ShieldAlert className="w-8 h-8 opacity-40 text-slate-600 animate-pulse" />
            <p className="text-xs">No district metrics in scope</p>
          </div>
        ) : (
          topList.map((d, i) => {
            const percentage = (d.count / maxCount) * 100;
            return (
              <div key={i} className="flex flex-col gap-1 group cursor-default">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    {/* Rank Badge */}
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-3xs font-bold leading-none shrink-0 ${
                      i === 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' :
                      i === 1 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                      i === 2 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' :
                      'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="font-semibold text-slate-300 group-hover:text-white transition-colors truncate max-w-44">
                      {d.district}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-400 shrink-0 text-2xs">
                    {d.count} <span className="text-4xs text-slate-500 uppercase tracking-widest font-normal">Cases</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                    className={`h-full rounded-full transition-colors ${
                      i === 0 ? 'bg-rose-500/80 group-hover:bg-rose-500' :
                      i === 1 ? 'bg-amber-500/80 group-hover:bg-amber-500' :
                      i === 2 ? 'bg-blue-500/80 group-hover:bg-blue-500' :
                      'bg-indigo-500/70 group-hover:bg-indigo-500'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
