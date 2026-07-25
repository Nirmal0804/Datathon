import React from 'react';
import { ShieldAlert, Ban } from 'lucide-react';

export default function RiskScoreCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between hover:shadow-elevation-2 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">AI Risk Score</h3>
        <ShieldAlert className="w-5 h-5 text-amber-500" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
        <Ban className="w-12 h-12 text-amber-500/60 mb-4" />
        <p className="text-sm font-medium text-slate-300 mb-2">
          District-level AI risk scoring requires a trained ML model artifact
          (<span className="font-mono text-amber-400">BLOCKED_ML</span>).
          Risk scores displayed here are not authoritative.
        </p>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Model artifact not yet delivered.
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Ban className="w-4 h-4" />
          <span>No risk score available until a valid model artifact is supplied.</span>
        </div>
      </div>
    </div>
  );
}
