import React from 'react';
import { Clock, CheckCircle, RefreshCw } from 'lucide-react';

const history = [
  { action: 'Generated', report: 'Statewide Monthly Crime Summary', by: 'Analyst J. Doe', time: '2 hours ago', status: 'success' },
  { action: 'Exported PDF', report: 'Bengaluru South District Intelligence', by: 'Insp. R. Kumar', time: '5 hours ago', status: 'success' },
  { action: 'Shared (Secure Link)', report: 'Q3 Hotspot Migration Analysis', by: 'Analyst S. Patil', time: '1 day ago', status: 'success' },
  { action: 'Generation Failed', report: 'Cyber Syndicate Network Map', by: 'System', time: '2 days ago', status: 'error' },
  { action: 'Exported Excel', report: 'Festival Season Risk Model', by: 'DCP M. Gowda', time: '3 days ago', status: 'success' },
];

export default function ReportHistory() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-white">Activity History</h3>
      </div>
      <div className="divide-y divide-slate-800/50">
        {history.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors">
            <div className={`shrink-0 ${item.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
              {item.status === 'success' ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{item.action}</p>
              <p className="text-xs text-slate-500 truncate">{item.report} • by {item.by}</p>
            </div>
            <span className="text-xs text-slate-500 shrink-0 whitespace-nowrap">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
