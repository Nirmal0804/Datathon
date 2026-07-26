import React, { useState } from 'react';
import { Search, Download, ShieldCheck, LogIn, LogOut, FilePen, Trash2, Eye, Clock } from 'lucide-react';

const logs = [
  { id: 1, action: 'Login', user: 'J. Doe', role: 'Analyst', module: 'Authentication', detail: 'Successful login from 192.168.1.10', time: '2026-07-26 09:14:02', type: 'auth' },
  { id: 2, action: 'Report Generated', user: 'Super Admin S. Kumar', role: 'Super Admin', module: 'Reports', detail: 'Generated RPT-2026-0042 (Statewide Summary)', time: '2026-07-26 08:55:11', type: 'write' },
  { id: 3, action: 'Role Modified', user: 'Super Admin S. Kumar', role: 'Super Admin', module: 'Settings', detail: 'Changed user R. Patil role → Intelligence Analyst', time: '2026-07-25 20:30:45', type: 'admin' },
  { id: 4, action: 'Data Exported', user: 'Inspector Patil', role: 'Field Officer', module: 'Crime Map', detail: 'Exported district shapefile: Mysuru', time: '2026-07-25 19:12:00', type: 'write' },
  { id: 5, action: 'Logout', user: 'Analyst S. Rao', role: 'Analyst', module: 'Authentication', detail: 'Secure session terminated', time: '2026-07-25 18:00:01', type: 'auth' },
  { id: 6, action: 'Suspect Profile Viewed', user: 'Analyst S. Rao', role: 'Analyst', module: 'Network Analysis', detail: 'Accessed SUS-2026-8914 entity profile', time: '2026-07-25 17:44:22', type: 'read' },
];

const typeConfig = {
  auth: { icon: LogIn, label: 'AUTH', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  write: { icon: FilePen, label: 'WRITE', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  admin: { icon: ShieldCheck, label: 'ADMIN', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  read: { icon: Eye, label: 'READ', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
};

export default function AuditLogs() {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.user || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.module || '').toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = 'ID,Type,Action,User,Role,Module,Detail,Timestamp\n';
    const csvContent = filtered.map(l => 
      `"${l.id}","${l.type}","${l.action}","${l.user}","${l.role}","${l.module}","${l.detail}","${l.time}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `karnataka_police_audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E7ECF3] pb-4">
        <div>
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Audit &amp; System Activity Logs</h3>
          <p className="text-xs font-semibold text-[#64748B] mt-0.5">Tamper-proof record of security events and administrative actions on the platform.</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 h-9 px-4 bg-[#0B1F4D] hover:bg-[#0F2A6B] text-white text-xs font-extrabold rounded-full transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-[#C79A2B]" /> Export Logs
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by action, personnel, or module..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-10 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs font-bold text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#0B1F4D] transition-colors"
        />
      </div>

      <div className="border border-[#E7ECF3] rounded-[18px] overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-black text-[#0F172A] uppercase bg-[#F8F9FB] border-b border-[#E7ECF3]">
              <tr>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">User Personnel</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Audit Details</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7ECF3]">
              {filtered.map(log => {
                const config = typeConfig[log.type] || typeConfig.auth;
                const Icon = config.icon;
                return (
                  <tr key={log.id} className="hover:bg-[#F8F9FB]/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-[#0F172A] whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-[#0F172A]">{log.user}</span>
                      <span className="block text-[10px] text-[#64748B] font-semibold">{log.role}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-[#0F172A]">{log.module}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-[#64748B] font-medium">{log.detail}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] font-extrabold text-[#64748B]">{log.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748B]">
            <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">No matching audit logs found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
