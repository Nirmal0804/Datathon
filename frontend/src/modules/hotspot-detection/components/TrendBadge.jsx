import React from 'react';

export default function TrendBadge({ trend }) {
  if (trend === 'Critical Spike') {
    return (
      <span 
        title="Immediate anomaly intervention required. Crime rate has crossed the critical threshold."
        className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse-soft cursor-help"
      >
        <span>🚨</span>
        <span>Critical Spike</span>
      </span>
    );
  }

  if (trend === 'Escalating') {
    return (
      <span 
        title="Significant continuous increase in crime frequency over previous periods."
        className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase tracking-wider cursor-help"
      >
        <span>🔥</span>
        <span>Escalating</span>
      </span>
    );
  }

  if (trend === 'Seasonal') {
    return (
      <span 
        title="Predictable fluctuations matching historical seasonal patterns."
        className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase tracking-wider cursor-help"
      >
        <span>📅</span>
        <span>Seasonal</span>
      </span>
    );
  }

  if (trend === 'Increasing') {
    return (
      <span 
        title="Moderate positive growth trend in crime occurrences."
        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider cursor-help"
      >
        <span>↗️</span>
        <span>Increasing</span>
      </span>
    );
  }

  return (
    <span 
      title="Crime rates are stable and within standard parameters."
      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider cursor-help"
    >
      <span>🟢</span>
      <span>Stable</span>
    </span>
  );
}
