import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalKPICard({ 
  title, 
  value, 
  description, 
  trend, // 'up', 'down', 'neutral'
  trendValue, // e.g. "+12%" or "5%"
  positive, // true/false (determines if 'up' is green or red)
  icon: Icon,
  type = 'info', // 'info', 'success', 'warning', 'critical'
  delay = 0,
  compact = false,
  children
}) {
  const getIconStyles = () => {
    switch(type) {
      case 'success': return 'bg-[#15803D]/10 text-[#15803D]';
      case 'warning': return 'bg-[#B45309]/10 text-[#B45309]';
      case 'critical': return 'bg-[#B91C1C]/10 text-[#B91C1C]';
      case 'info':
      default: return 'bg-[#1E3A8A]/10 text-[#1E3A8A]';
    }
  };

  const TrendPill = () => {
    if (!trend || trend === 'neutral' || !trendValue) {
      if (!trendValue) return null;
      return (
        <span className={`inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded-full font-bold ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
          <Minus className="w-3 h-3" />
          {trendValue}
        </span>
      );
    }
    
    // Determine color
    const isGreen = positive;
    const colorClass = isGreen ? 'bg-[#15803D]/10 text-[#15803D]' : 'bg-[#B91C1C]/10 text-[#B91C1C]';
    const IconComponent = trend === 'up' ? TrendingUp : TrendingDown;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-bold ${colorClass} ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}>
        <IconComponent className="w-3 h-3" />
        {trendValue}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ y: -3 }}
      className={`bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm flex flex-col justify-between transition-all duration-200 ease-in-out cursor-default ${compact ? 'p-6 h-[130px]' : 'p-7 h-[144px]'}`}
    >
      {/* Top Row: Title & Icon */}
      <div className="flex justify-between items-start">
        <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider leading-tight pr-2">{title}</h3>
        {Icon && (
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm bg-slate-100/80">
            <Icon className="w-5 h-5 text-police-navy" />
          </div>
        )}
      </div>

      {/* Bottom Row: Value & Description/Trend */}
      <div className="flex items-end justify-between mt-auto gap-4">
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-extrabold text-[#0F172A] leading-none tracking-tight">{value}</p>
        </div>
        
        {/* Support Text & Trend */}
        {(description || trend || children) && (
          <div className="flex items-baseline gap-1.5 shrink-0">
            {trend && <TrendPill />}
            {description && <span className="text-xs font-normal text-[#64748B]">{description}</span>}
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}
