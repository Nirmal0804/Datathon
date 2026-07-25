import React from 'react';
import { Settings, AlertTriangle } from 'lucide-react';

export default function AdminConfiguration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">System Configuration</h2>
          <p className="text-2xs text-slate-400 mt-0.5 font-sans font-medium">Fine-tune system constants, API throttling indices, and automatic database schedules.</p>
        </div>
      </div>

      <div className="card p-8 flex flex-col items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-4" />
        <p className="text-sm text-slate-300 text-center max-w-md">
          System configuration persistence requires BLOCKED_API_CONTRACT backend endpoint
        </p>
      </div>
    </div>
  );
}
