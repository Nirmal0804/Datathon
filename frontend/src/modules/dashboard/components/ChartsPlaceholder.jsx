import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, PieChart, Activity, Calendar, ShieldAlert } from 'lucide-react';

export default function ChartsPlaceholder({ trendsData, categoryData, districtData, overview = false }) {
  const [activeTab, setActiveTab] = useState('trends'); // 'trends' or 'distribution'

  // Safety checks
  const categories = categoryData || [];
  const districts = districtData || [];
  const trends = trendsData || { daily: [], monthly: [], yearly: [] };

  // Calculate total cases for category distribution
  const totalCategoryCases = categories.reduce((sum, c) => sum + c.count, 0);

  // Colors mapping for categories
  const categoryColors = {
    'Cybercrime': '#4f46e5', // indigo
    'Property Theft': '#3b82f6', // blue
    'Violent Crime': '#ef4444', // red
    'Financial Fraud': '#f59e0b', // orange
    'Narcotics': '#10b981', // green
    'Crime Against Women': '#ec4899', // pink
  };
  const fallbackColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

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
    if (data.length === 0) return <div className="h-40 flex items-center justify-center text-slate-500">No data available</div>;

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
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Daily Trend (Last 10 Reporting Days)</span>
          <span className="text-2xs font-mono text-slate-500">Total volume logged</span>
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
                  stroke="#1e293b"
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
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]"
            />

            {/* Interactive Data Dots */}
            {points.map((p, i) => (
              <g key={i} className="group/dot cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#020617"
                  stroke="#4f46e5"
                  strokeWidth="2"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  fill="#4f46e5"
                  className="opacity-0 group-hover/dot:opacity-20 transition-opacity"
                />
                {/* Tooltip */}
                <foreignObject x={p.x - 30} y={p.y - 32} width="60" height="28" className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center shadow-lg">
                    <p className="font-mono text-3xs font-bold text-white leading-tight">{p.count} FIRs</p>
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>
        {/* X Axis Labels */}
        <div className="flex justify-between px-2 pt-1 border-t border-slate-800/40">
          {points.filter((_, idx) => idx % 2 === 0).map((p, i) => (
            <span key={i} className="text-3xs font-mono text-slate-500">{p.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render Monthly Crime Trend SVG
  const renderMonthlyTrend = () => {
    const data = trends.monthly || [];
    if (data.length === 0) return <div className="h-40 flex items-center justify-center text-slate-500">No data available</div>;

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
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Monthly Incident Load (Area Curve)</span>
          <span className="text-2xs font-mono text-slate-500">Yearly progression</span>
        </div>
        <div className="relative w-full h-40">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
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
                  stroke="#1e293b"
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
              stroke="#3b82f6"
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
                  fill="#020617"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
                {/* Tooltip */}
                <foreignObject x={p.x - 30} y={p.y - 32} width="60" height="28" className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center shadow-lg">
                    <p className="font-mono text-3xs font-bold text-white leading-tight">{p.count} Cases</p>
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>
        {/* X Axis Labels */}
        <div className="flex justify-between px-1 pt-1 border-t border-slate-800/40">
          {points.filter((_, idx) => idx % 2 === 0).map((p, i) => (
            <span key={i} className="text-3xs font-mono text-slate-500">{p.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render District Bar Chart
  const renderDistrictBarChart = () => {
    // Show top 6 districts from filtered list
    const topDistricts = districts.slice(0, 6);
    if (topDistricts.length === 0) return <div className="h-40 flex items-center justify-center text-slate-500">No data available</div>;

    const maxVal = Math.max(...topDistricts.map(d => d.count), 5);

    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">District Incident Counts</span>
          <span className="text-2xs font-mono text-slate-500">Case Volume</span>
        </div>

        <div className="flex-1 flex items-end justify-between gap-4 h-40 pt-4 px-2">
          {topDistricts.map((d, i) => {
            const percent = (d.count / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                {/* Count tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 rounded px-1 py-0.5 mb-1.5 shadow-md -translate-y-1">
                  <span className="text-3xs font-mono font-bold text-white">{d.count}</span>
                </div>
                
                {/* Bar */}
                <div className="w-full bg-slate-800 rounded-t-md overflow-hidden h-28 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percent}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full bg-primary/75 hover:bg-primary rounded-t-sm transition-colors duration-150 drop-shadow-[0_-1px_3px_rgba(79,70,229,0.3)]"
                  />
                </div>

                {/* Label */}
                <span className="text-3xs font-medium text-slate-500 mt-2 truncate w-full text-center" title={d.district}>
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
    if (data.length === 0) return <div className="h-40 flex items-center justify-center text-slate-500">No data available</div>;

    const maxVal = Math.max(...data.map(y => y.count), 5);

    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Year-over-Year Summary (5-Yr)</span>
          <span className="text-2xs font-mono text-slate-500">Timeline comparisons</span>
        </div>

        <div className="flex-1 flex items-end justify-between gap-6 h-40 pt-4 px-4">
          {data.map((y, i) => {
            const percent = (y.count / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                {/* Count tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 rounded px-1 py-0.5 mb-1.5 shadow-md">
                  <span className="text-3xs font-mono font-bold text-white">{y.count}</span>
                </div>
                
                {/* Bar */}
                <div className="w-full bg-slate-800 rounded-t-md overflow-hidden h-28 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percent}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full bg-blue-500/70 hover:bg-blue-500 rounded-t-sm transition-colors duration-150"
                  />
                </div>

                {/* Label */}
                <span className="text-3xs font-mono font-semibold text-slate-400 mt-2">
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-[340px] flex flex-col justify-between w-full">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-2 shrink-0">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Incident Temporal Forecasting & Trends</h3>
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Chart Block 1: Main Toggleable Trends */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-96 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Incident Forecasting & Trends</h3>
          </div>
          {/* Tabs */}
          <div className="flex gap-1.5 p-1 bg-slate-800/80 rounded-lg">
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1 text-2xs font-semibold rounded-md transition-colors ${activeTab === 'trends' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Temporal Analysis
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-3 py-1 text-2xs font-semibold rounded-md transition-colors ${activeTab === 'distribution' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Category Distribution
            </button>
          </div>
        </div>

        {activeTab === 'trends' ? (
          <div className="flex-1 flex flex-col gap-6">
            {renderDailyTrend()}
            {renderMonthlyTrend()}
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
            {/* Donut SVG */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              {totalCategoryCases === 0 ? (
                <div className="text-center text-slate-500 text-xs">No Cases</div>
              ) : (
                <>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="4" />
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
                        initial={{ strokeDasharray: `0 100` }}
                        animate={{ strokeDasharray: seg.strokeDasharray }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    ))}
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-bold text-white font-mono">{totalCategoryCases}</span>
                    <span className="text-4xs text-slate-500 uppercase tracking-widest font-semibold">Total FIRs</span>
                  </div>
                </>
              )}
            </div>

            {/* Donut Legend */}
            <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {donutSegments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-800/30 hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="font-medium text-slate-300 truncate max-w-36">{seg.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">{seg.count}</span>
                    <span className="font-mono font-bold text-slate-500">{seg.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Block 2: Jurisdictional and Temporal Comparisons */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-96 flex flex-col justify-between">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4">
          <BarChart2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white font-sans">Jurisdiction & Timeline Comparison</h3>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {renderDistrictBarChart()}
          {renderYearlySummary()}
        </div>
      </div>
    </div>
  );
}
