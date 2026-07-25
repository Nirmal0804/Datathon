import React, { useState, useMemo } from 'react';
import { FileText, Search, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function AdminAuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');

  const auditLogs = [
    { id: 'AUD-8822', user: 'Inspector Patil', role: 'Field Officer', action: 'Update Case Status', target: 'FIR-2026-1011', time: '3m ago', ip: '10.14.82.11', status: 'Success' },
    { id: 'AUD-8821', user: 'Analyst Rao', role: 'Intelligence Analyst', action: 'Generate Intelligence Report', target: 'BOLO-Report-26', time: '11m ago', ip: '10.12.4.92', status: 'Success' },
    { id: 'AUD-8820', user: 'System Kernel', role: 'Daemon Thread', action: 'Flush Redis Cache', target: 'Memory Heap', time: '30m ago', ip: '127.0.0.1', status: 'Success' },
    { id: 'AUD-8819', user: 'Admin Gowda', role: 'Administrator', action: 'Modify Access Permissions', target: 'Analyst Roster Group', time: '1h ago', ip: '10.10.1.1', status: 'Warning' },
    { id: 'AUD-8818', user: 'System Kernel', role: 'Daemon Thread', action: 'Database Backup Schedule', target: 'Backup Service', time: '2h ago', ip: '127.0.0.1', status: 'Success' },
    { id: 'AUD-8817', user: 'Inspector Patil', role: 'Field Officer', action: 'Register FIR Report', target: 'FIR-2026-1025', time: '2h ago', ip: '10.14.82.11', status: 'Success' },
    { id: 'AUD-8816', user: 'Inspector Kumar', role: 'Field Officer', action: 'Link Evidence File', target: 'FIR-2026-1012', time: '3h ago', ip: '10.14.88.24', status: 'Success' },
  ];

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return auditLogs;
    const q = searchQuery.toLowerCase();
    return auditLogs.filter(log => 
      log.user.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Security Audit Manager</h2>
            <p className="text-2xs text-slate-400 mt-0.5 font-sans">Track operational logs, operator activity history, and authentication metrics.</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-300">System Logs</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter audits (e.g. operator, action)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs h-8 w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Audits table log">
            <thead>
              <tr className="border-b border-slate-800 text-3xs font-semibold text-slate-500 uppercase">
                <th className="py-2.5 px-3">Audit ID</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource Target</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 text-xs transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-500">{log.id}</td>
                  <td className="py-2.5 px-3">
                    <div>
                      <p className="font-semibold text-slate-200">{log.user}</p>
                      <p className="text-4xs text-slate-500 font-mono">{log.role}</p>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-350">{log.action}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-3xs">{log.target}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-550 text-3xs">{log.ip}</td>
                  <td className="py-2.5 px-3 text-slate-450">{log.time}</td>
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
  );
}
