import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, PieChart, Activity, Calendar, ShieldAlert } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';
import { useTranslation } from '../../../i18n';

export default function ChartsPlaceholder({ trendsData, categoryData, districtData, overview = false }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('trends'); // 'trends' or 'distribution'

  // Safety checks
  const categories = categoryData || [];
  const districts = districtData || [];
  const trends = trendsData || { daily: [], monthly: [], yearly: [] };

  // Calculate total cases for category distribution
  const totalCategoryCases = categories.reduce((sum, c) => sum + c.count, 0);

  // Colors mapping for categories
  const categoryColors = {
    'Cybercrime': '#1E3A8A', // Muted Blue
    'Property Theft': '#0F172A', // Deep Navy
    'Violent Crime': '#8B1E3F', // Maroon Accent
    'Financial Fraud': '#B45309', // Warning Orange
    'Narcotics': '#15803D', // Success Green
    'Crime Against Women': '#C79A2B', // Gold Highlight
  };
  const fallbackColors = ['#1E3A8A', '#0F172A', '#15803D', '#B45309', '#8B1E3F', '#C79A2B'];

  // Helper: Donut Chart calculation
  let accumulatedPercent = 0;
  const donutSegments = categories.map((cat, i) => {
    const color = categoryColors[cat.category] || fallbackColors[i % fallbackColors.length];
    const percentage = cat.percentage;
    const strokeDasharray = `${percentage} ${100 - percentage}`;
    const strokeDashoffset = 100 - accumulatedPercent + 25; // start at top (12 o'clock)
    accumulatedPercent += percentage;
    return {
      ...cat,
      color,
      strokeDasharray,
      strokeDashoffset
    };
  });

  // Render Daily Crime Trend SVG
  const renderDailyTrend = () => {
    const data = trends.daily || [];
    if (data.length === 0) return <EmptyState type="analytics" title={t('dashboard.noDailyTrends', 'No Daily Trends')} message={t('dashboard.noDailyTrendsDesc', 'No daily trend data available.')} compact={true} />;

    const width = 500;
    const height = 160;
    const padding = 20;
    
    const maxVal = Math.max(...data.map(d => d.count), 5);
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - (d.count / maxVal) * (height - 2 * padding);
      return { x, y, label: d.date, count: d.count };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Daily Trend (Last 10 Days)</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Total volume</span>
        </div>
        <div className="relative w-full h-40">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.5, 1].map((ratio, idx) => {
              const yVal = padding + ratio * (height - 2 * padding);
              return (
                <line
                  key={idx}
                  x1={padding}
                  y1={yVal}
                  x2={width - padding}
                  y2={yVal}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
            
            {/* Trend Line Path */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              d={pathD}
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Dots */}
            {points.map((p, i) => (
              <g key={i} className="group/dot cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#1E3A8A"
                  strokeWidth="2.5"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  fill="#1E3A8A"
                  className="opacity-0 group-hover/dot:opacity-10 transition-opacity"
                />
                {/* Tooltip */}
                <foreignObject x={p.x - 30} y={p.y - 36} width="60" height="28" className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[#0F172A] rounded-lg px-2 py-1 text-center shadow-md">
                    <p className="text-[10px] font-bold text-white leading-tight">{p.count} FIRs</p>
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>
        {/* X Axis Labels */}
        <div className="flex justify-between px-4 pt-2 border-t border-[#E7EAF0]">
          {points.filter((_, idx) => idx % 2 === 0).map((p, i) => (
            <span key={i} className="text-[10px] font-semibold text-slate-400">{p.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render Monthly Crime Trend SVG
  const renderMonthlyTrend = () => {
    const data = trends.monthly || [];
    if (data.length === 0) return <EmptyState type="analytics" title="No Monthly Trends" message="No monthly trend data available." compact={true} />;

    const width = 500;
    const height = 160;
    const padding = 20;

    const maxVal = Math.max(...data.map(d => d.count), 5);
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - (d.count / maxVal) * (height - 2 * padding);
      return { x, y, label: d.month, count: d.count };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Path closed for area gradient
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Monthly Incident Load</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Yearly</span>
        </div>
        <div className="relative w-full h-40">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.5, 1].map((ratio, idx) => {
              const yVal = padding + ratio * (height - 2 * padding);
              return (
                <line
                  key={idx}
                  x1={padding}
                  y1={yVal}
                  x2={width - padding}
                  y2={yVal}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Filled Area */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              d={areaD}
              fill="url(#area-gradient)"
            />

            {/* Line Path */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              d={pathD}
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Dots */}
            {points.map((p, i) => (
              <g key={i} className="group/dot cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#1E3A8A"
                  strokeWidth="2"
                />
                {/* Tooltip */}
                <foreignObject x={p.x - 30} y={p.y - 36} width="60" height="28" className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[#0F172A] rounded-lg px-2 py-1 text-center shadow-md">
                    <p className="text-[10px] font-bold text-white leading-tight">{p.count} Cases</p>
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>
        {/* X Axis Labels */}
        <div className="flex justify-between px-4 pt-2 border-t border-[#E7EAF0]">
          {points.filter((_, idx) => idx % 2 === 0).map((p, i) => (
            <span key={i} className="text-[10px] font-semibold text-slate-400">{p.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render District Bar Chart
  const renderDistrictBarChart = () => {
    // Show top 6 districts from filtered list
    const topDistricts = districts.slice(0, 6);
    if (topDistricts.length === 0) return <EmptyState type="analytics" title="No District Data" message="No district data available." compact={true} />;

    const maxVal = Math.max(...topDistricts.map(d => d.count), 5);

    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">District Incident Counts</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Volume</span>
        </div>

        <div className="flex-1 flex items-end justify-between gap-4 h-40 pt-4 px-4">
          {topDistricts.map((d, i) => {
            const percent = (d.count / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                {/* Count tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] rounded-lg px-2 py-1 mb-2 shadow-md -translate-y-1">
                  <span className="text-[10px] font-bold text-white">{d.count}</span>
                </div>
                
                {/* Bar */}
                <div className="w-full bg-[#F7F8FA] rounded-t-xl overflow-hidden h-28 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percent}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full bg-[#1E3A8A] hover:bg-[#0F172A] rounded-t-xl transition-colors duration-200 shadow-sm"
                  />
                </div>

                {/* Label */}
                <span className="text-[10px] font-bold text-slate-500 mt-3 truncate w-full text-center" title={d.district}>
                  {d.district.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Yearly Summary Bar Chart
  const renderYearlySummary = () => {
    const data = trends.yearly || [];
    if (data.length === 0) return <EmptyState type="analytics" title="No Yearly Trends" message="No yearly trend data available." compact={true} />;

    const maxVal = Math.max(...data.map(y => y.count), 5);

    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Year-over-Year Summary</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Timeline</span>
        </div>

        <div className="flex-1 flex items-end justify-between gap-6 h-40 pt-4 px-4">
          {data.map((y, i) => {
            const percent = (y.count / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                {/* Count tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] rounded-lg px-2 py-1 mb-2 shadow-md -translate-y-1">
                  <span className="text-[10px] font-bold text-white">{y.count}</span>
                </div>
                
                {/* Bar */}
                <div className="w-full bg-[#F7F8FA] rounded-t-xl overflow-hidden h-28 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percent}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full bg-[#0F172A] hover:bg-[#1E3A8A] rounded-t-xl transition-colors duration-200 shadow-sm"
                  />
                </div>

                {/* Label */}
                <span className="text-[11px] font-extrabold text-[#0F172A] mt-3">
                  {y.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (overview) {
    return (
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-7 sm:p-8 shadow-sm h-auto lg:h-[400px] flex flex-col justify-between w-full">
        <div className="flex items-center gap-3 border-b border-[#E7EAF0] pb-5 mb-6 shrink-0">
          <div className="p-2 rounded-xl bg-[#0F172A]/5 text-[#0F172A]">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
            {t('analytics.timeSeriesTitle', 'Temporal Forecasting & Trends')}
          </h3>
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-8 lg:gap-12 min-h-0">
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {renderDailyTrend()}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {renderMonthlyTrend()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
      {/* Chart Block 1: Main Toggleable Trends */}
      <div className="card p-6 lg:p-8 h-auto lg:h-[420px] flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0F172A]/5 text-[#0F172A]">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-extrabold text-[#0F172A] tracking-tight">
              {t('analytics.timeSeriesTitle', 'Incident Forecasting & Trends')}
            </h3>
          </div>
          {/* Tabs */}
          <div className="flex gap-1.5 p-1 bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl">
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'trends' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'}`}
            >
              {t('dashboard.monthlyTrend', 'Temporal Analysis')}
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'distribution' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'}`}
            >
              {t('dashboard.categoryDistribution', 'Category Distribution')}
            </button>
          </div>
        </div>

        {activeTab === 'trends' ? (
          <div className="flex-1 flex flex-col gap-8">
            {renderDailyTrend()}
            {renderMonthlyTrend()}
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-8 px-4">
            {/* Donut SVG */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              {totalCategoryCases === 0 ? (
                <div className="text-center text-slate-500 text-xs">{t('common.noRecordsFound', 'No Cases')}</div>
              ) : (
                <>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F7F8FA" strokeWidth="4" />
                    {donutSegments.map((seg, i) => (
                      <motion.circle
                        key={i}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="4"
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 100` }}
                        animate={{ strokeDasharray: seg.strokeDasharray }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    ))}
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-[#0F172A]">{totalCategoryCases}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                      {t('dashboard.totalFirs', 'Total FIRs')}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Donut Legend */}
            <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto no-scrollbar pt-2">
              {donutSegments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between text-[12px] p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: seg.color }} />
                    <span className="font-bold text-[#0F172A] truncate max-w-36">{seg.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-500">{seg.count}</span>
                    <span className="font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded-full">{seg.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Block 2: Jurisdictional and Temporal Comparisons */}
      <div className="card p-6 lg:p-8 h-auto lg:h-[420px] flex flex-col justify-between">
        <div className="flex items-center gap-3 border-b border-[#E7EAF0] pb-5 mb-6">
          <div className="p-2 rounded-xl bg-[#0F172A]/5 text-[#0F172A]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="text-[15px] font-extrabold text-[#0F172A] tracking-tight">
            {t('district.jurisdiction', 'Jurisdiction & Timeline')}
          </h3>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          {renderDistrictBarChart()}
          {renderYearlySummary()}
        </div>
      </div>
    </div>
  );
}
