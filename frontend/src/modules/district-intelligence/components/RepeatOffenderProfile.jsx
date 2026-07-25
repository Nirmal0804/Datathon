import React from 'react';
import { ArrowLeft, ShieldAlert, Lock } from 'lucide-react';

const BLOCKED_ITEMS = [
  { label: 'Repeat Offender Dossier', code: 'BLOCKED_API_CONTRACT' },
  { label: 'Arrest History Detail', code: 'BLOCKED_API_CONTRACT' },
  { label: 'Known Associates Network', code: 'BLOCKED_API_CONTRACT' },
  { label: 'AI Risk Assessment', code: 'BLOCKED_API_CONTRACT' },
];

export default function RepeatOffenderProfile({ offenderName, onBack }) {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <button
          onClick={onBack}
          className="btn-secondary btn-sm gap-2 cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back to District Intelligence</span>
        </button>
      </div>

      {/* Title Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <ShieldAlert className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {offenderName || 'Unknown Offender'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-widest">
              Dossier access restricted
            </p>
          </div>
        </div>
      </div>

      {/* Blocked State Message */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
        <Lock className="w-10 h-10 text-amber-500/70 mx-auto" />
        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Person-level offender dossier data is not available through the current API contract.
          This view requires <span className="font-mono text-amber-400 font-semibold">BLOCKED_PRIVACY</span> /{' '}
          <span className="font-mono text-amber-400 font-semibold">BLOCKED_API_CONTRACT</span> authorization.
        </p>
      </div>

      {/* Blocked Items List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
          Restricted Data Modules
        </h3>
        {BLOCKED_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-300 font-medium">{item.label}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
              {item.code}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
