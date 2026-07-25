import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp } from 'lucide-react';

function AnimatedNumber({ value }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const end = parseInt(value, 10);
    const duration = 1200; // 1.2s
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
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
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between hover:shadow-elevation-2 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">AI Risk Score</h3>
        <ShieldAlert className="w-5 h-5 text-red-500" />
      </div>
      
      <div className="flex items-end gap-4 mb-4">
        <div className="text-5xl font-bold text-red-500 font-mono">
          <AnimatedNumber value="84" />
        </div>
        <div className="text-sm text-slate-400 mb-1">/ 100</div>
      </div>
      
      <div className="space-y-3">
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          {/* Smooth fill animation */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '84%' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="bg-gradient-to-r from-amber-500 to-red-500 h-2.5 rounded-full"
          />
        </div>
        <p className="text-sm font-medium text-red-400 flex items-center gap-2">
          Critical Risk Level 
        </p>
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <TrendingUp className="w-4 h-4 text-red-500" />
          <span>Risk increased by <strong>12%</strong> since last month due to property crime spike.</span>
        </div>
      </div>
    </div>
  );
}
