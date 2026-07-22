import React from 'react';
import { PieChart } from 'lucide-react';

export default function CategoryDistribution() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
      <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500">
        <PieChart className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm font-medium">Donut Chart Visualization</p>
        <p className="text-xs mt-1 opacity-70">Property vs Violent vs Cyber vs Narcotics</p>
      </div>
    </div>
  );
}
