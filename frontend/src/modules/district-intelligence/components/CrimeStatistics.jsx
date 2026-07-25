import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, FileWarning } from 'lucide-react';

function AnimatedNumber({ value }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Strip commas to parse as integer
    const numericStr = value.toString().replace(/,/g, '');
    const end = parseInt(numericStr, 10);
    if (isNaN(end)) {
      setCurrent(value);
      return;
    }

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

  const formatted = typeof current === 'number' 
    ? current.toLocaleString('en-US') 
    : current;

  return <span>{formatted}</span>;
}

const stats = [
  { label: 'Total Cases (YTD)', value: '14,289', icon: FileWarning, color: 'text-blue-500' },
  { label: 'Active Investigations', value: '3,492', icon: Clock, color: 'text-amber-500' },
  { label: 'Resolved Cases', value: '10,797', icon: CheckCircle, color: 'text-emerald-500' },
  { label: 'Unregistered Incidents', value: '142', icon: AlertCircle, color: 'text-red-500' },
];

export default function CrimeStatistics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 hover:border-slate-700 hover:shadow-elevation-1 transition-all duration-300 cursor-default"
        >
          <div className={`p-3 bg-slate-800/50 rounded-lg shrink-0 ${stat.color}`}>
            <stat.icon className="w-6 h-6 animate-pulse-soft" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
            <h4 className="text-2xl font-bold text-white font-mono">
              <AnimatedNumber value={stat.value} />
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
