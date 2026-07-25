import React from 'react';
import { ShieldAlert, Brain } from 'lucide-react';

export default function AnomalyDetection({ timeFilter }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-full justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Automatic Intelligence Alerts</h3>
            <p className="text-4xs text-slate-400 mt-0.5 font-sans">AI outlier models detecting precinct threat increases in real-time.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
          <Brain className="w-10 h-10 text-slate-600" />
          <h4 className="text-xs font-bold text-white">ML Anomaly Detection Unavailable</h4>
          <p className="text-4xs text-slate-400 max-w-xs">
            Real-time intelligence alerts require anomaly detection ML model artifacts (BLOCKED_ML).
            Deploy trained model to enable automatic threat detection.
          </p>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded uppercase">
            BLOCKED_ML — Model Artifact Required
          </span>
        </div>
      </div>
    </div>
  );
}
