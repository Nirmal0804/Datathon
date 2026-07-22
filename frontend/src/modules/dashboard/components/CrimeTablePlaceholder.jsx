import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Download, ArrowUpDown } from 'lucide-react';

const cases = [
  { id: 'FIR-2023-0892', category: 'Cybercrime',  district: 'Bengaluru City',   date: '24 Oct 2023', risk: 'High',     status: 'Active'        },
  { id: 'FIR-2023-0891', category: 'Property',     district: 'Mysuru',           date: '23 Oct 2023', risk: 'Medium',   status: 'Investigating' },
  { id: 'FIR-2023-0890', category: 'Violent',      district: 'Hubballi-Dharwad', date: '23 Oct 2023', risk: 'Critical', status: 'Active'        },
  { id: 'FIR-2023-0889', category: 'Financial',    district: 'Mangaluru City',   date: '22 Oct 2023', risk: 'Low',      status: 'Closed'        },
  { id: 'FIR-2023-0888', category: 'Narcotics',    district: 'Belagavi',         date: '22 Oct 2023', risk: 'High',     status: 'Active'        },
];

const riskBadge = (risk) => {
  switch (risk) {
    case 'Critical': return 'badge-critical';
    case 'High':     return 'badge-high';
    case 'Medium':   return 'badge-medium';
    default:         return 'badge-neutral';
  }
};

const statusDot = (status) => {
  if (status === 'Closed') return 'bg-text-muted';
  if (status === 'Active') return 'bg-success glow-success';
  return 'bg-warning';
};

export default function CrimeTablePlaceholder() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2/30">
        <h3 className="section-title text-sm">Recent Case Intake</h3>
        <button className="btn-secondary btn-sm">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Recent crime cases">
          <thead>
            <tr>
              {['Case ID', 'Category', 'Jurisdiction', 'Date Logged', 'AI Risk', 'Status', ''].map(h => (
                <th key={h} className="table-header">
                  {h && (
                    <span className="flex items-center gap-1 cursor-pointer hover:text-text-primary transition-colors select-none">
                      {h}
                      {!['Status', ''].includes(h) && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="table-row"
              >
                <td className="table-cell font-mono text-xs font-medium text-text-primary">{row.id}</td>
                <td className="table-cell">{row.category}</td>
                <td className="table-cell text-text-secondary">{row.district}</td>
                <td className="table-cell text-text-muted">{row.date}</td>
                <td className="table-cell">
                  <span className={`badge ${riskBadge(row.risk)}`}>{row.risk}</span>
                </td>
                <td className="table-cell">
                  <span className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className={`status-dot ${statusDot(row.status)}`} />
                    {row.status}
                  </span>
                </td>
                <td className="table-cell">
                  <button className="btn-ghost btn-icon" aria-label={`More options for ${row.id}`}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-2/20">
        <p className="text-xs text-text-muted">Showing 5 of 1,248 records</p>
        <div className="flex gap-1">
          <button className="btn-ghost btn-sm text-xs">Prev</button>
          <button className="btn-ghost btn-sm text-xs">Next</button>
        </div>
      </div>
    </div>
  );
}
