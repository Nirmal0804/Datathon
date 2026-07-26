import React from 'react';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function IntelligenceSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm flex flex-col justify-between h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#0B1F4D]/5 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-[#0B1F4D]" />
        </div>
        <div>
          <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">Intelligence Summary</h3>
          <p className="text-xs font-semibold text-[#64748B]">AI-Generated Insights</p>
        </div>
      </div>
      
      <div className="space-y-3 flex-1">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-[#334155] leading-snug">
            <span className="font-bold text-[#0F172A]">Property crime</span> increased by 8% this month in central sectors.
          </p>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center mt-0.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-sm font-medium text-[#334155] leading-snug">
            <span className="font-bold text-[#0F172A]">Clearance rate</span> remains stable at 76.4% across the district.
          </p>
        </div>
        
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-[#334155] leading-snug">
            <span className="font-bold text-[#0F172A]">Two emerging hotspots</span> detected; immediate patrol attention advised.
          </p>
        </div>
        
        <div className="flex items-start gap-3">
          <Brain className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-[#334155] leading-snug">
            <span className="font-bold text-[#0F172A]">AI Risk Score</span> increased by 12% in the last 48 hours.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
