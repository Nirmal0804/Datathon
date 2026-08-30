import React from 'react';
import { TrendingUp, Minus, Activity } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function TrendBadge({ trend }) {
  const { t } = useTranslation();

  if (trend === 'Critical Spike') {
    return (
      <span 
        title="Immediate anomaly intervention required. Crime rate has crossed the critical threshold."
        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B91C1C] bg-[#B91C1C]/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse-soft cursor-help"
      >
        <TrendingUp className="w-3 h-3" />
        <span>{t('hotspots.criticalSpike', 'Critical Spike')}</span>
      </span>
    );
  }

  if (trend === 'Escalating') {
    return (
      <span 
        title="Significant continuous increase in crime frequency over previous periods."
        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B45309] bg-[#B45309]/10 px-2 py-0.5 rounded-full uppercase tracking-wider cursor-help"
      >
        <TrendingUp className="w-3 h-3" />
        <span>{t('hotspots.escalating', 'Escalating')}</span>
      </span>
    );
  }

  if (trend === 'Seasonal') {
    return (
      <span 
        title="Predictable fluctuations matching historical seasonal patterns."
        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C79A2B] bg-[#C79A2B]/10 px-2 py-0.5 rounded-full uppercase tracking-wider cursor-help"
      >
        <Activity className="w-3 h-3" />
        <span>{t('hotspots.seasonal', 'Seasonal')}</span>
      </span>
    );
  }

  if (trend === 'Increasing') {
    return (
      <span 
        title="Moderate positive growth trend in crime occurrences."
        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0B1F4D] bg-[#0B1F4D]/10 px-2 py-0.5 rounded-full uppercase tracking-wider cursor-help"
      >
        <TrendingUp className="w-3 h-3" />
        <span>{t('hotspots.increasing', 'Increasing')}</span>
      </span>
    );
  }

  // Stable
  return (
    <span 
      title="Crime rates are within expected historical bounds with no significant deviation."
      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-full uppercase tracking-wider cursor-help"
    >
      <Minus className="w-3 h-3" />
      <span>{t('hotspots.stable', 'Stable')}</span>
    </span>
  );
}
