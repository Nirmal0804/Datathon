import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp } from 'lucide-react';

function AnimatedNumber({ value }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const end = parseInt(value, 10);
    const duration = 1200; 
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); 
      setCurrent(Math.floor(ease * end));
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }, [value]);

  return <span>{current}</span>;
}

export default function RiskScoreCard() {
  const score = 84;
  const circumference = 2 * Math.PI * 40; 
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-rose-200 rounded-[22px] p-6 shadow-sm h-full flex flex-col justify-between relative overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider mb-1">AI Risk Score</h3>
          <p className="text-xs font-semibold text-[#64748B]">Predictive Threat Level</p>
        </div>
        <div className="w-10 h-10 rounded-[14px] bg-rose-50 flex items-center justify-center border border-rose-100">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
        </div>
      </div>
      
      <div className="relative z-10 flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-slate-100"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            {/* Progress circle */}
            <motion.circle
              className="text-rose-500"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[#0B1F4D] tracking-tight">
              <AnimatedNumber value={score} />
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="px-3 py-1 bg-rose-50 border border-rose-100 rounded-full inline-block">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">Critical Risk</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% this month</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 mt-auto pt-4 border-t border-[#F1F5F9]">
        <p className="text-xs font-medium text-[#334155] leading-relaxed">
          <strong className="text-[#0B1F4D] font-bold">Insight:</strong> Risk increased significantly due to a recent spike in property-related crimes in the central sectors.
        </p>
      </div>
    </motion.div>
  );
}
