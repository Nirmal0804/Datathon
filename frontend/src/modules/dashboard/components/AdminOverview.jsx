import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShieldAlert, Cpu, Database, Settings, Activity, Lock,
  RefreshCw, CheckCircle, Clock, AlertTriangle, Play, Check, Trash2, Globe
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import kspBadge from '../../../assets/ksp-badge.png';
import GlobalKPICard from '../../../components/shared/ui/GlobalKPICard';

export default function AdminOverview({ onNavigate }) {
  const { addToast } = useToast();

  // Local Admin Config States
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rateLimit, setRateLimit] = useState(100); // req/min
  const [activeUsers, setActiveUsers] = useState(142);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Diagnostic Stats
  const systemKPIs = [
    { title: 'Active System Users', value: activeUsers, note: 'Simultaneous connections', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Precinct Stations Linked', value: 54, note: 'All districts connected', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'System Health Factor', value: '99.98%', note: 'Uptime (last 30 days)', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'API Gateway Status', value: 'Optimal', note: 'Latency: 12ms avg', icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  ];

  const recentLogins = [
    { user: 'Insp. Patil', role: 'Field Officer', station: 'Cubbon Park PS', ip: '10.14.82.11', time: 'Just now' },
    { user: 'Analyst Rao', role: 'Intelligence Analyst', station: 'Command HQ', ip: '10.12.4.92', time: '4m ago' },
    { user: 'Admin Gowda', role: 'Administrator', station: 'State Tech HQ', ip: '10.10.1.1', time: '12m ago' },
    { user: 'Insp. Kumar', role: 'Field Officer', station: 'Indiranagar PS', ip: '10.14.88.24', time: '21m ago' },
  ];

  const auditLogs = [
    { id: 'AUD-8822', user: 'Insp. Patil', action: 'Update Case Status', target: 'FIR-2026-1011', time: '3m ago', status: 'Success' },
    { id: 'AUD-8821', user: 'Analyst Rao', action: 'Generate Intelligence Report', target: 'BOLO-Report-26', time: '11m ago', status: 'Success' },
    { id: 'AUD-8820', user: 'System Kernel', action: 'Flush Redis Cache', target: 'Memory Heap', time: '30m ago', status: 'Success' },
    { id: 'AUD-8819', user: 'Admin Gowda', action: 'Modify Access Permissions', target: 'Analyst Roster Group', time: '1h ago', status: 'Warning' },
  ];

  const handleMaintenanceToggle = () => {
    setMaintenanceMode(prev => {
      const newVal = !prev;
      addToast({
        title: 'System Alert',
        message: `Maintenance Mode has been ${newVal ? 'ENABLED' : 'DISABLED'}.`,
        type: newVal ? 'warning' : 'success'
      });
      return newVal;
    });
  };

  const handleFlushCache = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast({
        title: 'Cache Flushed',
        message: 'All system memory caches have been successfully purged.',
        type: 'success'
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 p-6 bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm transition-all duration-200 ease-in-out">
        {/* Left Section */}
        <div className="flex items-center gap-5">
          {/* Karnataka Police Official Badge */}
          <img src={kspBadge} alt="Karnataka Police Badge" className="h-[72px] w-auto object-contain shrink-0 drop-shadow-md" />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-[#0F172A] tracking-widest uppercase bg-slate-100 px-2 py-0.5 rounded-full border border-[#E7EAF0]">
                State Tech HQ
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold uppercase tracking-wide">
                Root Access
              </span>
            </div>
            <h1 className="text-[34px] font-bold text-[#0F172A] leading-none tracking-tight mt-1.5">
              System Administration
            </h1>
            <p className="text-[15px] font-medium text-[#64748B] mt-2 leading-none">
              Platform status monitoring, user management roster, and diagnostics controls.
            </p>
          </div>
        </div>

        {/* Right Section: Compact Status Chips */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-4 h-10 rounded-[14px] border border-[#E5E7EB] shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-default">
            <Activity className="w-5 h-5 text-[#15803D] animate-pulse" />
            <span className="text-[13px] font-bold text-[#0F172A]">Server Version: v4.12.2-stable</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemKPIs.map((kpi, i) => {
          let type = 'info';
          if (kpi.title.includes('Health')) type = 'success';
          if (kpi.title.includes('Linked')) type = 'warning';
          
          return (
            <GlobalKPICard
              key={i}
              delay={i * 0.05}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              type={type}
              description={kpi.note}
            />
          );
        })}
      </div>

      {/* Row 2: Performance Charts & Recent Logins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Diagnostics (CPU & Database performance) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-[320px] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-2 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Resource Utilization & Database Latency
              </h3>
              <span className="text-4xs font-mono font-bold text-slate-500">Live Diagnostics</span>
            </div>

            {/* Diagnostic Visualization SVGs */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 items-center pt-2">
              {/* CPU Chart */}
              <div className="flex-1 w-full flex flex-col justify-between h-full">
                <div className="flex justify-between text-2xs mb-1 font-semibold text-slate-400">
                  <span>Server Core Load (CPU/Memory)</span>
                  <span className="font-mono text-emerald-400">42% CPU / 61% RAM</span>
                </div>
                <div className="relative w-full h-32 bg-slate-950/40 rounded border border-slate-850 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
                    <line x1="0" y1="50" x2="240" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                    <path
                      d="M0,80 L30,75 L60,85 L90,60 L120,40 L150,55 L180,45 L210,38 L240,42"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Database performance Chart */}
              <div className="flex-1 w-full flex flex-col justify-between h-full">
                <div className="flex justify-between text-2xs mb-1 font-semibold text-slate-400">
                  <span>PostgreSQL API Queries / Latency</span>
                  <span className="font-mono text-indigo-400">12ms avg delay</span>
                </div>
                <div className="relative w-full h-32 bg-slate-950/40 rounded border border-slate-850 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
                    <line x1="0" y1="70" x2="240" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
                    <path
                      d="M0,75 L30,78 L60,72 L90,70 L120,68 L150,85 L180,74 L210,77 L240,78"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database Status & Configuration Toggles */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-[320px] flex flex-col justify-between">
            <div className="border-b border-slate-800/60 pb-3 mb-2 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Database & Server Status
              </h3>
            </div>
            
            <div className="flex-1 py-1 space-y-2.5 text-2xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-850/60">
                <span className="font-medium text-slate-300">PostgreSQL Status</span>
                <span className="badge badge-success px-2 py-0.5 rounded text-4xs uppercase tracking-wider font-bold">Online</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-850/60">
                <span className="font-medium text-slate-300">GIS Location Tile Server</span>
                <span className="badge badge-success px-2 py-0.5 rounded text-4xs uppercase tracking-wider font-bold">Online</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-850/60">
                <span className="font-medium text-slate-300">Redis Cache Instance</span>
                <span className="badge badge-success px-2 py-0.5 rounded text-4xs uppercase tracking-wider font-bold">Online</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-850/60">
                <span className="font-medium text-slate-300">ML Forecast Engine</span>
                <span className="badge badge-success px-2 py-0.5 rounded text-4xs uppercase tracking-wider font-bold">Online</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2 shrink-0">
              <button 
                onClick={handleFlushCache} 
                disabled={isRefreshing}
                className="btn-secondary btn-sm flex-1 gap-2 border border-slate-850 text-slate-300 hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Flush Cache</span>
              </button>
              <button 
                onClick={handleMaintenanceToggle}
                className={`btn-sm flex-1 gap-2 rounded-lg font-medium text-xs transition-colors flex items-center justify-center ${
                  maintenanceMode 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' 
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{maintenanceMode ? 'Locked' : 'Maintenance'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Audit Logs & Recent User Login Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: System Audit Logs (Wide) */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-[320px] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-2 shrink-0">
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

            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
              <table className="w-full text-left" aria-label="System audit log">
                <thead>
                  <tr className="border-b border-slate-800 text-3xs font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Operator</th>
                    <th className="py-2.5 px-3">Action Description</th>
                    <th className="py-2.5 px-3">Target Resource</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-800/40 text-xs text-slate-300">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-500">{log.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{log.user}</td>
                      <td className="py-2.5 px-3 text-slate-400">{log.action}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-3xs">{log.target}</td>
                      <td className="py-2.5 px-3 text-slate-500">{log.time}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`badge ${log.status === 'Success' ? 'badge-success' : 'badge-high'} py-0.5 px-1.5 text-4xs font-bold uppercase`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Login Activity */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-[320px] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-2 shrink-0">
              <h3 className="text-sm font-semibold text-white">Recent Admin/User Logins</h3>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pt-1">
              {recentLogins.map((login, idx) => (
                <div key={idx} className="p-2 bg-slate-950/40 border border-slate-850 rounded text-xs flex justify-between items-center hover:border-slate-800 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-200">{login.user}</p>
                    <p className="text-slate-500 text-4xs">{login.role} • {login.station}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-slate-400 text-3xs">{login.ip}</p>
                    <p className="text-slate-500 text-4xs font-mono">{login.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
