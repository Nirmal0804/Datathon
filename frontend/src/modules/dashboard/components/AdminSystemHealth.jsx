import React from 'react';
import { Activity, Cpu, Database, HardDrive, ShieldCheck } from 'lucide-react';

export default function AdminSystemHealth() {
  const diagnosticItems = [
    { title: 'Core Processor Load', percentage: 42, details: '8-Core Xeon @ 3.4GHz', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'RAM Memory Allocation', percentage: 61, details: '39GB allocated of 64GB', icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Disk Usage Capacity', percentage: 38, details: '342GB free of 900GB SSD', icon: Database, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'API Connection Latency', percentage: 12, details: 'Optimal Gateway Load factor', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Platform Diagnostic Suite</h2>
          <p className="text-2xs text-slate-400 mt-0.5 font-sans">Real-time resource utilization, hardware monitors, and database transaction health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diagnosticItems.map((item, idx) => (
          <div key={idx} className="card p-5 flex flex-col justify-between h-48">
            <div className="flex items-start justify-between border-b border-slate-800/60 pb-3 mb-2 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-4xs text-slate-500 mt-0.5">{item.details}</p>
                </div>
              </div>
              <span className="text-sm font-mono font-bold text-slate-200">{item.percentage}%</span>
            </div>

            {/* Load bar visualizer */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.percentage > 80 ? 'bg-rose-500' : item.percentage > 50 ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-4xs text-slate-500 font-mono mt-3">
                <span>0% min load</span>
                <span>Threshold alarm: 85%</span>
                <span>100% max</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
