import React from 'react';
import { Bell, ShieldAlert } from 'lucide-react';

export default function FieldOfficerAlerts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Operations Alerts Feed</h2>
          <p className="text-2xs text-slate-400 mt-0.5"> Precinct bulletins and local BOLOs (Be On the Look Out).</p>
        </div>
      </div>

      {/* BLOCKED: No authoritative alert system available */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center gap-4 h-[280px] text-center">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8 text-rose-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">Alert Feed Unavailable</p>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">
            Alert feed requires BLOCKED_API_CONTRACT backend endpoint. No authoritative alert system is available for the Karnataka Police platform.
          </p>
        </div>
      </div>
    </div>
  );
}
