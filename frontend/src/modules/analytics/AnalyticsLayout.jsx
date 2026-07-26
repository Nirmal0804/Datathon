import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CrimeTrendAnalysis from './components/CrimeTrendAnalysis';
import AnomalyDetection from './components/AnomalyDetection';
import PredictiveRisk from './components/PredictiveRisk';
import HotspotAnalytics from './components/HotspotAnalytics';
import { SUMMARY_CARDS_DATA } from '../../mock/analyticsData';
import { TrendingUp, TrendingDown, ArrowRight, ShieldAlert, Calendar } from 'lucide-react';

// Pure SVG Sparkline Component for KPI Sparklines
function Sparkline({ points, strokeColor }) {
  if (!points || points.length === 0) return null;
  const width = 80;
  const height = 24;
  const padding = 2;
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const spread = maxVal - minVal || 1;

  const pathPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((p - minVal) / spread) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pathPoints.join(' ')}
      />
    </svg>
  );
}

export default function AnalyticsLayout() {
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const filters = ['Today', 'This Week', 'This Month', 'This Year', 'Custom Range'];

  // Resolve KPI card values from timeFilter
  const kpis = SUMMARY_CARDS_DATA[timeFilter] || SUMMARY_CARDS_DATA['This Month'];

  return (
    <div className="w-full mx-auto space-y-6 pb-16 px-6 sm:px-8">
      
      {/* 1. Header & Filter controls */}
      <div className="bg-white border border-[#E7ECF3] p-6 rounded-[20px] flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-[22px] font-black text-[#0B1F4D] uppercase tracking-wider">Crime Trend Analysis & Alerts</h1>
          <p className="text-xs text-[#64748B] font-medium">
            Monitor historical crime patterns, detect emerging threats, and receive AI-powered intelligence alerts.
          </p>
        </div>

        {/* Filters buttons list */}
        <div className="flex flex-wrap gap-2 items-center">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                timeFilter === f
                  ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-sm'
                  : 'bg-[#F8F9FB] text-[#64748B] border-[#E7ECF3] hover:text-[#0B1F4D] hover:bg-[#F1F5F9]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional custom date input boxes */}
      {timeFilter === 'Custom Range' && (
        <div className="bg-white border border-[#E7ECF3] p-4 rounded-[20px] max-w-xl flex flex-col sm:flex-row gap-4 items-end animate-fade-in shadow-sm">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#C79A2B]" /> Start Date
            </label>
            <input 
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full text-xs h-10 px-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl text-[#0B1F4D] font-medium outline-none focus:border-[#0B1F4D]/30"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#C79A2B]" /> End Date
            </label>
            <input 
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full text-xs h-10 px-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl text-[#0B1F4D] font-medium outline-none focus:border-[#0B1F4D]/30"
            />
          </div>
        </div>
      )}

      {/* 2. Redesigned KPI cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Overall Crime Growth', 
            val: kpis.growth.val, 
            color: kpis.growth.trend === 'up' ? 'text-rose-600' : 'text-emerald-600',
            sparkColor: kpis.growth.trend === 'up' ? '#e11d48' : '#059669',
            icon: kpis.growth.trend === 'up' ? TrendingUp : TrendingDown,
            pts: kpis.growth.spark 
          },
          { 
            title: 'Highest Crime Increase', 
            val: kpis.increase.val, 
            color: 'text-rose-600', 
            sparkColor: '#e11d48',
            icon: TrendingUp,
            pts: kpis.increase.spark 
          },
          { 
            title: 'Highest Crime Decrease', 
            val: kpis.decrease.val, 
            color: 'text-emerald-600', 
            sparkColor: '#059669',
            icon: TrendingDown,
            pts: kpis.decrease.spark 
          },
          { 
            title: 'Active Intelligence Alerts', 
            val: kpis.alerts.val, 
            color: 'text-[#C79A2B]', 
            sparkColor: '#C79A2B',
            icon: ShieldAlert,
            pts: kpis.alerts.spark 
          }
        ].map((card, i) => {
          // Extract text and optional parenthesis to style differently
          const match = card.val.match(/^(.*?)\s*(\(.*?\))?$/);
          const mainText = match ? match[1] : card.val;
          const subText = match && match[2] ? match[2] : '';

          return (
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.01, boxShadow: '0 8px 24px rgba(11,31,77,0.06)' }}
              className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 flex flex-col justify-between h-[120px] cursor-default transition-all duration-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider leading-tight w-2/3">{card.title}</span>
                <div className="w-7 h-7 rounded-lg bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center shrink-0">
                  <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>

              <div className="flex items-end justify-between mt-2 flex-1">
                <div className={`flex flex-col justify-end ${card.color}`}>
                  <span className="text-base sm:text-lg font-bold font-mono leading-none break-words line-clamp-2">{mainText}</span>
                  {subText && <span className="text-xs sm:text-sm font-bold font-mono mt-1 opacity-90">{subText}</span>}
                </div>
                <div className="w-16 h-8 shrink-0 ml-2">
                  <Sparkline points={card.pts} strokeColor={card.sparkColor} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Main Dashboard Layout - 12 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Row 1 */}
        <div className="lg:col-span-12">
          <CrimeTrendAnalysis timeFilter={timeFilter} />
        </div>

        {/* Row 2 */}
        <div className="lg:col-span-6 flex flex-col">
          <AnomalyDetection timeFilter={timeFilter} />
        </div>
        <div className="lg:col-span-6 flex flex-col">
          <HotspotAnalytics timeFilter={timeFilter} />
        </div>

        {/* Row 3 */}
        <div className="lg:col-span-12">
          <PredictiveRisk timeFilter={timeFilter} />
        </div>

      </div>

    </div>
  );
}
