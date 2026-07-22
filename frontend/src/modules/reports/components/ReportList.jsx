import React from 'react';
import { FileText, BarChart2, Map, Network, Download, Eye, MoreHorizontal, Clock } from 'lucide-react';

const iconMap = {
  'Crime Summary': FileText,
  'District Report': BarChart2,
  'Hotspot Analysis': Map,
  'Network Analysis': Network,
  'Predictive Risk': BarChart2,
};

const reports = [
  { id: 'RPT-2023-0042', title: 'Statewide Monthly Crime Summary', type: 'Crime Summary', district: 'All Karnataka', generated: '2023-10-24', size: '2.4 MB', status: 'Ready', pages: 48 },
  { id: 'RPT-2023-0041', title: 'Bengaluru South District Intelligence', type: 'District Report', district: 'Bengaluru South', generated: '2023-10-22', size: '1.1 MB', status: 'Ready', pages: 24 },
  { id: 'RPT-2023-0040', title: 'Q3 Hotspot Migration Analysis', type: 'Hotspot Analysis', district: 'Hubballi-Dharwad', generated: '2023-10-20', size: '3.8 MB', status: 'Ready', pages: 62 },
  { id: 'RPT-2023-0039', title: 'Cyber Syndicate Network Map', type: 'Network Analysis', district: 'Bengaluru City', generated: '2023-10-18', size: '890 KB', status: 'Processing', pages: null },
  { id: 'RPT-2023-0038', title: 'Festival Season Predictive Risk Model', type: 'Predictive Risk', district: 'All Karnataka', generated: '2023-10-15', size: '1.6 MB', status: 'Ready', pages: 31 },
  { id: 'RPT-2023-0037', title: 'Mysuru District Q3 Summary', type: 'District Report', district: 'Mysuru', generated: '2023-10-10', size: '980 KB', status: 'Ready', pages: 19 },
];

export default function ReportList({ searchQuery, onSelect, selectedId }) {
  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No reports found matching your search.</p>
        </div>
      )}
      {filtered.map((report) => {
        const Icon = iconMap[report.type] || FileText;
        const isSelected = report.id === selectedId;
        return (
          <div
            key={report.id}
            onClick={() => onSelect(report)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              isSelected
                ? 'bg-primary/5 border-primary/40 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white truncate">{report.title}</h4>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 hover:text-white shrink-0 p-1 rounded hover:bg-slate-700"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="text-slate-400">{report.type}</span>
                  <span>•</span>
                  <span>{report.district}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{report.generated}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  report.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {report.status}
                </span>
                {report.pages && <span className="text-xs text-slate-500">{report.pages} pages</span>}
                <span className="text-xs text-slate-500">{report.size}</span>
              </div>
              {report.status === 'Ready' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(report); }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-primary hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
