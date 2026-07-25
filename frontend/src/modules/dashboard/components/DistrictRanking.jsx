import React from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldAlert } from 'lucide-react';

export default function DistrictRanking({ districtData }) {
  // Take top 5 districts for compact view
  const topList = (districtData || []).slice(0, 5);
  const maxCount = topList[0]?.count || 1;

  return (
    <div className="card p-6 shadow-sm flex flex-col h-[320px] justify-between">
      <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#C79A2B]/10 text-[#C79A2B]">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-[14px] font-extrabold text-[#0F172A] tracking-tight">District Rankings</h3>
        </div>
        <button className="text-[10px] font-bold text-[#1E3A8A] hover:text-[#0F172A] hover:underline transition-colors shrink-0 uppercase tracking-widest">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
        {topList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <ShieldAlert className="w-8 h-8 opacity-20 text-[#0F172A]" />
            <p className="text-[11px] font-bold uppercase tracking-widest">No metrics available</p>
          </div>
        ) : (
          topList.map((d, i) => {
            const percentage = (d.count / maxCount) * 100;
            return (
              <div key={i} className="flex flex-col gap-2 group cursor-default">
                <div className="flex justify-between items-center text-[12px]">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold leading-none shrink-0 shadow-sm ${
                      i === 0 ? 'bg-red-50 text-red-700 border border-red-200' :
                      i === 1 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      i === 2 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="font-bold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors truncate max-w-[160px]">
                      {d.district}
                    </span>
                  </div>
                  <span className="font-extrabold text-[#0F172A] shrink-0 text-[13px]">
                    {d.count} <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Cases</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-[#F7F8FA] rounded-full overflow-hidden border border-[#E7EAF0]/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                    className={`h-full rounded-full transition-colors shadow-sm ${
                      i === 0 ? 'bg-[#8B1E3F]' :
                      i === 1 ? 'bg-[#B45309]' :
                      i === 2 ? 'bg-[#1E3A8A]' :
                      'bg-[#0F172A]'
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
