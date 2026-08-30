import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TRENDS_CHART_DATA } from '../../../mock/analyticsData';
import { LineChart, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function CrimeTrendAnalysis({ timeFilter }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Monthly'); // 'Daily' | 'Monthly' | 'Yearly' | 'Seasonal'

  const tabs = [
    { key: 'Daily', label: t('dashboard.daily', 'Daily') },
    { key: 'Monthly', label: t('dashboard.monthly', 'Monthly') },
    { key: 'Yearly', label: t('dashboard.yearly', 'Yearly') },
    { key: 'Seasonal', label: t('hotspots.seasonal', 'Seasonal') },
  ];

  const chartData = useMemo(() => {
    return TRENDS_CHART_DATA[activeTab] || TRENDS_CHART_DATA.Monthly;
  }, [activeTab]);

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'Cyber Crime': return t('categories.cybercrime', 'Cyber Crime');
      case 'Vehicle Theft': return t('categories.theft', 'Vehicle Theft');
      case 'Burglary': return t('categories.propertyTheft', 'Burglary');
      case 'Fraud': return t('categories.financialFraud', 'Fraud');
      case 'Armed Robbery': return t('categories.violentCrime', 'Armed Robbery');
      case 'Narcotics': return t('categories.narcotics', 'Narcotics');
      case 'Financial Fraud': return t('categories.financialFraud', 'Financial Fraud');
      case 'Property Theft': return t('categories.propertyTheft', 'Property Theft');
      case 'Violent Crimes': return t('categories.violentCrime', 'Violent Crimes');
      default: return cat;
    }
  };

  // Compute SVG line points
  const points = useMemo(() => {
    const width = 500;
    const height = 150;
    const padding = 15;
    const { values, maxVal } = chartData;

    return values.map((val, i) => {
      const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
      const y = height - (val / maxVal) * (height - padding * 2) - padding;
      return { x, y, val };
    });
  }, [chartData]);

  // Generate SVG path string
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  // Generate Area SVG path string
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} 150 L ${first.x} 150 Z`;
  }, [points, linePath]);

  // Mock Category Growth rankings based on activeTab
  const growthCategories = useMemo(() => {
    // Generate different percentage ranges to make it feel alive!
    if (activeTab === 'Daily') {
      return [
        { name: 'Cyber Crime', change: 25, trend: 'up', color: 'bg-rose-500' },
        { name: 'Vehicle Theft', change: 14, trend: 'up', color: 'bg-red-400' },
        { name: 'Burglary', change: -5, trend: 'down', color: 'bg-emerald-500' },
        { name: 'Fraud', change: -10, trend: 'down', color: 'bg-emerald-400' }
      ];
    }
    if (activeTab === 'Seasonal') {
      return [
        { name: 'Armed Robbery', change: 20, trend: 'up', color: 'bg-rose-500' },
        { name: 'Burglary', change: 15, trend: 'up', color: 'bg-red-400' },
        { name: 'Cyber Crime', change: -8, trend: 'down', color: 'bg-emerald-500' },
        { name: 'Narcotics', change: -15, trend: 'down', color: 'bg-emerald-400' }
      ];
    }
    if (activeTab === 'Yearly') {
      return [
        { name: 'Cyber Crime', change: 48, trend: 'up', color: 'bg-rose-500' },
        { name: 'Financial Fraud', change: 22, trend: 'up', color: 'bg-red-400' },
        { name: 'Property Theft', change: -18, trend: 'down', color: 'bg-emerald-500' },
        { name: 'Violent Crimes', change: -8, trend: 'down', color: 'bg-emerald-400' }
      ];
    }
    // Monthly Default
    return [
      { name: 'Vehicle Theft', change: 18, trend: 'up', color: 'bg-rose-500' },
      { name: 'Burglary', change: 11, trend: 'up', color: 'bg-red-400' },
      { name: 'Cyber Crime', change: -12, trend: 'down', color: 'bg-emerald-500' },
      { name: 'Fraud', change: -6, trend: 'down', color: 'bg-emerald-400' }
    ];
  }, [activeTab]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Chart Section (Left) */}
      <div className="lg:col-span-8 bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm flex flex-col space-y-4">
        {/* Module Title & Tab selectors */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center">
              <LineChart className="w-4 h-4 text-[#C79A2B] animate-pulse-soft" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wider">{t('dashboard.crimeTrends', 'Crime Volume Trend Charts')}</h3>
              <p className="text-[10px] text-[#64748B] mt-0.5">{t('dashboard.trendsSubtitle', 'Interactive volume projections based on select time metrics.')}</p>
            </div>
          </div>

          {/* Chart tabs selectors */}
          <div className="flex bg-[#F8F9FB] p-1 rounded-xl border border-[#E7ECF3] shrink-0">
            {tabs.map(tabItem => (
              <button
                key={tabItem.key}
                onClick={() => setActiveTab(tabItem.key)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  activeTab === tabItem.key
                    ? 'bg-[#0B1F4D] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0B1F4D]'
                }`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary SVGLines Chart */}
        <div className="h-64 w-full bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] p-4 flex flex-col justify-between relative overflow-hidden flex-1">
          {/* SVG Draw area */}
          <div className="flex-1 w-full relative">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C79A2B" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#C79A2B" stopOpacity="0" />
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
                  stroke="#E7ECF3" 
                  strokeWidth="1" 
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
                stroke="#C79A2B" 
                strokeWidth="2.5" 
              />

              {/* Dots */}
              {points.map((p, idx) => (
                <g key={idx} className="group/dot cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="3" fill="#C79A2B" />
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="6" 
                    fill="white" 
                    stroke="#0B1F4D" 
                    strokeWidth="1.5"
                    className="opacity-0 group-hover/dot:opacity-100 transition-opacity"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* X Axis labels */}
          <div className="flex justify-between px-3 text-[10px] text-[#64748B] font-mono select-none mt-2">
            {chartData.labels.map(l => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Category Growth Rankings (Right) */}
      <div className="lg:col-span-4 bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm flex flex-col space-y-4">
        <h4 className="text-[#0B1F4D] font-bold uppercase text-[11px] tracking-wider flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
          <div className="w-6 h-6 rounded bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center">
            <Calendar className="w-3 h-3 text-[#C79A2B]" />
          </div>
          {t('dashboard.categoryBreakdown', 'Category Growth')}
        </h4>

        <div className="flex flex-col gap-3 flex-1 justify-between">
          {growthCategories.map((c, idx) => {
            const isUp = c.change >= 0;
            const barWidth = Math.abs(c.change) * 2; // scale for visualization
            return (
              <div key={idx} className="p-4 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] space-y-3 flex flex-col justify-between hover:border-[#CBD5E1] transition-colors shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0B1F4D]">{getCategoryLabel(c.name)}</span>
                  <span className={`font-mono font-bold flex items-center gap-1 ${isUp ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isUp ? <TrendingUp className="w-3 h-3 text-rose-600" /> : <TrendingDown className="w-3 h-3 text-emerald-600" />}
                    {isUp ? '+' : ''}{c.change}%
                  </span>
                </div>
                
                {/* Visual growth indicator */}
                <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
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
