import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getIntelligenceTimeline } from '../../../api/endpoints';
import { LineChart, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export default function CrimeTrendAnalysis({ timeFilter }) {
  const [activeTab, setActiveTab] = useState('Monthly');
  const [timelineData, setTimelineData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = ['Daily', 'Monthly', 'Yearly'];

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (timeFilter === 'Today') {
          params.granularity = 'daily';
          const today = new Date().toISOString().slice(0, 10);
          params.start_date = today;
          params.end_date = today;
        } else if (timeFilter === 'This Week') {
          params.granularity = 'daily';
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.start_date = weekAgo.toISOString().slice(0, 10);
          params.end_date = now.toISOString().slice(0, 10);
        } else if (timeFilter === 'This Month') {
          params.granularity = activeTab === 'Daily' ? 'daily' : 'monthly';
        } else if (timeFilter === 'This Year') {
          params.granularity = 'monthly';
        } else {
          params.granularity = activeTab === 'Daily' ? 'daily' : 'monthly';
        }

        const res = await getIntelligenceTimeline(params);
        setTimelineData(res);
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, [timeFilter, activeTab]);

  const chartData = useMemo(() => {
    if (!timelineData?.buckets?.length) {
      return { labels: [], values: [], maxVal: 1 };
    }
    const buckets = timelineData.buckets;
    const labels = buckets.map(b => b.period);
    const values = buckets.map(b => b.fir_count);
    const maxVal = Math.max(...values, 1);
    return { labels, values, maxVal };
  }, [timelineData]);

  const points = useMemo(() => {
    const width = 500;
    const height = 150;
    const padding = 15;
    const { values, maxVal } = chartData;

    return values.map((val, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * (width - padding * 2) + padding;
      const y = height - (val / maxVal) * (height - padding * 2) - padding;
      return { x, y, val };
    });
  }, [chartData]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = [points[points.length - 1]];
    return `${linePath} L ${last[0].x} 150 L ${first.x} 150 Z`;
  }, [points, linePath]);

  const growthCategories = useMemo(() => {
    if (!timelineData?.buckets?.length) return [];
    const lastBucket = timelineData.buckets[timelineData.buckets.length - 1];
    const breakdowns = lastBucket.crime_head_breakdown || [];
    return breakdowns.slice(0, 4).map(b => ({
      name: b.crime_head || b.Crime_Head || 'Unknown',
      change: b.count || b.fir_count || 0,
      trend: 'up',
      color: 'bg-rose-500',
    }));
  }, [timelineData]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
      
      {/* Module Title & Tab selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-indigo-400 animate-pulse-soft" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Crime Volume Trend Charts</h3>
            <p className="text-4xs text-slate-400 mt-0.5">Interactive volume projections based on select time metrics.</p>
          </div>
        </div>

        {/* Chart tabs selectors */}
        <div className="flex bg-slate-950/45 p-1 rounded-lg border border-slate-850 shrink-0">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1 text-3xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all ${
                activeTab === t
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Primary SVGLines Chart */}
      <div className="space-y-2">
        <div className="h-56 w-full bg-slate-950/20 border border-slate-850/50 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          
          {/* SVG Draw area */}
          <div className="flex-1 w-full relative">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[25, 50, 75, 100, 125].map((yVal, idx) => (
                <line 
                  key={idx} 
                  x1="15" 
                  y1={yVal} 
                  x2="485" 
                  y2={yVal} 
                  stroke="#1e293b" 
                  strokeWidth="0.8" 
                  strokeDasharray="4 4" 
                />
              ))}

              {/* Area path */}
              <path d={areaPath} fill="url(#areaGrad)" />

              {/* Animated Line path */}
              <motion.path 
                key={activeTab} // redraw on tab swap
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                d={linePath} 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2.5" 
              />

              {/* Dots */}
              {points.map((p, idx) => (
                <g key={idx} className="group/dot cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="3" fill="#6366f1" />
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="6" 
                    fill="transparent" 
                    stroke="#818cf8" 
                    strokeWidth="1"
                    className="opacity-0 group-hover/dot:opacity-100 transition-opacity"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* X Axis labels */}
          <div className="flex justify-between px-3 text-[10px] text-slate-500 font-mono select-none">
            {chartData.labels.map(l => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Category Growth Rankings */}
      <div className="space-y-3.5 pt-4 border-t border-slate-800/40">
        <h4 className="text-slate-400 font-bold uppercase text-3xs tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Category Growth Analytics</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {growthCategories.map((c, idx) => {
            const isUp = c.change >= 0;
            const barWidth = Math.abs(c.change) * 2; // scale for visualization
            return (
              <div key={idx} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between hover:border-slate-800 transition-colors">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">{c.name}</span>
                  <span className={`font-mono font-bold flex items-center gap-1 ${isUp ? 'text-red-400' : 'text-emerald-450'}`}>
                    {isUp ? <TrendingUp className="w-3 h-3 text-red-500" /> : <TrendingDown className="w-3 h-3 text-emerald-500" />}
                    {isUp ? '+' : ''}{c.change}%
                  </span>
                </div>
                
                {/* Visual growth indicator */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    key={activeTab} // re-animate on tab change
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(barWidth * 1.5, 100)}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    className={`h-full rounded-full ${isUp ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
