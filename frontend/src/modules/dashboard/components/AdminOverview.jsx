import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, Cpu, Database, Settings, Activity, Lock,
  Globe, AlertTriangle
} from 'lucide-react';
import { get } from '../../../api/client';

const kpiCards = [
  { title: 'Active System Users', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { title: 'Precinct Stations Linked', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { title: 'System Health Factor', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { title: 'API Gateway Status', icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500/10' },
];

export default function AdminOverview({ onNavigate }) {
  const [healthData, setHealthData] = useState(null);
  const [healthError, setHealthError] = useState(null);

  useEffect(() => {
    get('/health')
      .then(setHealthData)
      .catch(() => setHealthError('Health endpoint unreachable'));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.15)]">
            <Settings className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                State Tech HQ
              </span>
              <span className="inline-flex items-center gap-1 text-2xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                Root Access
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              System Administration
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform status monitoring, user management roster, and diagnostics controls.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse-soft" />
          <span>Server Version: v4.12.2-stable</span>
        </div>
      </div>

      {/* KPI Cards — restricted */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700/80 transition-all duration-200 cursor-default group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.title}</p>
                <p className="text-2xl font-bold text-white mt-1.5 font-mono">&mdash;</p>
              </div>
              <div className={`p-2.5 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-slate-500 text-3xs mt-3.5 pt-2 border-t border-slate-800/40">Requires BLOCKED_API_CONTRACT user management API</p>
          </div>
        ))}
      </div>

      {/* Row 2: Database Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Resource Utilization &amp; Database Latency
              </h3>
              <span className="text-4xs font-mono font-bold text-slate-500">Live Diagnostics</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
              <p className="text-xs text-slate-400">Requires BLOCKED_API_CONTRACT backend endpoint</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="border-b border-slate-800/60 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Database &amp; Server Status
              </h3>
            </div>

            <div className="py-1 space-y-2.5 text-2xs">
              {healthError ? (
                <div className="flex items-center gap-2 p-3 rounded bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-300">{healthError}</span>
                </div>
              ) : healthData ? (
                <>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-850/60">
                    <span className="font-medium text-slate-300">API Health</span>
                    <span className="badge badge-success px-2 py-0.5 rounded text-4xs uppercase tracking-wider font-bold">Healthy</span>
                  </div>
                  {healthData.version && (
                    <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-850/60">
                      <span className="font-medium text-slate-300">API Version</span>
                      <span className="font-mono text-slate-400 text-4xs">{healthData.version}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center p-3">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-slate-500 text-xs">Checking health...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Audit Logs & Recent Logins — blocked */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                Security Audit Logs
              </h3>
              <button
                onClick={() => onNavigate('audit_logs')}
                className="text-4xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                Audit Manager &rarr;
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-10">
              <AlertTriangle className="w-7 h-7 text-amber-400 mb-3" />
              <p className="text-xs text-slate-400 text-center">Audit log data requires BLOCKED_API_CONTRACT backend endpoint</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-2">
              <h3 className="text-sm font-semibold text-white">Recent Admin/User Logins</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-10">
              <AlertTriangle className="w-7 h-7 text-amber-400 mb-3" />
              <p className="text-xs text-slate-400 text-center">User session data requires BLOCKED_API_CONTRACT backend endpoint</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
