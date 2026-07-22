import React from 'react';
import { Target, BarChart } from 'lucide-react';

export default function PredictiveRisk() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Predictive Risk Modeling</h2>
          <p className="text-sm text-slate-400">Forecasting future crime volumes using historical data and environmental factors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-center">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Statewide Threat Level</h3>
            <div className="w-32 h-32 mx-auto rounded-full border-8 border-slate-800 flex items-center justify-center border-t-amber-500 border-r-amber-500 transform rotate-45 mb-4">
              <div className="transform -rotate-45 text-3xl font-bold text-amber-500">62%</div>
            </div>
            <p className="text-sm text-slate-300">Elevated risk predicted for upcoming festival weekend.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Top At-Risk Districts</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-white font-medium">Bengaluru South</span><span className="text-red-400 font-bold">89%</span></div>
                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full" style={{width: '89%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-white font-medium">Mysuru Central</span><span className="text-amber-400 font-bold">74%</span></div>
                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{width: '74%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-white font-medium">Belagavi</span><span className="text-amber-400 font-bold">68%</span></div>
                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{width: '68%'}}></div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-emerald-500" /> Next 30 Days Forecast
          </h3>
          <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500">
            <Target className="w-12 h-12 mb-3 opacity-50 text-emerald-500" />
            <p className="text-sm font-medium">Prophet / ARIMA Forecast Visualization</p>
            <p className="text-xs mt-1 opacity-70">Showing confidence intervals (bounds) and predicted volume.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
