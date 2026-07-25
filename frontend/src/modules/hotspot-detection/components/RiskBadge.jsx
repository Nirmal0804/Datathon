import React from 'react';

export default function RiskBadge({ risk }) {
  const styles = {
    Critical: 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]',
    High: 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  };

  const icons = {
    Critical: '🔴',
    High: '🟠',
    Medium: '🟡',
    Low: '🟢'
  };

  const style = styles[risk] || styles.Low;
  const icon = icons[risk] || icons.Low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${style}`}>
      <span>{icon}</span>
      <span>{risk}</span>
    </span>
  );
}
