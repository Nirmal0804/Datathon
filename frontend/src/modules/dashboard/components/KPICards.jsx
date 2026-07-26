import React from 'react';
import { FileText, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';
import GlobalKPICard from '../../../components/shared/ui/GlobalKPICard';

export default function KPICards({ data, compact = false }) {
  // If data is not yet loaded, set fallbacks
  const stats = data || {
    totalFIRs: { value: 0, trend: 'up', percentage: '0%' },
    activeCases: { value: 0, trend: 'down', percentage: '0%' },
    closedCases: { value: 0, trend: 'up', percentage: '0%' },
    totalArrests: { value: 0, trend: 'up', percentage: '0%' },
  };

  const cards = [
    {
      title: 'Total Registered FIRs',
      value: stats.totalFIRs.value.toLocaleString('en-IN'),
      change: stats.totalFIRs.percentage,
      trend: stats.totalFIRs.trend,
      note: 'vs previous period',
      icon: FileText,
      type: 'info',
      positive: stats.totalFIRs.trend === 'down', // Decreasing FIRs is positive
    },
    {
      title: 'Active Cases',
      value: stats.activeCases.value.toLocaleString('en-IN'),
      change: stats.activeCases.percentage,
      trend: stats.activeCases.trend,
      note: 'ongoing inquiries',
      icon: Activity,
      type: 'warning',
      positive: stats.activeCases.trend === 'down', // Decreasing active cases is positive
    },
    {
      title: 'Closed Cases',
      value: stats.closedCases.value.toLocaleString('en-IN'),
      change: stats.closedCases.percentage,
      trend: stats.closedCases.trend,
      note: 'clearance rate YTD',
      icon: ShieldCheck,
      type: 'success',
      positive: stats.closedCases.trend === 'up', // Increasing closed cases is positive
    },
    {
      title: 'Total Arrests',
      value: stats.totalArrests.value.toLocaleString('en-IN'),
      change: stats.totalArrests.percentage,
      trend: stats.totalArrests.trend,
      note: 'suspects apprehended',
      icon: ShieldAlert,
      type: 'critical',
      positive: stats.totalArrests.trend === 'up', // Increasing arrests is positive
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {cards.map((card, i) => (
        <GlobalKPICard
          key={i}
          delay={i * 0.05}
          title={card.title}
          value={card.value}
          icon={card.icon}
          type={card.type}
          trend={card.trend}
          trendValue={card.change}
          positive={card.positive}
          description={card.note}
          compact={compact}
        />
      ))}
    </div>
  );
}
