import React from 'react';
import { Database, AlertTriangle, ShieldAlert } from 'lucide-react';

const BLOCKED_DEPENDENCIES = [
  { label: 'District Socio-Economic Indicators Dataset', status: 'BLOCKED_REQUIREMENTS' },
  { label: 'Crime-Outcome Correlation Matrix', status: 'BLOCKED_REQUIREMENTS' },
  { label: 'Pearson Correlation Computation Pipeline', status: 'BLOCKED_REQUIREMENTS' },
];

export default function SocioEconomicCorrelation({ role }) {
  if (role !== 'analyst') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center shadow-lg">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white uppercase tracking-wider">Access Denied</h3>
        <p className="text-2xs text-slate-400 mt-2">
          This strategic correlation analysis module is restricted to authorized Intelligence Analysts only.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">

      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <span>Socio-Economic Crime Correlation</span>
        </h1>
        <p className="text-2xs text-slate-400 font-sans mt-1">
          Analyze statistical relationships between crime trends and district socio-economic indicators.
        </p>
      </div>

      {/* Blocked State Banner */}
      <div className="bg-red-500/5 border border-red-500/25 rounded-xl p-6 space-y-4 shadow-md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Data Module Blocked</h3>
            <p className="text-3xs text-slate-400 leading-relaxed">
              Socio-economic correlation analysis requires authoritative district-level demographic and economic datasets that have not been supplied. BLOCKED_DATA / BLOCKED_REQUIREMENTS.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-red-500/15">
          {BLOCKED_DEPENDENCIES.map((dep) => (
            <div key={dep.label} className="flex items-center justify-between bg-slate-950/40 rounded-lg px-4 py-2.5 border border-slate-850">
              <span className="text-3xs text-slate-300 font-semibold">{dep.label}</span>
              <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded uppercase">
                {dep.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-3xs text-slate-400 leading-relaxed">
          <strong className="text-white uppercase tracking-wider">Disclaimer:</strong>{' '}
          Correlation indicates statistical association only and does <strong className="text-red-400">NOT imply causation</strong>.
        </p>
      </div>

    </div>
  );
}
