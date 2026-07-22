import React, { useState } from 'react';
import { Search, Download, ShieldCheck, LogIn, LogOut, FilePen, Trash2, Eye } from 'lucide-react';

const logs = [
  { id: 1, action: 'Login', user: 'J. Doe', role: 'Analyst', module: 'Authentication', detail: 'Successful login from 192.168.1.10', time: '2023-10-24 22:14:02', type: 'auth' },
  { id: 2, action: 'Report Generated', user: 'J. Doe', role: 'Analyst', module: 'Reports', detail: 'Generated RPT-2023-0042 (Statewide Summary)', time: '2023-10-24 21:55:11', type: 'write' },
  { id: 3, action: 'Role Modified', user: 'Admin S. Kumar', role: 'Super Admin', module: 'Settings', detail: 'Changed user R. Patil role → Intelligence Analyst', time: '2023-10-24 20:30:45', type: 'admin' },
  { id: 4, action: 'Data Exported', user: 'M. Gowda', role: 'Field Officer', module: 'Crime Map', detail: 'Exported district shapefile: Mysuru', time: '2023-10-24 19:12:00', type: 'write' },
  { id: 5, action: 'Logout', user: 'J. Doe', role: 'Analyst', module: 'Authentication', detail: 'Secure session terminated', time: '2023-10-24 18:00:01', type: 'auth' },
  { id: 6, action: 'Suspect Profile Viewed', user: 'K. Reddy', role: 'Analyst', module: 'Network Analysis', detail: 'Accessed SUS-2023-8914 entity profile', time: '2023-10-24 17:44:22', type: 'read' },
];

const typeConfig = {
  auth: { icon: LogIn, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  write: { icon: FilePen, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  admin: { icon: ShieldCheck, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  read: { icon: Eye, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

export default function AuditLogs() {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Audit & Activity Logs</h3>
          <p className="text-sm text-slate-400 mt-0.5">Tamper-proof record of all user actions on the platform.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm text-white rounded-md transition-colors shrink-0">
          <Download className="w-4 h-4" /> Export Logs
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search by action, user, or module..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Module</th>
                <th className="px-5 py-3 font-semibold">Detail</th>
                <th className="px-5 py-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(log => {
                const { icon: Icon, color } = typeConfig[log.type];
                return (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${color}`}>
                        <Icon className="w-3 h-3" />
                        {log.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-white whitespace-nowrap">{log.action}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="text-slate-200">{log.user}</span>
                      <span className="block text-xs text-slate-500">{log.role}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{log.module}</td>
                    <td className="px-5 py-3 max-w-xs truncate text-slate-400">{log.detail}</td>
                    <td className="px-5 py-3 whitespace-nowrap font-mono text-xs text-slate-500">{log.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No logs found for that query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
