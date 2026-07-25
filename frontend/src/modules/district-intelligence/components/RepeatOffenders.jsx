import React from 'react';
import { Ban, ShieldOff } from 'lucide-react';

export default function RepeatOffenders() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-lg font-semibold text-white">Repeat Offenders</h3>
          <p className="text-xs text-slate-400 mt-0.5">District surveillance roster categorized by prior charges and threat risk rates.</p>
        </div>
        <span className="text-4xs font-mono font-bold bg-slate-950 border border-slate-850 text-amber-400 px-2 py-0.5 rounded uppercase">
          Blocked
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-10 text-center">
        <ShieldOff className="w-12 h-12 text-amber-500/50 mb-4" />
        <p className="text-sm font-medium text-slate-300 max-w-md">
          Repeat offender intelligence requires person-level dossier data
          (<span className="font-mono text-amber-400">BLOCKED_PRIVACY</span> / <span className="font-mono text-amber-400">BLOCKED_API_CONTRACT</span>).
        </p>
        <p className="text-xs text-slate-500 mt-2 max-w-md">
          No authorized API endpoint is available for individual offender profiling.
        </p>
      </div>
    </div>
  );
}
