import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function NetworkToolbar() {
  return (
    <div className="flex items-center gap-2 font-mono text-[9px] bg-slate-950/40 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-400 select-none">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-450" />
      <span>SOCIOCENTRIC NETWORK ACTIVE</span>
    </div>
  );
}
