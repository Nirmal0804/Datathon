import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShieldAlert, Cpu, Database, Settings, Activity, Lock,
  RefreshCw, CheckCircle, Clock, AlertTriangle, Play, Check, Trash2, Globe
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import kspBadge from '../../../assets/ksp-badge.webp';
import LazyImage from '../../../components/ui/LazyImage';
import GlobalKPICard from '../../../components/shared/ui/GlobalKPICard';
import { useTranslation } from '../../../i18n';

export default function AdminOverview({ onNavigate }) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  // Local Admin Config States
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rateLimit, setRateLimit] = useState(100); // req/min
  const [activeUsers, setActiveUsers] = useState(142);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Diagnostic Stats
  const systemKPIs = [
    { title: t('admin.activeUsers', 'Active System Users'), value: activeUsers, note: t('admin.activeConnections', 'Simultaneous connections'), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: t('district.totalStations', 'Precinct Stations Linked'), value: 54, note: t('district.allDistricts', 'All districts connected'), icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: t('admin.systemHealth', 'System Health Factor'), value: '99.98%', note: t('admin.uptime', 'Uptime (last 30 days)'), icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: t('admin.systemStatus', 'API Gateway Status'), value: t('admin.healthy', 'Optimal'), note: 'Latency: 12ms avg', icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500/10' },
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
    <div className="space-y-6">
      {/* Header (Spacious Hero) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 p-7 sm:p-8 bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm transition-all duration-200 ease-in-out">
        {/* Left Section */}
        <div className="flex items-center gap-5">
          {/* Karnataka Police Official Badge */}
          <div className="h-[60px] w-[50px] shrink-0 overflow-hidden flex items-center justify-center">
            <LazyImage
              src={kspBadge}
              alt="Karnataka Police Badge"
              className="h-[60px] w-auto object-contain drop-shadow-sm"
              containerClassName="w-full h-full"
              loading="eager"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
              {t('nav.adminOverview', 'System Administration')}
            </h1>
            <p className="text-xs sm:text-sm font-normal text-[#64748B] mt-1 leading-normal">
              {t('admin.overviewSubtitle', 'Platform status monitoring, user management roster, and diagnostics controls.')}
            </p>
          </div>
        </div>

        {/* Right Section: Compact Status Chips */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2.5 bg-[#F8F9FB] px-4 h-10 rounded-[999px] border border-[#E7ECF3] shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-default">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-[#0F172A]">{t('admin.systemStatus', 'Server Version')}: v4.12.2-stable</span>
          </div>
        </div>
      </div>

      {/* KPI Cards (Compact Proportions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {systemKPIs.map((kpi, i) => {
          let type = 'info';
          if (kpi.title.includes('Health')) type = 'success';
          if (kpi.title.includes('Linked')) type = 'warning';
          
          return (
            <GlobalKPICard
              key={i}
              delay={i * 0.05}
              compact={true}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Diagnostics (CPU & Database performance) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm h-[360px] flex flex-col justify-between hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-4 mb-3 shrink-0">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[12px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                {t('admin.systemHealth', 'Resource Utilization & Database Latency')}
              </h3>
              <span className="text-xs font-mono font-bold text-[#64748B]">{t('admin.active', 'Live Diagnostics')}</span>
            </div>

            {/* Diagnostic Visualization SVGs */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 items-center pt-1">
              {/* CPU Chart */}
              <div className="flex-1 w-full flex flex-col justify-between h-full">
                <div className="flex justify-between text-xs mb-2 font-bold text-[#334155]">
                  <span>{t('admin.cpuUsage', 'Server Core Load (CPU/Memory)')}</span>
                  <span className="font-mono text-emerald-600">42% CPU / 61% RAM</span>
                </div>
                <div className="relative w-full h-36 bg-[#F8F9FB] rounded-[16px] border border-[#E7ECF3] flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
                    <line x1="0" y1="50" x2="240" y2="50" stroke="#E7ECF3" strokeDasharray="3 3" />
                    <path
                      d="M0,80 L30,75 L60,85 L90,60 L120,40 L150,55 L180,45 L210,38 L240,42"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Database performance Chart */}
              <div className="flex-1 w-full flex flex-col justify-between h-full">
                <div className="flex justify-between text-xs mb-2 font-bold text-[#334155]">
                  <span>{t('admin.databaseStatus', 'PostgreSQL API Queries / Latency')}</span>
                  <span className="font-mono text-police-blue">12ms avg delay</span>
                </div>
                <div className="relative w-full h-36 bg-[#F8F9FB] rounded-[16px] border border-[#E7ECF3] flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
                    <line x1="0" y1="70" x2="240" y2="70" stroke="#E7ECF3" strokeDasharray="3 3" />
                    <path
                      d="M0,75 L30,78 L60,72 L90,70 L120,68 L150,85 L180,74 L210,77 L240,78"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database Status & Configuration Toggles */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm h-[360px] flex flex-col justify-between hover:-translate-y-1 transition-all duration-200">
            <div className="border-b border-[#E7ECF3] pb-4 mb-3 shrink-0">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-[#0B1F4D] flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                {t('admin.databaseStatus', 'Database & Server Status')}
              </h3>
            </div>
            
            <div className="flex-1 py-1 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3]">
                <span className="font-bold text-[#334155]">{t('admin.databaseStatus', 'PostgreSQL Status')}</span>
                <span className="badge rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">{t('admin.active', 'Online')}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3]">
                <span className="font-bold text-[#334155]">{t('map.layers', 'GIS Location Tile Server')}</span>
                <span className="badge rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">{t('admin.active', 'Online')}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3]">
                <span className="font-bold text-[#334155]">{t('admin.cache', 'Redis Cache Instance')}</span>
                <span className="badge rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">{t('admin.active', 'Online')}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3]">
                <span className="font-bold text-[#334155]">{t('analytics.predictiveTrendsTitle', 'ML Forecast Engine')}</span>
                <span className="badge rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">{t('admin.active', 'Online')}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-3 shrink-0">
              <button 
                onClick={handleFlushCache} 
                disabled={isRefreshing}
                className="flex-1 gap-2 h-11 rounded-[999px] bg-white border border-[#E7ECF3] hover:bg-[#F8F9FB] hover:border-police-gold text-[#0F172A] font-bold text-xs transition-all duration-200 flex items-center justify-center shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-police-blue ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{t('admin.clearCache', 'Flush Cache')}</span>
              </button>
              <button 
                onClick={handleMaintenanceToggle}
                className={`flex-1 gap-2 h-11 rounded-[999px] font-bold text-xs transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm ${
                  maintenanceMode 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-[#F8F9FB] border border-[#E7ECF3] hover:bg-white hover:border-police-gold text-[#0F172A]'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>{maintenanceMode ? t('admin.locked', 'Locked') : t('admin.maintenanceMode', 'Maintenance')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Audit Logs & Recent User Login Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: System Audit Logs (Wide) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm h-[380px] flex flex-col justify-between hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-4 mb-3 shrink-0">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-[#0B1F4D] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                {t('admin.auditLogs', 'Security Audit Logs')}
              </h3>
              <button
                onClick={() => onNavigate('audit_logs')}
                className="text-xs font-bold text-police-navy hover:text-police-blue hover:underline transition-colors cursor-pointer"
              >
                {t('admin.auditLogs', 'Audit Manager')} &rarr;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
              <table className="w-full text-left" aria-label="System audit log">
                <thead>
                  <tr className="border-b border-[#E7ECF3] text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-[#F8F9FB]">
                    <th className="py-3 px-4">{t('admin.auditId', 'Audit ID')}</th>
                    <th className="py-3 px-4">{t('admin.operator', 'Operator')}</th>
                    <th className="py-3 px-4">{t('admin.actionDesc', 'Action Description')}</th>
                    <th className="py-3 px-4">{t('admin.targetResource', 'Target Resource')}</th>
                    <th className="py-3 px-4">{t('common.date', 'Time')}</th>
                    <th className="py-3 px-4 text-right">{t('common.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-[#F1F5F9] hover:bg-[#F8F9FB] text-[13px] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-police-navy">{log.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[#0F172A]">{log.user}</td>
                      <td className="py-3.5 px-4 text-[#334155]">{log.action}</td>
                      <td className="py-3.5 px-4 font-mono text-[#64748B] text-[11px]">{log.target}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{log.time}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`badge ${log.status === 'Success' ? 'badge-success' : 'badge-high'} rounded-full py-0.5 px-2.5 text-[10px] font-bold uppercase`}>
                          {log.status === 'Success' ? t('common.success', 'Success') : t('common.high', 'Warning')}
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
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm h-[380px] flex flex-col justify-between hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-4 mb-3 shrink-0">
              <h3 className="text-base font-bold text-[#0F172A]">
                {t('admin.recentLogins', 'Recent Admin/User Logins')}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pt-1">
              {recentLogins.map((login, idx) => (
                <div key={idx} className="p-3.5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs flex justify-between items-center hover:border-[#CBD5E1] hover:bg-white transition-all duration-200">
                  <div>
                    <p className="font-bold text-[#0F172A]">{login.user}</p>
                    <p className="text-[#64748B] text-[11px] mt-0.5">{login.role} • {login.station}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[#334155] text-[11px] font-bold">{login.ip}</p>
                    <p className="text-[#64748B] text-[10px] font-mono mt-0.5">{login.time}</p>
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
