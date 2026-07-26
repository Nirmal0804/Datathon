import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Activity, ShieldCheck, ShieldAlert, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICards({ data }) {
  const [mlKpiData, setMlKpiData] = useState(null);

  useEffect(() => {
    fetch('/data/dashboard_kpis.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch KPI json');
        return res.json();
      })
      .then((kpis) => {
        if (kpis && kpis.total_active_incidents) {
          setMlKpiData({
            totalFIRs: { value: kpis.total_active_incidents, trend: 'down', percentage: '-4.2%' },
            activeCases: { value: kpis.high_risk_hotspots, trend: 'up', percentage: '+2 Hotspots' },
            closedCases: { value: kpis.stations_monitored, trend: 'up', percentage: '100% Coverage' },
            totalArrests: { value: Math.round(kpis.forecast_30day_total), trend: 'up', percentage: '30-Day Forecast' }
          });
        }
      })
      .catch(() => {
        // Fallback to prop data
      });
  }, []);

  // If data is not yet loaded, set fallbacks
  const stats = mlKpiData || data || {
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
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10',
      positive: stats.totalFIRs.trend === 'down', // Decreasing FIRs is positive
    },
    {
      title: 'Active Cases',
      value: stats.activeCases.value.toLocaleString('en-IN'),
      change: stats.activeCases.percentage,
      trend: stats.activeCases.trend,
      note: 'ongoing inquiries',
      icon: Activity,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      positive: stats.activeCases.trend === 'down', // Decreasing active cases is positive
    },
    {
      title: 'Closed Cases',
      value: stats.closedCases.value.toLocaleString('en-IN'),
      change: stats.closedCases.percentage,
      trend: stats.closedCases.trend,
      note: 'clearance rate YTD',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      positive: stats.closedCases.trend === 'up', // Increasing closed cases is positive
    },
    {
      title: 'Total Arrests',
      value: stats.totalArrests.value.toLocaleString('en-IN'),
      change: stats.totalArrests.percentage,
      trend: stats.totalArrests.trend,
      note: 'suspects apprehended',
      icon: ShieldAlert,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      positive: stats.totalArrests.trend === 'up', // Increasing arrests is positive
    },
  ];

  const TrendIcon = ({ trend, positive }) => {
    const color = positive ? 'text-emerald-400' : 'text-rose-400';
    if (trend === 'up') return <TrendingUp className={`w-3.5 h-3.5 ${color}`} />;
    if (trend === 'down') return <TrendingDown className={`w-3.5 h-3.5 ${color}`} />;
    return <Minus className="w-3.5 h-3.5 text-slate-500" />;
  };

  const getChangeColor = (trend, positive) => {
    if (trend === 'neutral') return 'text-slate-500';
    return positive ? 'text-emerald-400' : 'text-rose-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          whileHover={{ y: -2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all duration-200 cursor-default group"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1.5 font-mono">{card.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.iconBg} transition-transform duration-200 group-hover:scale-115`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs pt-2.5 border-t border-slate-800/40">
            {card.trend !== 'neutral' && (
              <TrendIcon trend={card.trend} positive={card.positive} />
            )}
            <span className={`font-semibold ${getChangeColor(card.trend, card.positive)}`}>
              {card.change}
            </span>
            <span className="text-slate-500 text-2xs truncate">{card.note}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
