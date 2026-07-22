import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ShieldCheck, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const kpis = [
  {
    title: 'Active Incidents',
    value: '1,248',
    change: '+5.2%',
    trend: 'up',
    note: 'vs last month',
    icon: Activity,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    positive: false,
  },
  {
    title: 'High-Risk Hotspots',
    value: '34',
    change: '−2',
    trend: 'down',
    note: 'since last week',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    positive: true,   // decrease in hotspots is good
  },
  {
    title: 'Cases Resolved (YTD)',
    value: '8,902',
    change: '+12.5%',
    trend: 'up',
    note: 'clearance rate',
    icon: ShieldCheck,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    positive: true,
  },
  {
    title: 'Districts Monitored',
    value: '31 / 31',
    change: '100%',
    trend: 'neutral',
    note: 'full coverage',
    icon: MapPin,
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
    positive: true,
  },
];

const TrendIcon = ({ trend, positive }) => {
  const color = trend === 'neutral' ? 'text-text-muted' : positive ? 'text-success' : 'text-danger';
  if (trend === 'up')      return <TrendingUp   className={`w-3.5 h-3.5 ${color}`} />;
  if (trend === 'down')    return <TrendingDown  className={`w-3.5 h-3.5 ${color}`} />;
  return <Minus className={`w-3.5 h-3.5 ${color}`} />;
};

const changeColor = (trend, positive) => {
  if (trend === 'neutral') return 'text-text-muted';
  return positive ? 'text-success' : 'text-danger';
};

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: i * 0.07, duration: 0.25 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="card cursor-default group"
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="kpi-label">{kpi.title}</p>
                <p className="kpi-value mt-2">{kpi.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${kpi.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs pt-3 border-t border-border/50">
              <TrendIcon trend={kpi.trend} positive={kpi.positive} />
              <span className={`font-semibold ${changeColor(kpi.trend, kpi.positive)}`}>{kpi.change}</span>
              <span className="text-text-muted">{kpi.note}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
