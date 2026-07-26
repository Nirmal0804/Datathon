import React from 'react';
import { motion } from 'framer-motion';

const stations = [
  { id: 'PS-101', name: 'Central Station', inspector: 'R. K. Sharma', activeCases: 142, efficiency: '89%', status: 'Optimal' },
  { id: 'PS-102', name: 'West Zone', inspector: 'S. Patil', activeCases: 210, efficiency: '72%', status: 'Overloaded' },
  { id: 'PS-103', name: 'South End', inspector: 'M. Gowda', activeCases: 89, efficiency: '94%', status: 'Optimal' },
  { id: 'PS-104', name: 'Tech Park', inspector: 'K. Reddy', activeCases: 305, efficiency: '61%', status: 'Critical' },
];

export default function PoliceStationTable() {
  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[22px] shadow-sm overflow-hidden flex flex-col h-full hover:border-[#1A2F63]/30 transition-all duration-300">
      <div className="px-6 py-5 border-b border-[#F1F5F9] shrink-0">
        <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider mb-1">Police Station Performance Metrics</h3>
        <p className="text-xs font-semibold text-[#64748B]">Operational capacity and clearance rates</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FB] border-b border-[#E7ECF3]">
              <th className="px-6 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest whitespace-nowrap">Station ID</th>
              <th className="px-6 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest whitespace-nowrap">Name</th>
              <th className="px-6 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest whitespace-nowrap">Inspector-In-Charge</th>
              <th className="px-6 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest whitespace-nowrap">Active Cases</th>
              <th className="px-6 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest whitespace-nowrap">Clearance Rate</th>
              <th className="px-6 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest whitespace-nowrap">Workload Status</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((row, idx) => (
              <motion.tr 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="border-b border-[#F1F5F9] hover:bg-[#F8F9FB]/60 transition-colors group cursor-default"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-[#0F172A] group-hover:text-[#0B1F4D] transition-colors">{row.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#0B1F4D] transition-colors">{row.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-[#334155]">{row.inspector}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-[#0B1F4D]">{row.activeCases}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: row.efficiency }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          parseInt(row.efficiency) > 80 ? 'bg-emerald-500' : 
                          parseInt(row.efficiency) > 65 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#0F172A]">{row.efficiency}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                    row.status === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    row.status === 'Overloaded' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
