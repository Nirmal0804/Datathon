import React from 'react';
import { LineChart, BarChart2 } from 'lucide-react';

export default function ChartsPlaceholder() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-80 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4">Statewide Crime Trends</h3>
        <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500">
          <LineChart className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm font-medium">Line Chart Visualization (Recharts/Chart.js)</p>
          <p className="text-xs mt-1 opacity-70">X: Time | Y: Incident Volume</p>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-80 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4">District Distribution</h3>
        <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500">
          <BarChart2 className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm font-medium">Bar Chart Visualization (Recharts/Chart.js)</p>
          <p className="text-xs mt-1 opacity-70">X: District | Y: Case Count</p>
        </div>
      </div>
    </div>
  );
}
