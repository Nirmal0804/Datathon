import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CrimeTrendAnalysis from './components/CrimeTrendAnalysis';
import AnomalyDetection from './components/AnomalyDetection';
import PredictiveRisk from './components/PredictiveRisk';
import HotspotAnalytics from './components/HotspotAnalytics';
import { getIntelligenceAnalytics, getIntelligenceHotspots } from '../../api/endpoints';
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
  const [analyticsData, setAnalyticsData] = useState(null);
  const [hotspotCount, setHotspotCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const filters = ['Today', 'This Week', 'This Month', 'This Year', 'Custom Range'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (timeFilter === 'Custom Range' && customRange.start && customRange.end) {
          params.start_date = customRange.start;
          params.end_date = customRange.end;
        } else if (timeFilter === 'Today') {
          const today = new Date().toISOString().slice(0, 10);
          params.start_date = today;
          params.end_date = today;
        } else if (timeFilter === 'This Week') {
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.start_date = weekAgo.toISOString().slice(0, 10);
          params.end_date = now.toISOString().slice(0, 10);
        } else if (timeFilter === 'This Month') {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          params.start_date = monthStart.toISOString().slice(0, 10);
          params.end_date = now.toISOString().slice(0, 10);
        } else if (timeFilter === 'This Year') {
          const now = new Date();
          params.start_date = `${now.getFullYear()}-01-01`;
          params.end_date = now.toISOString().slice(0, 10);
        }

        const [analytics, hotspots] = await Promise.all([
          getIntelligenceAnalytics(params),
          getIntelligenceHotspots(params),
        ]);
        setAnalyticsData(analytics);
        setHotspotCount(hotspots?.total_hotspots || 0);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeFilter, customRange]);

  const kpis = analyticsData
    ? {
        growth: {
          val: `${analyticsData.total_crimes} FIRs`,
          trend: 'up',
          spark: [analyticsData.total_crimes * 0.85, analyticsData.total_crimes * 0.9, analyticsData.total_crimes * 0.95, analyticsData.total_crimes, analyticsData.total_crimes * 1.05, analyticsData.total_crimes * 1.1, analyticsData.total_crimes].map(Math.round),
        },
        increase: {
          val: analyticsData.dominant_crime_type ? `${analyticsData.dominant_crime_type}` : '—',
          trend: 'up',
          spark: [10, 12, 11, 14, 18, 15, 20],
        },
        decrease: {
          val: `Density: ${analyticsData.density_index?.toFixed(1) || '—'}`,
          trend: 'down',
          spark: [30, 28, 26, 27, 24, 22, 20],
        },
        alerts: {
          val: `${hotspotCount} hotspots`,
          trend: 'up',
          spark: [hotspotCount * 0.6, hotspotCount * 0.7, hotspotCount * 0.8, hotspotCount * 0.9, hotspotCount, hotspotCount * 1.05, hotspotCount].map(Math.round),
        },
      }
    : {
        growth: { val: '—', trend: 'up', spark: [0, 0, 0, 0, 0, 0, 0] },
        increase: { val: '—', trend: 'up', spark: [0, 0, 0, 0, 0, 0, 0] },
        decrease: { val: '—', trend: 'down', spark: [0, 0, 0, 0, 0, 0, 0] },
        alerts: { val: '—', trend: 'up', spark: [0, 0, 0, 0, 0, 0, 0] },
      };

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
