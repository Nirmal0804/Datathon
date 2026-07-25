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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* 1. Header & Filter controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Crime Trend Analysis & Alerts</h1>
          <p className="text-2xs text-slate-400 font-sans">
            Monitor historical crime patterns, detect emerging threats, and receive AI-powered intelligence alerts.
          </p>
        </div>

        {/* Filters buttons list */}
        <div className="flex flex-wrap gap-2 items-center">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-3xs font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                timeFilter === f
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional custom date input boxes */}
      {timeFilter === 'Custom Range' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl max-w-xl flex flex-col sm:flex-row gap-4 items-end animate-fade-in">
          <div className="flex-1">
            <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Start Date
            </label>
            <input 
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              className="input text-xs h-9 bg-slate-950/40 border-slate-700 py-1"
            />
          </div>
          <div className="flex-1">
            <label className="block text-4xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" /> End Date
            </label>
            <input 
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              className="input text-xs h-9 bg-slate-950/40 border-slate-700 py-1"
            />
          </div>
        </div>
      )}

      {/* 2. Redesigned KPI cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Overall Crime Growth', 
            val: kpis.growth.val, 
            color: kpis.growth.trend === 'up' ? 'text-red-500' : 'text-emerald-500',
            sparkColor: kpis.growth.trend === 'up' ? '#ef4444' : '#10b981',
            icon: kpis.growth.trend === 'up' ? TrendingUp : TrendingDown,
            pts: kpis.growth.spark 
          },
          { 
            title: 'Highest Crime Increase', 
            val: kpis.increase.val, 
            color: 'text-rose-500', 
            sparkColor: '#f43f5e',
            icon: TrendingUp,
            pts: kpis.increase.spark 
          },
          { 
            title: 'Highest Crime Decrease', 
            val: kpis.decrease.val, 
            color: 'text-emerald-450', 
            sparkColor: '#10b981',
            icon: TrendingDown,
            pts: kpis.decrease.spark 
          },
          { 
            title: 'Active Intelligence Alerts', 
            val: kpis.alerts.val, 
            color: 'text-indigo-400', 
            sparkColor: '#6366f1',
            icon: ShieldAlert,
            pts: kpis.alerts.spark 
          }
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3, scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-28 cursor-default transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{card.title}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>

            <div className="flex items-end justify-between mt-2.5">
              <span className={`text-base font-bold font-mono ${card.color}`}>{card.val}</span>
              <Sparkline points={card.pts} strokeColor={card.sparkColor} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Primary Trend Chart Module (CrimeTrendAnalysis) */}
      <CrimeTrendAnalysis timeFilter={timeFilter} />

      {/* 4. Alerts (AnomalyDetection) & Hotspots (HotspotAnalytics) side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <AnomalyDetection timeFilter={timeFilter} />
        <HotspotAnalytics timeFilter={timeFilter} />
      </div>

      {/* 5. Predictive Risk Module (PredictiveRisk) */}
      <PredictiveRisk timeFilter={timeFilter} />

    </div>
  );
}
