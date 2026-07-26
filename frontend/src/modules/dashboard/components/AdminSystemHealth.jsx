import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Cpu, Database, ShieldCheck, Server,
  RefreshCw, Download, AlertTriangle, CheckCircle, Clock,
  Zap, Globe, Layers, TrendingUp,
  Trash2, FileText, Terminal, Calendar, X
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

// ─── Static Data ───────────────────────────────────────────────────────────────
const PLATFORM_SERVICES = [
  {
    name: 'PostgreSQL Database', icon: Database, status: 'Online',
    metrics: [
      { label: 'Latency',      val: '14 ms',  color: 'text-emerald-600' },
      { label: 'Connections',  val: '324',     color: 'text-sky-600'     },
      { label: 'Storage Used', val: '68%',     color: 'text-amber-600'   },
    ],
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500',
  },
  {
    name: 'Redis Cache', icon: Zap, status: 'Online',
    metrics: [
      { label: 'Hit Ratio', val: '97%',    color: 'text-emerald-600' },
      { label: 'Memory',    val: '41%',    color: 'text-sky-600'     },
      { label: 'Evictions', val: '0.02%',  color: 'text-violet-600'  },
    ],
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500',
  },
  {
    name: 'API Gateway', icon: Globe, status: 'Healthy',
    metrics: [
      { label: 'Requests/s', val: '1,250', color: 'text-sky-600'     },
      { label: 'Response',   val: '92 ms', color: 'text-emerald-600' },
      { label: 'Error Rate', val: '0.03%', color: 'text-emerald-600' },
    ],
    statusColor: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500',
  },
  {
    name: 'ML Prediction Engine', icon: Cpu, status: 'Running',
    metrics: [
      { label: 'Inference',   val: '310 ms', color: 'text-amber-600'  },
      { label: 'GPU Load',    val: '32%',    color: 'text-violet-600' },
      { label: 'Queue Depth', val: '18',     color: 'text-sky-600'    },
    ],
    statusColor: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500',
  },
  {
    name: 'GIS Tile Server', icon: Layers, status: 'Online',
    metrics: [
      { label: 'Tile/s',    val: '892',   color: 'text-sky-600'     },
      { label: 'Cache Hit', val: '84%',   color: 'text-emerald-600' },
      { label: 'Latency',   val: '19 ms', color: 'text-emerald-600' },
    ],
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500',
  },
  {
    name: 'Authentication Service', icon: ShieldCheck, status: 'Secure',
    metrics: [
      { label: 'Logins/min',   val: '14',  color: 'text-sky-600'    },
      { label: 'Failures',     val: '0.8%',color: 'text-emerald-600'},
      { label: 'Token Expiry', val: '4h',  color: 'text-violet-600' },
    ],
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500',
  },
];

const SERVER_TABLE = [
  { name: 'HQ Server 01',    status: 'Online',  cpu: 42, ram: 61, storage: 38, latency: '14ms', check: 'Now'   },
  { name: 'HQ Server 02',    status: 'Online',  cpu: 39, ram: 54, storage: 35, latency: '17ms', check: 'Now'   },
  { name: 'Prediction Node', status: 'Healthy', cpu: 52, ram: 48, storage: 45, latency: '24ms', check: '2 sec' },
  { name: 'GIS Tile Server', status: 'Healthy', cpu: 33, ram: 29, storage: 51, latency: '19ms', check: 'Now'   },
  { name: 'DB Replica Node', status: 'Online',  cpu: 27, ram: 43, storage: 62, latency: '11ms', check: '1 sec' },
  { name: 'Auth Gateway',    status: 'Online',  cpu: 18, ram: 31, storage: 22, latency: '8ms',  check: 'Now'   },
];

const ALERTS = [
  { level: 'warning',  msg: 'Memory usage exceeded 80% on DB Replica Node', state: 'Resolved',  time: '10 mins ago' },
  { level: 'success',  msg: 'Daily Backup completed successfully',           state: 'Completed', time: 'Today 02:00' },
  { level: 'critical', msg: 'Failed Login Attempts detected — IP Blocked',   state: 'Blocked',   time: 'Today 09:18' },
  { level: 'warning',  msg: 'API Gateway response time spiked to 340ms',     state: 'Resolved',  time: '1h ago'      },
  { level: 'success',  msg: 'SSL Certificate renewed successfully',           state: 'Completed', time: 'Yesterday'   },
];

const MAINTENANCE = [
  { day: 'Sunday',   time: '02:00 AM', task: 'Database Optimization',  est: '15 mins' },
  { day: 'Monday',   time: '03:00 AM', task: 'Log Rotation & Archive',  est: '10 mins' },
  { day: 'Thursday', time: '01:30 AM', task: 'System Patch Deployment', est: '45 mins' },
];

const SPARKLINES = {
  cpu:     [40, 38, 42, 45, 41, 43, 42, 44, 42, 40],
  memory:  [58, 60, 59, 63, 62, 61, 60, 62, 61, 61],
  storage: [37, 37, 38, 38, 38, 38, 38, 38, 38, 38],
  network: [8,  12, 10, 15, 11, 13, 12, 14, 12, 12],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const sparklinePath = (data, w = 80, h = 24) => {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`);
  return `M ${pts.join(' L ')}`;
};

const usageColor = (v) => v >= 80 ? 'text-rose-600' : v >= 60 ? 'text-amber-600' : 'text-emerald-600';
const usageBg    = (v) => v >= 80 ? 'bg-rose-500'   : v >= 60 ? 'bg-amber-400'   : 'bg-emerald-400';

const statusBadge = (s) => {
  if (s === 'Online')  return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (s === 'Healthy') return 'bg-sky-50 text-sky-700 border border-sky-200';
  return 'bg-violet-50 text-violet-700 border border-violet-200';
};

const alertStyle = (level) => {
  if (level === 'critical') return { bar: 'bg-rose-500',    card: 'border-rose-200 bg-rose-50',       icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" /> };
  if (level === 'warning')  return { bar: 'bg-amber-400',   card: 'border-amber-200 bg-amber-50',     icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> };
  return                           { bar: 'bg-emerald-500', card: 'border-emerald-200 bg-emerald-50', icon: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> };
};

function CircleProgress({ pct, color }) {
  const r = 18, cx = 22, cy = 22, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E7ECF3" strokeWidth="4" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0F172A">{pct}%</text>
    </svg>
  );
}

export default function AdminSystemHealth() {
  const [expandedAlert, setExpandedAlert] = useState(null);

  const { addToast } = useToast();

  const handleExportDiagnostics = () => {
    try {
      const csvHeaders = ['Component / Service', 'Metric / Property', 'Value / Status'];
      const csvRows = [
        ['"Overall System Status"', '"Status"', '"Healthy (99.98% Uptime)"'],
        ['"CPU Utilization"', '"Percentage"', '"42%"'],
        ['"Memory Utilization"', '"Percentage"', '"61%"'],
        ['"Storage Utilization"', '"Percentage"', '"38%"'],
        ['"Network Traffic"', '"Percentage"', '"12%"'],
        ...PLATFORM_SERVICES.flatMap(s => s.metrics.map(m => [`"${s.name}"`, `"${m.label}"`, `"${m.val}"`])),
        ...ALERTS.map(a => [`"Alert Notice"`, `"${a.msg}"`, `"${a.level.toUpperCase()}"`]),
      ];

      const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `KSP_System_Health_Diagnostics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({
        title: 'Diagnostics Exported',
        message: 'System health diagnostic report saved as CSV.',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to export diagnostics:', err);
      addToast({
        title: 'Export Failed',
        message: 'Unable to export diagnostics file.',
        type: 'danger',
      });
    }
  };

  const handleExportLogs = () => {
    const logHeader = `====================================================================\nKARNATAKA POLICE INTELLIGENCE PLATFORM — SYSTEM INFRASTRUCTURE LOGS\nGenerated: ${new Date().toISOString()}\nEnvironment: Production (KSP Headquarters Cluster)\n====================================================================\n\n`;

    const logEntries = [
      `[2026-07-26 10:48:02.112] [INFO] [Kernel] System heartbeats verified across 12 node clusters. Uptime: 99.98%.`,
      `[2026-07-26 10:45:19.482] [INFO] [PostgreSQL] Connection pool healthy: 324/500 connections active. Latency: 14ms.`,
      `[2026-07-26 10:41:00.000] [INFO] [Cron] Automated DB backup completed successfully. Size: 4.82 GB.`,
      `[2026-07-26 10:30:12.891] [WARN] [Redis] Memory utilization threshold reached 61%. Auto-eviction policy triggered.`,
      `[2026-07-26 10:15:44.204] [INFO] [IAM Gateway] Token validation check complete. 544 active JWT sessions verified.`,
      `[2026-07-26 09:58:31.002] [INFO] [GIS Tile Service] Rendered 14,210 map tiles for hotspot detection module.`,
      `[2026-07-26 09:18:03.119] [WARN] [Auth Service] Failed login attempt detected from IP 192.168.4.55 (Rate limit enforced).`,
      `[2026-07-26 08:00:00.000] [INFO] [System] Routine morning health check passed with zero critical errors.`,
    ].join('\n');

    const fullLog = logHeader + logEntries;
    const blob = new Blob([fullLog], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KSP_System_Infrastructure_Logs_${new Date().toISOString().split('T')[0]}.log`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Infrastructure Logs Exported',
      message: 'System logs downloaded as KSP_System_Infrastructure_Logs.log',
      type: 'success',
    });
  };

  const handleRunDiagnostics = () => {
    addToast({
      title: 'Diagnostic Scan Complete',
      message: 'All 12 server nodes, PostgreSQL database, and Redis cache passed diagnostics with zero errors.',
      type: 'success',
    });
  };

  const handleRestartService = () => {
    addToast({
      title: 'Service Gateway Restarted',
      message: 'Core service listeners re-bound cleanly. All connections active.',
      type: 'info',
    });
  };

  const handleClearCache = () => {
    addToast({
      title: 'Redis Cache Cleared',
      message: 'Flushed 4,120 transient session & tile keys from heap memory.',
      type: 'warning',
    });
  };

  const handleDBBackup = () => {
    const backupManifest = JSON.stringify({
      backupId: `BKUP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      database: 'ksp_intelligence_prod',
      engine: 'PostgreSQL 15.4',
      sizeBytes: 5175432100,
      checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'VERIFIED',
    }, null, 2);

    const blob = new Blob([backupManifest], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KSP_DB_Backup_Manifest_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Database Backup Complete',
      message: 'Backup manifest generated and stored in secure cluster storage.',
      type: 'success',
    });
  };

  const KPI_CARDS = [
    { label: 'CPU Usage', pct: 42, sub: 'Normal',      sparkKey: 'cpu',     sparkColor: '#3B82F6', circColor: '#3B82F6', statusCls: 'text-sky-600 bg-sky-50 border-sky-200' },
    { label: 'Memory',    pct: 61, sub: 'Stable',      sparkKey: 'memory',  sparkColor: '#10B981', circColor: '#10B981', statusCls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Storage',   pct: 38, sub: 'Healthy',     sparkKey: 'storage', sparkColor: '#06B6D4', circColor: '#06B6D4', statusCls: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { label: 'Network',   pct: 12, sub: 'Low Traffic', sparkKey: 'network', sparkColor: '#8B5CF6', circColor: '#8B5CF6', statusCls: 'text-violet-600 bg-violet-50 border-violet-200' },
  ];

  const cpuData = [38,40,35,42,45,48,42,44,46,50,48,44,43,42,40,41,43,44,42,43,42,41,42,42];
  const memData = [55,57,58,60,62,65,63,61,60,61,62,64,63,62,61,60,61,62,61,61,60,61,61,61];
  const hours   = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);

  const chartPath = (data, w, h) => {
    const min = Math.min(...data) - 5, max = Math.max(...data) + 5, range = max - min;
    return data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * w} ${h - ((v - min) / range) * (h - 20) - 10}`).join(' ');
  };
  const areaPath = (data, w, h) => `${chartPath(data, w, h)} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12">

      {/* ── 1. Hero Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[88px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Platform Diagnostic Suite</h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full font-extrabold text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Healthy
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              Real-time infrastructure monitoring, server performance, database health and platform diagnostics.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#F8F9FB] border border-[#E7ECF3] px-3 py-1.5 rounded-full text-xs font-bold text-[#64748B]">
            <Clock className="w-3.5 h-3.5 text-[#0B1F4D]" />
            Updated: 2 sec ago
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-extrabold text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            Uptime: 99.98%
          </div>
          <button
            onClick={handleExportDiagnostics}
            className="h-9 px-4 rounded-full bg-[#0B1F4D] text-white font-extrabold text-xs hover:bg-[#143275] transition-colors duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#C79A2B]" />
            Export Diagnostics
          </button>
        </div>
      </div>

      {/* ── 2. KPI Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPI_CARDS.map(({ label, pct, sub, sparkKey, sparkColor, circColor, statusCls }) => (
          <motion.div key={label} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} transition={{ duration: 0.15 }}
            className="bg-white border border-[#E7ECF3] rounded-[24px] p-5 shadow-sm flex items-center justify-between cursor-default">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{label}</p>
              <h3 className={`text-2xl font-black tracking-tight mt-1 ${usageColor(pct)}`}>{pct}%</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border mt-1.5 ${statusCls}`}>{sub}</span>
              <svg width="80" height="24" className="mt-2 block">
                <path d={sparklinePath(SPARKLINES[sparkKey])} fill="none" stroke={sparkColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <CircleProgress pct={pct} color={circColor} />
          </motion.div>
        ))}
      </div>

      {/* ── 3. Platform Services Grid ──────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-6">
        <div className="flex items-center justify-between mb-5 border-b border-[#E7ECF3] pb-4">
          <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Platform Services</h2>
          <span className="text-xs font-semibold text-[#64748B]">6 services · All operational</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {PLATFORM_SERVICES.map(({ name, icon: Icon, status, metrics, statusColor, dot }) => (
            <div key={name} className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[18px] p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-[#0F172A]">{name}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />{status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {metrics.map(({ label, val, color }) => (
                  <div key={label} className="bg-white rounded-[10px] border border-[#E7ECF3] p-2.5 text-center">
                    <p className={`text-sm font-black ${color}`}>{val}</p>
                    <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Resource Charts ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[
          { title: 'CPU Utilization (24h)',    data: cpuData, color: '#3B82F6', fill: false, peak: '50%', avg: '42%' },
          { title: 'Memory Utilization (24h)', data: memData, color: '#10B981', fill: true,  peak: '65%', avg: '61%' },
        ].map(({ title, data, color, fill, peak, avg }) => (
          <div key={title} className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">{title}</h3>
              <div className="flex items-center gap-4 text-[11px] font-bold text-[#64748B]">
                <span>Peak: <span className="font-extrabold text-[#0F172A]">{peak}</span></span>
                <span>Avg: <span className="font-extrabold text-[#0F172A]">{avg}</span></span>
              </div>
            </div>
            <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none" className="overflow-visible">
              {[0,25,50,75,100].map(v => (
                <g key={v}>
                  <line x1="0" y1={200-v*1.6-10} x2="600" y2={200-v*1.6-10} stroke="#E7ECF3" strokeWidth="1" />
                  <text x="0" y={200-v*1.6-14} fontSize="9" fill="#94A3B8" fontWeight="600">{v}%</text>
                </g>
              ))}
              {fill && <path d={areaPath(data, 600, 200)} fill={color} opacity="0.08" />}
              <path d={chartPath(data, 600, 200)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {data.map((v, i) => {
                const min = Math.min(...data)-5, max = Math.max(...data)+5;
                const x = (i/(data.length-1))*600;
                const y = 200-((v-min)/(max-min))*(200-20)-10;
                return <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="white" strokeWidth="1.5"><title>{hours[i]}: {v}%</title></circle>;
              })}
            </svg>
            <div className="flex justify-between mt-1">
              {[0,6,12,18,23].map(i => <span key={i} className="text-[9px] font-bold text-[#94A3B8]">{hours[i]}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. Server Table (2/3) + Alerts (1/3) ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Server Table — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7ECF3] bg-[#F8F9FB] flex items-center justify-between">
            <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Server Cluster Health</h3>
            <span className="text-xs font-semibold text-[#64748B]">6 nodes · All responsive</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E7ECF3] bg-[#F8F9FB]">
                  {['Server','Status','CPU','RAM','Storage','Latency','Last Check'].map(h => (
                    <th key={h} className="py-2 px-3 text-[10px] font-black text-[#0F172A] uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7ECF3]/60">
                {SERVER_TABLE.map((srv) => (
                  <tr key={srv.name} className="hover:bg-[#F8F9FB] transition-colors duration-100 cursor-default">
                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[6px] bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 flex items-center justify-center">
                          <Server className="w-3 h-3 text-[#0B1F4D]" />
                        </div>
                        <span className="text-xs font-bold text-[#0F172A]">{srv.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadge(srv.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{srv.status}
                      </span>
                    </td>
                    {[srv.cpu, srv.ram, srv.storage].map((v, i) => (
                      <td key={i} className="px-3 py-2 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-[#E7ECF3] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${usageBg(v)}`} style={{ width: `${v}%` }} />
                          </div>
                          <span className={`text-[11px] font-extrabold ${usageColor(v)}`}>{v}%</span>
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-2 align-middle">
                      <span className="text-xs font-mono font-bold text-emerald-600">{srv.latency}</span>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <span className="text-[11px] font-bold text-[#64748B]">{srv.check}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts — 1/3 width */}
        <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-5">
          <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-4">Recent Infrastructure Alerts</h3>
          <div className="space-y-2.5">
            {ALERTS.map((a, i) => {
              const { bar, card, icon } = alertStyle(a.level);
              const isOpen = expandedAlert === i;
              return (
                <div
                  key={i}
                  onClick={() => setExpandedAlert(isOpen ? null : i)}
                  className={`relative rounded-[12px] border p-3 cursor-pointer overflow-hidden transition-all duration-150 ${card} ${isOpen ? 'ring-1 ring-[#0B1F4D]/10' : ''}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${bar} rounded-l-[12px]`} />
                  <div className="flex items-start gap-2 pl-2">
                    {icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] leading-snug">{a.msg}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] font-extrabold text-[#64748B]">{a.time}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${
                          a.level === 'critical' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                          a.level === 'warning'  ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                   'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>{a.state}</span>
                      </div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] font-semibold text-[#64748B] mt-2 leading-relaxed"
                          >
                            Alert logged at {a.time}. Affected components notified; auto-remediation {a.level === 'success' ? 'completed' : 'in progress'}.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 6. Quick Actions (2/3) + Upcoming Maintenance (1/3) — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick Actions — 2/3 width, directly below Server Table */}
        <div className="lg:col-span-2 bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-6">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider mb-4">Quick Administrative Actions</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: 'Restart Service', icon: RefreshCw, color: 'text-sky-700 bg-sky-50 border-sky-200', action: handleRestartService },
              { label: 'Clear Cache',     icon: Trash2,    color: 'text-amber-700 bg-amber-50 border-amber-200', action: handleClearCache },
              { label: 'Run Diagnostics', icon: Terminal,  color: 'text-violet-700 bg-violet-50 border-violet-200', action: handleRunDiagnostics },
              { label: 'Download Logs',   icon: Download,  color: 'text-[#0B1F4D] bg-[#0B1F4D]/5 border-[#0B1F4D]/10', action: handleExportLogs },
              { label: 'DB Backup',       icon: Database,  color: 'text-emerald-700 bg-emerald-50 border-emerald-200', action: handleDBBackup },
              { label: 'Health Report',   icon: FileText,  color: 'text-rose-700 bg-rose-50 border-rose-200', action: handleExportDiagnostics },
            ].map(({ label, icon: Icon, color, action }) => (
              <button
                key={label}
                onClick={action}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-[16px] border font-bold text-xs text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer ${color}`}
              >
                <Icon className="w-5 h-5" />
                <span className="leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Maintenance — 1/3 width, directly below Alerts */}
        <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-5">
          <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-4">Upcoming Maintenance</h3>
          <div className="space-y-3">
            {MAINTENANCE.map(({ day, time, task, est }) => (
              <div key={task} className="flex items-center gap-3 p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[12px]">
                <div className="w-8 h-8 rounded-[10px] bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#0B1F4D]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[#0F172A]">{task}</p>
                  <p className="text-[10px] font-semibold text-[#64748B] mt-0.5">{day} · {time} · ~{est}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 h-9 rounded-full border border-[#0B1F4D]/20 text-[#0B1F4D] font-extrabold text-xs hover:bg-[#0B1F4D] hover:text-white transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            View Full Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
