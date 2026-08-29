import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, ShieldAlert, CheckCircle, Clock, Shield, AlertTriangle,
  LogIn, Edit3, Plus, Trash2, RotateCcw, Download, Eye, Copy, X,
  RefreshCw, Database, Key, User, Globe, Monitor, Lock, Activity,
  ChevronRight, ChevronLeft, Filter, BarChart2, Cpu, TrendingUp, TrendingDown,
  FileDown, Settings, Archive, ClipboardList
} from 'lucide-react';

import { useToast } from '../../../components/ui/Toast';
import { getAdminAuditEvents } from '../../../services/api';

// ─── Audit Data ────────────────────────────────────────────────────────────────
const AUDIT_LOGS = [
  { id: 'AUD-8822', user: 'Inspector Patil',  role: 'Field Officer',        action: 'Update Case Status',          module: 'FIR Management',   target: 'FIR-2026-1011',        time: '14:32:12', rel: '3m ago',   ip: '10.14.82.11', status: 'Success',  severity: 'Low'      },
  { id: 'AUD-8821', user: 'Analyst Rao',      role: 'Intelligence Analyst', action: 'Generate Intelligence Report', module: 'Analytics Suite',  target: 'BOLO-Report-26',       time: '14:21:05', rel: '11m ago',  ip: '10.12.4.92',  status: 'Success',  severity: 'Low'      },
  { id: 'AUD-8820', user: 'System Kernel',    role: 'Daemon Thread',        action: 'Flush Redis Cache',           module: 'System',           target: 'Memory Heap',          time: '14:02:44', rel: '30m ago',  ip: '127.0.0.1',   status: 'Success',  severity: 'Low'      },
  { id: 'AUD-8819', user: 'Admin Gowda',      role: 'Administrator',        action: 'Modify Access Permissions',   module: 'Users Control',    target: 'Analyst Roster Group', time: '13:32:18', rel: '1h ago',   ip: '10.10.1.1',   status: 'Warning',  severity: 'High'     },
  { id: 'AUD-8818', user: 'System Kernel',    role: 'Daemon Thread',        action: 'Database Backup Schedule',   module: 'System',           target: 'Backup Service',       time: '12:45:00', rel: '2h ago',   ip: '127.0.0.1',   status: 'Success',  severity: 'Low'      },
  { id: 'AUD-8817', user: 'Inspector Patil',  role: 'Field Officer',        action: 'Register FIR Report',        module: 'FIR Management',   target: 'FIR-2026-1025',        time: '12:31:09', rel: '2h ago',   ip: '10.14.82.11', status: 'Success',  severity: 'Low'      },
  { id: 'AUD-8816', user: 'Inspector Kumar',  role: 'Field Officer',        action: 'Link Evidence File',         module: 'FIR Management',   target: 'FIR-2026-1012',        time: '11:02:41', rel: '3h ago',   ip: '10.14.88.24', status: 'Success',  severity: 'Low'      },
  { id: 'AUD-8815', user: 'Analyst Nair',     role: 'Intelligence Analyst', action: 'Export District Report',     module: 'Reports',          target: 'Q2-District-Summary',  time: '10:45:19', rel: '4h ago',   ip: '10.12.9.31',  status: 'Success',  severity: 'Low'      },
  { id: 'AUD-8814', user: 'Unknown Host',     role: 'Unauthenticated',      action: 'Failed Login Attempt',       module: 'Authentication',   target: 'Login Portal',         time: '09:18:03', rel: '5h ago',   ip: '192.168.4.55',status: 'Failed',   severity: 'Critical' },
  { id: 'AUD-8813', user: 'Admin Gowda',      role: 'Administrator',        action: 'Reset Operator Password',    module: 'Users Control',    target: 'sergeant_desai',       time: '09:12:55', rel: '5h ago',   ip: '10.10.1.1',   status: 'Success',  severity: 'Medium'   },
];

const TIMELINE_EVENTS = [
  { time: '09:12', icon: Key,       label: 'Password Reset',    color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-200' },
  { time: '09:15', icon: LogIn,     label: 'Admin Login',       color: 'text-emerald-500',bg: 'bg-emerald-50 border-emerald-200' },
  { time: '09:18', icon: Lock,      label: 'Failed Login',      color: 'text-rose-500',   bg: 'bg-rose-50 border-rose-200' },
  { time: '10:40', icon: Edit3,     label: 'FIR Modified',      color: 'text-sky-500',    bg: 'bg-sky-50 border-sky-200' },
  { time: '11:02', icon: Plus,      label: 'User Created',      color: 'text-violet-500', bg: 'bg-violet-50 border-violet-200' },
  { time: '12:45', icon: Database,  label: 'DB Backup',         color: 'text-emerald-500',bg: 'bg-emerald-50 border-emerald-200' },
  { time: '13:32', icon: Shield,    label: 'Role Modified',     color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-200' },
  { time: '14:32', icon: Edit3,     label: 'Case Updated',      color: 'text-sky-500',    bg: 'bg-sky-50 border-sky-200' },
];

const INSIGHTS = [
  { ok: true,  text: 'No abnormal administrator behavior detected in the last 24h.' },
  { ok: false, text: 'Two failed login spikes detected at 09:18 and 09:20.' },
  { ok: true,  text: 'Database backups completed successfully.' },
  { ok: false, text: 'Password reset frequency increased by 18% vs last week.' },
  { ok: true,  text: 'No unauthorized privilege escalations detected.' },
  { ok: true,  text: 'All system daemon threads operating within normal parameters.' },
];

const HEATMAP_HOURS = [
  { h: '00–04', vals: [2, 1, 3, 2, 1] },
  { h: '04–08', vals: [4, 6, 5, 7, 4] },
  { h: '08–12', vals: [20, 35, 28, 42, 18] },
  { h: '12–16', vals: [38, 45, 52, 41, 36] },
  { h: '16–20', vals: [22, 18, 25, 30, 20] },
  { h: '20–24', vals: [5, 3, 4, 6, 3] },
];

const ROLES_FILTER    = ['All', 'Field Officer', 'Intelligence Analyst', 'Administrator', 'Daemon Thread', 'Unauthenticated'];
const STATUSES_FILTER = ['All', 'Success', 'Warning', 'Failed'];
const SEVERITIES_FILTER = ['All', 'Low', 'Medium', 'High', 'Critical'];
const ITEMS_PER_PAGE  = 7;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const statusStyle = (s) => {
  switch (s) {
    case 'Success':  return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Warning':  return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Failed':   return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:         return 'bg-violet-50 text-violet-700 border border-violet-200';
  }
};

const severityStyle = (s) => {
  switch (s) {
    case 'Critical': return 'bg-rose-500 text-white';
    case 'High':     return 'bg-amber-400 text-white';
    case 'Medium':   return 'bg-sky-400 text-white';
    default:         return 'bg-emerald-400 text-white';
  }
};

const avatarBg = (role) => {
  switch (role) {
    case 'Administrator':       return 'bg-rose-100 text-rose-700';
    case 'Intelligence Analyst':return 'bg-violet-100 text-violet-700';
    case 'Daemon Thread':       return 'bg-slate-100 text-slate-600';
    case 'Unauthenticated':     return 'bg-rose-100 text-rose-700';
    default:                    return 'bg-sky-100 text-sky-700';
  }
};

const actionIcon = (action) => {
  if (action.toLowerCase().includes('login'))    return <LogIn className="w-3.5 h-3.5" />;
  if (action.toLowerCase().includes('register') || action.toLowerCase().includes('create')) return <Plus className="w-3.5 h-3.5" />;
  if (action.toLowerCase().includes('delete'))  return <Trash2 className="w-3.5 h-3.5" />;
  if (action.toLowerCase().includes('password') || action.toLowerCase().includes('reset')) return <Key className="w-3.5 h-3.5" />;
  if (action.toLowerCase().includes('export') || action.toLowerCase().includes('generate')) return <FileDown className="w-3.5 h-3.5" />;
  if (action.toLowerCase().includes('backup'))  return <Database className="w-3.5 h-3.5" />;
  if (action.toLowerCase().includes('modify') || action.toLowerCase().includes('update') || action.toLowerCase().includes('link')) return <Edit3 className="w-3.5 h-3.5" />;
  if (action.toLowerCase().includes('flush'))   return <RefreshCw className="w-3.5 h-3.5" />;
  return <FileText className="w-3.5 h-3.5" />;
};

const getInitials = (name) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const heatColor = (v) => {
  if (v >= 40) return 'bg-rose-500';
  if (v >= 25) return 'bg-amber-400';
  if (v >= 12) return 'bg-sky-400';
  if (v >= 5)  return 'bg-emerald-300';
  return 'bg-slate-100';
};

export default function AdminAuditLogs() {
  const [searchQuery,    setSearchQuery]    = useState('');
  const [roleFilter,     setRoleFilter]     = useState('All');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedLog,    setSelectedLog]    = useState(null);

  const { addToast } = useToast();

  const handleReset = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
    setSeverityFilter('All');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Audit ID', 'Operator', 'Role', 'Action', 'Module', 'Target Resource', 'Timestamp', 'Severity', 'Status', 'IP Address'];
    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.user}"`,
      `"${log.role}"`,
      `"${log.action}"`,
      `"${log.module}"`,
      `"${log.target || ''}"`,
      `"${log.time}"`,
      `"${log.severity || ''}"`,
      `"${log.status}"`,
      `"${log.ip || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KSP_System_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Audit Logs Exported',
      message: `Exported ${filteredLogs.length} audit log records as CSV file.`,
      type: 'success',
    });
  };

  const handleComplianceReport = () => {
    addToast({
      title: 'Compliance Report Generated',
      message: 'Monthly security compliance report compiled successfully.',
      type: 'success',
    });
  };

  const handleArchiveLogs = () => {
    addToast({
      title: 'Logs Archived',
      message: 'Successfully archived logs older than 90 days to cold storage.',
      type: 'info',
    });
  };

  const handleConfigPolicies = () => {
    addToast({
      title: 'Policies Panel Accessed',
      message: 'Opening audit policy configuration matrix...',
      type: 'warning',
    });
  };

  const filteredLogs = useMemo(() => {
    setCurrentPage(1);
    let list = [...AUDIT_LOGS];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l =>
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'All')     list = list.filter(l => l.role === roleFilter);
    if (statusFilter !== 'All')   list = list.filter(l => l.status === statusFilter);
    if (severityFilter !== 'All') list = list.filter(l => l.severity === severityFilter);
    return list;
  }, [searchQuery, roleFilter, statusFilter, severityFilter]);

  const totalPages     = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedLogs  = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const selectBase = "h-9 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-xs font-semibold rounded-[12px] pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all cursor-pointer appearance-none";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12">

      {/* ── 1. Hero Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[88px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Security Audit Manager</h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full font-extrabold text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Secure
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              Track operator activities, authentication logs, and administrative actions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#F8F9FB] border border-[#E7ECF3] px-3 py-1.5 rounded-full text-xs font-bold text-[#64748B]">
            <Clock className="w-3.5 h-3.5 text-[#0B1F4D]" />
            Last Sync: 12 sec ago
          </div>
          <div className="flex items-center gap-1.5 bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 px-3 py-1.5 rounded-full text-xs font-extrabold text-[#0B1F4D]">
            <Activity className="w-3.5 h-3.5" />
            42,531 Logs Today
          </div>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Audit Events',  value: '42,531', sub: '+8% Today',        icon: FileText,      iconBg: 'bg-[#0B1F4D]/5 text-[#0B1F4D]',    valueCls: 'text-[#0B1F4D]' },
          { label: 'Failed Logins',       value: '128',    sub: 'Warning',          icon: Lock,          iconBg: 'bg-amber-50 text-amber-600',        valueCls: 'text-amber-600' },
          { label: 'Privileged Actions',  value: '1,245',  sub: 'Admin Operations', icon: Shield,        iconBg: 'bg-violet-50 text-violet-600',      valueCls: 'text-violet-600' },
          { label: 'Critical Alerts',     value: '14',     sub: 'Needs Review',     icon: AlertTriangle, iconBg: 'bg-rose-50 text-rose-600',          valueCls: 'text-rose-600' },
        ].map(({ label, value, sub, icon: Icon, iconBg, valueCls }) => (
          <div key={label} className="bg-white border border-[#E7ECF3] rounded-[24px] p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{label}</p>
              <h3 className={`text-2xl font-black tracking-tight mt-1 ${valueCls}`}>{value}</h3>
              <p className="text-[11px] font-bold text-[#64748B] mt-0.5">{sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-[14px] border border-[#E7ECF3] flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Filter Toolbar ──────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search logs by operator, action, or audit ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-xs font-semibold rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all placeholder:text-slate-400"
          />
        </div>

        {[
          { val: roleFilter,     set: setRoleFilter,     opts: ROLES_FILTER,      placeholder: 'All Roles' },
          { val: statusFilter,   set: setStatusFilter,   opts: STATUSES_FILTER,   placeholder: 'All Statuses' },
          { val: severityFilter, set: setSeverityFilter, opts: SEVERITIES_FILTER, placeholder: 'All Severities' },
        ].map(({ val, set, opts, placeholder }, idx) => (
          <div key={idx} className="relative">
            <select value={val} onChange={(e) => set(e.target.value)} className={selectBase}>
              {opts.map(o => <option key={o} value={o}>{o === 'All' ? placeholder : o}</option>)}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ))}

        <button onClick={handleReset} title="Reset filters" className="h-9 w-9 rounded-[12px] bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] hover:bg-[#0B1F4D] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button onClick={handleExportCSV} className="h-9 px-4 rounded-[12px] bg-[#0B1F4D] text-white font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#143275] transition-colors cursor-pointer shrink-0">
          <Download className="w-3.5 h-3.5 text-[#C79A2B]" />
          Export CSV
        </button>
      </div>

      {/* ── 4. Audit Table ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7ECF3] bg-[#F8F9FB] flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">System Audit Logs</h3>
          <span className="text-xs font-semibold text-[#64748B]">{filteredLogs.length} records found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Audits table log">
            <thead>
              <tr className="border-b border-[#E7ECF3] bg-[#F8F9FB]">
                {['Audit ID', 'Operator', 'Action', 'Module', 'Source IP', 'Timestamp', 'Severity', 'Status', 'View'].map(h => (
                  <th key={h} className={`py-3.5 px-5 text-xs font-black text-[#0F172A] uppercase tracking-wider ${h === 'View' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7ECF3]/60">
              <AnimatePresence mode="popLayout">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-black text-[#0F172A]">No audit logs found</p>
                        <p className="text-xs font-semibold text-[#64748B]">Try adjusting your search or filters.</p>
                        <button onClick={handleReset} className="mt-1 h-9 px-5 rounded-full bg-[#0B1F4D] text-white font-extrabold text-xs cursor-pointer hover:bg-[#143275] transition-colors">
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <motion.tr
                      key={log.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSelectedLog(log)}
                      className="h-[60px] hover:bg-[#F8F9FB] transition-colors duration-150 cursor-pointer group"
                    >
                      {/* Audit ID */}
                      <td className="px-5 py-3.5 align-middle font-mono font-extrabold text-xs text-[#0B1F4D]">{log.id}</td>

                      {/* Operator */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${avatarBg(log.role)}`}>
                            {getInitials(log.user)}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A] text-xs">{log.user}</p>
                            <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">{log.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="text-[#64748B]">{actionIcon(log.action)}</span>
                          <span className="text-xs font-bold text-[#0F172A] max-w-[160px] truncate">{log.action}</span>
                        </div>
                      </td>

                      {/* Module */}
                      <td className="px-5 py-3.5 align-middle">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#0B1F4D]/5 text-[#0B1F4D] border border-[#0B1F4D]/10">
                          {log.module}
                        </span>
                      </td>

                      {/* Source IP */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-[#64748B]" />
                          <span className="font-mono text-[11px] font-semibold text-[#64748B]">{log.ip}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-3.5 align-middle">
                        <p className="text-xs font-bold text-[#0F172A]">Today {log.time}</p>
                        <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">{log.rel}</p>
                      </td>

                      {/* Severity */}
                      <td className="px-5 py-3.5 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-extrabold text-[10px] tracking-wider ${severityStyle(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-extrabold text-[11px] ${statusStyle(log.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : log.status === 'Failed' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          {log.status}
                        </span>
                      </td>

                      {/* View */}
                      <td className="px-5 py-3.5 align-middle text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                          className="w-7 h-7 rounded-[8px] bg-[#F8F9FB] border border-[#E7ECF3] text-slate-500 hover:text-[#0B1F4D] hover:bg-white flex items-center justify-center transition-colors cursor-pointer ml-auto opacity-0 group-hover:opacity-100"
                          aria-label="View log details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E7ECF3] bg-[#F8F9FB] flex items-center justify-between">
            <p className="text-xs font-semibold text-[#64748B]">
              Showing <span className="font-extrabold text-[#0F172A]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–
              <span className="font-extrabold text-[#0F172A]">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}</span> of <span className="font-extrabold text-[#0F172A]">{filteredLogs.length}</span> logs
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 rounded-[10px] bg-white border border-[#E7ECF3] text-[#0F172A] hover:bg-[#F8F9FB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-xs">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button key={pg} onClick={() => setCurrentPage(pg)} className={`h-8 w-8 rounded-[10px] font-bold text-xs transition-all cursor-pointer ${pg === currentPage ? 'bg-[#0B1F4D] text-white shadow-xs' : 'bg-white border border-[#E7ECF3] text-[#0F172A] hover:bg-[#F8F9FB]'}`}>
                  {pg}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 rounded-[10px] bg-white border border-[#E7ECF3] text-[#0F172A] hover:bg-[#F8F9FB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-xs">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Timeline + Insights Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Security Timeline */}
        <div className="lg:col-span-3 bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Today's Security Activity</h3>
            <span className="text-[11px] font-bold text-[#64748B] bg-[#F8F9FB] border border-[#E7ECF3] px-2.5 py-1 rounded-full">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#E7ECF3] z-0" />
            <div className="flex items-start justify-between gap-1 relative z-10">
              {TIMELINE_EVENTS.map((ev, i) => {
                const Icon = ev.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 bg-white ${ev.bg} ${ev.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] font-extrabold text-[#0F172A] text-center leading-tight">{ev.label}</p>
                    <p className="text-[9px] font-mono font-bold text-[#64748B]">{ev.time}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Security Insights */}
        <div className="lg:col-span-2 bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-[8px] bg-[#0B1F4D] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#C79A2B]" />
            </div>
            <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">AI Security Insights</h3>
          </div>
          <div className="space-y-3">
            {INSIGHTS.map((ins, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-[12px] ${ins.ok ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                {ins.ok
                  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                }
                <p className={`text-[11px] font-semibold leading-relaxed ${ins.ok ? 'text-emerald-800' : 'text-amber-800'}`}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. Heatmap + Quick Actions ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Activity Heatmap */}
        <div className="lg:col-span-3 bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Hourly Audit Heatmap</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748B]">
              <span className="w-3 h-3 rounded-sm bg-emerald-300" /> Low
              <span className="w-3 h-3 rounded-sm bg-sky-400 ml-1" /> Medium
              <span className="w-3 h-3 rounded-sm bg-amber-400 ml-1" /> High
              <span className="w-3 h-3 rounded-sm bg-rose-500 ml-1" /> Peak
            </div>
          </div>

          <div className="space-y-2">
            {HEATMAP_HOURS.map(({ h, vals }) => (
              <div key={h} className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-[#64748B] w-12 text-right shrink-0">{h}</span>
                <div className="flex gap-1.5 flex-1">
                  {vals.map((v, i) => (
                    <div
                      key={i}
                      title={`${v} events`}
                      className={`h-6 flex-1 rounded-[6px] ${heatColor(v)} opacity-90 transition-all cursor-pointer hover:opacity-100`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono font-bold text-[#64748B] w-8 shrink-0">{vals.reduce((a,b)=>a+b,0)}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-4">Peak Activity: 12:00–16:00 · Most Active: FIR Management · Login Frequency: 212/day</p>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-6">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Export Logs',                icon: Download,     color: 'text-[#0B1F4D] bg-[#0B1F4D]/5 border-[#0B1F4D]/10', action: handleExportCSV },
              { label: 'Compliance Report',          icon: ClipboardList,color: 'text-violet-700 bg-violet-50 border-violet-200', action: handleComplianceReport },
              { label: 'Archive Old Logs',           icon: Archive,      color: 'text-amber-700 bg-amber-50 border-amber-200', action: handleArchiveLogs },
              { label: 'Configure Audit Policies',   icon: Settings,     color: 'text-emerald-700 bg-emerald-50 border-emerald-200', action: handleConfigPolicies },
            ].map(({ label, icon: Icon, color, action }) => (
              <button
                key={label}
                onClick={action}
                className={`flex flex-col items-center gap-2 p-4 rounded-[16px] border font-bold text-xs text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer ${color}`}
              >
                <Icon className="w-5 h-5" />
                <span className="leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. Sliding Details Panel ───────────────────────────────────────── */}
      <AnimatePresence>
        {selectedLog && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="bg-[#0B1F4D] px-6 py-5 flex items-start justify-between shrink-0">
                <div>
                  <span className="text-[11px] font-mono font-extrabold text-[#C79A2B]">{selectedLog.id}</span>
                  <h2 className="text-base font-black text-white mt-1">Audit Log Details</h2>
                  <p className="text-xs font-semibold text-white/60 mt-0.5">{selectedLog.action}</p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* Operator Profile Card */}
                <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] p-4">
                  <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Operator Profile</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${avatarBg(selectedLog.role)}`}>
                      {getInitials(selectedLog.user)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] text-sm">{selectedLog.user}</p>
                      <p className="text-[11px] font-semibold text-[#64748B]">{selectedLog.role}</p>
                    </div>
                  </div>
                  {[
                    { label: 'Department',   val: 'Karnataka State Police' },
                    { label: 'Auth Method',  val: 'PKI Certificate' },
                    { label: 'Session ID',   val: 'SES-A29F4C' },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#E7ECF3]/60 last:border-0 text-xs">
                      <span className="font-semibold text-[#64748B]">{label}</span>
                      <span className="font-bold text-[#0F172A]">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Connection Details Card */}
                <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] p-4">
                  <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Connection Details</p>
                  {[
                    { label: 'IP Address', val: selectedLog.ip },
                    { label: 'Browser',    val: 'Chrome 124.0 / Windows 11' },
                    { label: 'OS',         val: 'Windows 11 Pro' },
                    { label: 'Location',   val: 'Bengaluru, Karnataka' },
                    { label: 'Device',     val: 'Desktop Workstation' },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#E7ECF3]/60 last:border-0 text-xs">
                      <span className="font-semibold text-[#64748B]">{label}</span>
                      <span className="font-bold text-[#0F172A] font-mono text-[11px]">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Event Details Card */}
                <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] p-4">
                  <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Event Details</p>
                  {[
                    { label: 'Action',            val: selectedLog.action },
                    { label: 'Affected Resource', val: selectedLog.target },
                    { label: 'Module',            val: selectedLog.module },
                    { label: 'Timestamp',         val: `Today ${selectedLog.time} (${selectedLog.rel})` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-start py-1.5 border-b border-[#E7ECF3]/60 last:border-0 text-xs gap-3">
                      <span className="font-semibold text-[#64748B] shrink-0">{label}</span>
                      <span className="font-bold text-[#0F172A] text-right">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Risk Score Card */}
                <div className={`border rounded-[16px] p-4 ${selectedLog.severity === 'Critical' ? 'bg-rose-50 border-rose-200' : selectedLog.severity === 'High' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">Risk Score</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${severityStyle(selectedLog.severity)}`}>
                      {selectedLog.severity}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#64748B] mt-2">
                    {selectedLog.severity === 'Critical'
                      ? 'Immediate investigation required. Unauthorized access pattern detected.'
                      : selectedLog.severity === 'High'
                      ? 'Monitor closely. Privilege-level action logged for review.'
                      : 'Standard operational log. No immediate action required.'}
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-[#E7ECF3] bg-[#F8F9FB] flex items-center gap-3 shrink-0">
                <button className="flex-1 h-10 rounded-full bg-[#0B1F4D] hover:bg-[#143275] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-[#C79A2B]" /> Download Log
                </button>
                <button className="h-10 w-10 rounded-full bg-white border border-[#E7ECF3] text-[#0F172A] hover:bg-[#F8F9FB] flex items-center justify-center transition-colors cursor-pointer" title="Copy JSON">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedLog(null)} className="h-10 w-10 rounded-full bg-white border border-[#E7ECF3] text-[#0F172A] hover:bg-[#F8F9FB] flex items-center justify-center transition-colors cursor-pointer" title="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
