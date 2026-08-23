import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, FileWarning, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

function AnimatedNumber({ value }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const numericStr = value.toString().replace(/,/g, '');
    const end = parseInt(numericStr, 10);
    if (isNaN(end)) {
      setCurrent(value);
      return;
    }
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

  return <span>{typeof current === 'number' ? current.toLocaleString('en-US') : current}</span>;
}

// Sparkline SVG component
const MiniSparkline = ({ data, color, isPositive }) => {
  if (!data || data.length === 0) return null;
  const width = 60;
  const height = 18;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#gradient-${color})`}
        points={`${points} ${width},${height} 0,${height}`}
      />
    </svg>
  );
};

const stats = [
  { 
    label: 'Total Cases (YTD)', 
    value: '14,289', 
    icon: FileWarning, 
    type: 'info', 
    trend: '+12.5%',
    isPositive: false,
    color: '#0B1F4D',
    bg: 'bg-[#0B1F4D]/10',
    sparkline: [40, 50, 45, 60, 55, 70, 80]
  },
  { 
    label: 'Active Investigations', 
    value: '3,492', 
    icon: Clock, 
    type: 'warning', 
    trend: '-5.2%',
    isPositive: true,
    color: '#C79A2B',
    bg: 'bg-[#C79A2B]/10',
    sparkline: [80, 75, 85, 70, 60, 65, 55]
  },
  { 
    label: 'Resolved Cases', 
    value: '10,797', 
    icon: CheckCircle, 
    type: 'success', 
    trend: '+18.1%',
    isPositive: true,
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    sparkline: [50, 55, 60, 75, 80, 85, 95]
  },
  { 
    label: 'Unregistered Incidents', 
    value: '142', 
    icon: AlertCircle, 
    type: 'critical', 
    trend: '+2.4%',
    isPositive: false,
    color: '#EF4444',
    bg: 'bg-rose-500/10',
    sparkline: [20, 22, 25, 23, 28, 30, 35]
  },
];

export default function CrimeStatistics() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 h-full">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
          className="bg-white border border-[#E7ECF3] rounded-[22px] p-5 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#1A2F63]/30 transition-all"
        >
          {/* Top Row: Icon & Status Badge */}
          <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
              stat.isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              {stat.isPositive ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {stat.trend}
            </div>
          </div>

          {/* Value & Label */}
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-[#0B1F4D] tracking-tight">
              <AnimatedNumber value={stat.value} />
            </h3>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{stat.label}</p>
          </div>

          {/* Bottom: Sparkline Context */}
          <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex justify-between items-end">
            <span className="text-[10px] font-bold text-slate-400">Last 7 days</span>
            <MiniSparkline data={stat.sparkline} color={stat.color} isPositive={stat.isPositive} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
