import React from 'react';
import { Brain, Target } from 'lucide-react';

export default function PredictiveRisk({ timeFilter }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400 animate-pulse-soft" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Crime Forecast</h3>
            <p className="text-4xs text-slate-400 mt-0.5">Predictive forecasting models simulating seasonal offsets and boundaries.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
        <Target className="w-12 h-12 text-slate-600" />
        <h4 className="text-sm font-bold text-white">Predictive Forecasting Unavailable</h4>
        <p className="text-xs text-slate-400 max-w-md">
          Crime volume forecasting requires a trained time-series prediction model (Prophet/ARIMA).
          The ML model artifact has not been supplied. Deploy the trained model to enable predictive risk scoring.
        </p>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1 rounded uppercase">
          BLOCKED_ML — Forecast Model Required
        </span>
      </div>
    </div>
  );
}
