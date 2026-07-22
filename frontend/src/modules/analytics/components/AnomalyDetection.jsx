import React from 'react';
import { Activity, AlertTriangle, ScatterChart } from 'lucide-react';

export default function AnomalyDetection() {
  const anomalies = [
    { id: 1, loc: 'Hubballi North', metric: 'Vehicle Theft', deviation: '+340%', time: 'Last 48h', status: 'Investigating' },
    { id: 2, loc: 'Mangaluru Port', metric: 'Narcotics', deviation: '+180%', time: 'Last 72h', status: 'Unassigned' },
    { id: 3, loc: 'Bengaluru Tech Park', metric: 'Cyber Fraud', deviation: '+210%', time: 'Last 7 days', status: 'Active Task Force' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Automated Anomaly Detection</h2>
          <p className="text-sm text-slate-400">Machine learning models identifying statistical outliers in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ScatterChart className="w-5 h-5 text-primary" /> Isolation Forest Output
          </h3>
          <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500">
            <Activity className="w-12 h-12 mb-3 opacity-50 text-primary" />
            <p className="text-sm font-medium">Scatter Plot Matrix</p>
            <p className="text-xs mt-1 opacity-70">Anomalous nodes highlighted in red</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Detected Spikes
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {anomalies.map(a => (
              <div key={a.id} className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{a.loc}</h4>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">{a.deviation}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{a.metric} • {a.time}</span>
                  <span className="text-primary font-medium">{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
