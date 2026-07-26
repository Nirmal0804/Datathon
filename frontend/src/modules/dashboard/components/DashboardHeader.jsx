import React, { useState, useEffect } from 'react';
import { Shield, Clock, Wifi, RefreshCw } from 'lucide-react';

export default function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm relative overflow-hidden">
      {/* Background glowing indicator */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-4">
        {/* Karnataka Police Shield Logo */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.15)]">
          <Shield className="w-7 h-7 text-primary animate-pulse-soft" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              Karnataka Police
            </span>
            <span className="inline-flex items-center gap-1 text-2xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
              <Wifi className="w-3 h-3" /> Live Feed
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Crime Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            State-level real-time analysis, geospatial tracking, and incident monitoring.
          </p>
        </div>
      </div>

      {/* Clock and Live Status Panel */}
      <div className="flex items-center gap-4 w-full md:w-auto md:border-l md:border-slate-800 md:pl-6">
        <div className="flex flex-col items-start md:items-end">
          <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            System Timestamp
          </span>
          <div className="flex items-center gap-2 text-sm text-slate-300 font-mono">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-white">{formattedTime}</span>
            <span className="text-slate-400 border-l border-slate-700 pl-2">{formattedDate}</span>
          </div>
        </div>

        <div className="ml-auto md:ml-0 p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg" title="Database synced">
          <RefreshCw className="w-4 h-4 text-slate-400 cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
}
