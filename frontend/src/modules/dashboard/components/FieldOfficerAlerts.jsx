import React from 'react';
import RecentAlerts from './RecentAlerts';
import { MOCK_ALERTS } from './mockData';
import { Bell } from 'lucide-react';

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
      
      {/* Dynamic Alerts List using the styled Alerts component */}
      <RecentAlerts data={MOCK_ALERTS} />
    </div>
  );
}
