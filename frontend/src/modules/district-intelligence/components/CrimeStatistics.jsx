import React from 'react';
import { AlertCircle, CheckCircle, Clock, FileWarning } from 'lucide-react';

const stats = [
  { label: 'Total Cases (YTD)', value: '14,289', icon: FileWarning, color: 'text-blue-500' },
  { label: 'Active Investigations', value: '3,492', icon: Clock, color: 'text-amber-500' },
  { label: 'Resolved Cases', value: '10,797', icon: CheckCircle, color: 'text-emerald-500' },
  { label: 'Unregistered Incidents', value: '142', icon: AlertCircle, color: 'text-red-500' },
];

export default function CrimeStatistics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className={`p-3 bg-slate-800/50 rounded-lg shrink-0 ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
            <h4 className="text-2xl font-bold text-white">{stat.value}</h4>
          </div>
        </div>
      ))}
    </div>
  );
}
