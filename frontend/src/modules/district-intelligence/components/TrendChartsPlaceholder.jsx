import React from 'react';
import { LineChart, BarChart } from 'lucide-react';

export default function TrendChartsPlaceholder() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-80 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Crime Trend Analysis</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-slate-800 text-xs font-medium text-white rounded">Weekly</button>
          <button className="px-3 py-1 bg-transparent text-xs font-medium text-slate-400 hover:text-white rounded">Monthly</button>
        </div>
      </div>
      <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500">
        <LineChart className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm font-medium">Time-Series Trend Visualization</p>
        <p className="text-xs mt-1 opacity-70">X: Months | Y: Crime Volume by Category</p>
      </div>
    </div>
  );
}
