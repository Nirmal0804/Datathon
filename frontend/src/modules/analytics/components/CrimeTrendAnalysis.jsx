import React from 'react';
import { LineChart, BarChart2, TrendingUp, CalendarDays } from 'lucide-react';

export default function CrimeTrendAnalysis() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Historical Crime Trends</h2>
          <p className="text-sm text-slate-400">Long-term volume analysis and seasonal pattern recognition.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-800 border border-slate-700 rounded-md py-1.5 px-3 text-sm text-white outline-none">
            <option>Last 12 Months</option>
            <option>Last 3 Years</option>
            <option>Last 5 Years</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'YoY Growth', value: '-3.2%', icon: TrendingUp, positive: true },
          { label: 'Highest Volume', value: 'October', icon: CalendarDays, positive: false },
          { label: 'Most Common', value: 'Property', icon: BarChart2, positive: false },
          { label: 'Clearance Trend', value: '+1.5%', icon: TrendingUp, positive: true },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className={`text-xl font-bold ${kpi.positive ? 'text-emerald-500' : 'text-white'}`}>{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-96 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4">Multi-Year Volume Comparison</h3>
        <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500">
          <LineChart className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">Multi-Series Line Chart Visualization</p>
          <p className="text-xs mt-1 opacity-70">Compare 2021, 2022, and 2023 monthly data side-by-side</p>
        </div>
      </div>
    </div>
  );
}
