import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Download, ArrowUpDown, Search, X, Calendar, Shield, User, FileText, Clock } from 'lucide-react';

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
  if (status === 'Under Review') return 'bg-info';
  return 'bg-warning animate-pulse-soft';
};

export default function CrimeTablePlaceholder({ data }) {
  const cases = data || [];

  // Table states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('rawDate'); // default sort by date
  const [sortDirection, setSortDirection] = useState('desc'); // default latest first
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null); // for Case Detail Modal
  const itemsPerPage = 5;

  // 1. Filtering based on search query
  const filteredCases = useMemo(() => {
    setCurrentPage(1); // reset to page 1 on search
    if (!searchQuery.trim()) return cases;
    
    const query = searchQuery.toLowerCase();
    return cases.filter(c => 
      c.id.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.district.toLowerCase().includes(query) ||
      c.policeStation.toLowerCase().includes(query) ||
      c.status.toLowerCase().includes(query)
    );
  }, [cases, searchQuery]);

  // 2. Sorting
  const sortedCases = useMemo(() => {
    if (!sortField) return filteredCases;

    return [...filteredCases].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined
      if (aVal === undefined) aVal = '';
      if (bVal === undefined) bVal = '';

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCases, sortField, sortDirection]);

  // 3. Pagination
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCases.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCases, currentPage]);

  const totalPages = Math.ceil(sortedCases.length / itemsPerPage) || 1;

  const handleSort = (field) => {
    if (sortField === field) {
      // cycle: asc -> desc -> no sort
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportCSV = () => {
    const headers = 'FIR ID,Category,District,Police Station,Date Logged,Risk Level,Status\n';
    const csvContent = sortedCases.map(c => 
      `"${c.id}","${c.category}","${c.district}","${c.policeStation}","${c.date}","${c.risk}","${c.status}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `karnataka_crime_data_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card overflow-hidden flex flex-col h-[390px] justify-between">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-4 py-2.5 border-b border-border bg-surface-2/30">
        <div>
          <h3 className="section-title text-sm">Recent Intelligence Records</h3>
          <p className="text-2xs text-text-secondary mt-0.5">Real-time case intakes matched by filters.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search FIR, category, station…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs h-7.5 w-44 sm:w-56"
              aria-label="Search cases table"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button onClick={exportCSV} className="btn-secondary btn-sm h-7.5 gap-1.5" title="Export matching records">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
        <table className="w-full text-left" aria-label="Recent crime cases">
          <thead>
            <tr className="sticky top-0 bg-slate-900 z-10">
              {[
                { label: 'Case ID', field: 'id' },
                { label: 'Category', field: 'category' },
                { label: 'Jurisdiction', field: 'district' },
                { label: 'Date Logged', field: 'rawDate' },
                { label: 'AI Risk', field: 'risk' },
                { label: 'Status', field: 'status' },
                { label: '', field: null }
              ].map((h, i) => (
                <th key={i} className="table-header p-0">
                  {h.label && (
                    <button
                      onClick={() => h.field && handleSort(h.field)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-left w-full h-full font-semibold hover:text-white transition-colors ${h.field ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
                    >
                      {h.label}
                      {h.field && (
                        <ArrowUpDown className={`w-3 h-3 transition-opacity ${sortField === h.field ? 'opacity-100 text-primary' : 'opacity-40'}`} />
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedCases.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16 text-slate-500 text-sm">
                  No cases found matching query.
                </td>
              </tr>
            ) : (
              paginatedCases.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedCase(row)}
                  className="table-row cursor-pointer"
                >
                  <td className="table-cell !px-4 !py-2 font-mono text-2xs font-semibold text-primary">{row.id}</td>
                  <td className="table-cell !px-4 !py-2 font-medium text-slate-200 text-xs">{row.category}</td>
                  <td className="table-cell !px-4 !py-2 text-2xs">
                    <p className="text-slate-300 font-medium">{row.policeStation}</p>
                    <p className="text-slate-500">{row.district}</p>
                  </td>
                  <td className="table-cell !px-4 !py-2 text-2xs text-slate-400">{row.date}</td>
                  <td className="table-cell !px-4 !py-2">
                    <span className={`badge ${riskBadge(row.risk)} !py-0 !px-1.5 text-3xs`}>{row.risk}</span>
                  </td>
                  <td className="table-cell !px-4 !py-2">
                    <span className="flex items-center gap-2 text-2xs text-slate-300 font-medium">
                      <span className={`status-dot w-1.5 h-1.5 ${statusDot(row.status)}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="table-cell !px-4 !py-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedCase(row)} 
                      className="btn-ghost btn-icon hover:bg-slate-800 rounded-md p-1"
                      aria-label={`View details of ${row.id}`}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface-2/20 shrink-0">
        <p className="text-2xs text-slate-500">
          Showing <span className="font-semibold text-slate-300">{sortedCases.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-slate-300">{Math.min(currentPage * itemsPerPage, sortedCases.length)}</span> of <span className="font-semibold text-slate-300">{sortedCases.length}</span> cases
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn-secondary btn-sm h-6 px-2 text-3xs font-medium"
          >
            Prev
          </button>
          <div className="flex items-center px-1 text-3xs font-mono text-slate-500">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary btn-sm h-6 px-2 text-3xs font-medium"
          >
            Next
          </button>
        </div>
      </div>

      {/* CASE DETAIL DIALOG OVERLAY */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="text-base font-bold text-white font-mono">{selectedCase.id}</h4>
                    <p className="text-3xs font-semibold text-slate-500 uppercase tracking-widest">Case Intelligence Brief</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1 rounded-md bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                {/* Meta details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800/50">
                  <div>
                    <span className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Classification</span>
                    <span className="text-xs font-semibold text-slate-200">{selectedCase.category}</span>
                  </div>
                  <div>
                    <span className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Jurisdiction</span>
                    <span className="text-xs font-semibold text-slate-200">{selectedCase.policeStation}</span>
                  </div>
                  <div>
                    <span className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Logged Date</span>
                    <span className="text-xs font-semibold text-slate-200">{selectedCase.date}</span>
                  </div>
                  <div>
                    <span className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">AI Risk / Status</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge ${riskBadge(selectedCase.risk)} py-0 px-1.5`}>{selectedCase.risk}</span>
                      <span className="flex items-center gap-1 text-2xs text-slate-300">
                        <span className={`status-dot w-1.5 h-1.5 ${statusDot(selectedCase.status)}`} />
                        {selectedCase.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment brief */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-800 rounded-lg flex items-center gap-3 bg-slate-800/20">
                    <User className="w-8 h-8 text-indigo-400 bg-indigo-500/10 p-2 rounded-lg" />
                    <div>
                      <span className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Investigator</span>
                      <span className="text-sm font-semibold text-white">{selectedCase.details.officer}</span>
                    </div>
                  </div>
                  <div className="p-4 border border-slate-800 rounded-lg flex items-center gap-3 bg-slate-800/20">
                    <FileText className="w-8 h-8 text-amber-400 bg-amber-500/10 p-2 rounded-lg" />
                    <div>
                      <span className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Penal Code Section</span>
                      <span className="text-sm font-semibold text-white font-mono">{selectedCase.details.section}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Summary */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Case Incident Narrative</h5>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-800/50">
                    {selectedCase.details.summary}
                  </p>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical System Logs</h5>
                  <div className="relative border-l border-slate-800 ml-2 space-y-4">
                    {selectedCase.details.timeline.map((item, idx) => (
                      <div key={idx} className="relative pl-6">
                        {/* Timeline Node */}
                        <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-slate-900" />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" /> {item.date}
                          </span>
                          <p className="text-slate-400 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="btn-secondary btn-sm px-5"
                >
                  Dismiss Briefing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
