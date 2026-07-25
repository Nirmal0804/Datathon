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
  if (status === 'Closed') return 'bg-slate-400';
  if (status === 'Active') return 'bg-[#15803D] shadow-[0_0_8px_rgba(21,128,61,0.4)] animate-pulse';
  if (status === 'Under Review') return 'bg-[#1E3A8A]';
  return 'bg-[#B45309]';
};

export default function CrimeTablePlaceholder({ data }) {
  const cases = data || [];

  // Table states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('rawDate'); // default sort by date
  const [sortDirection, setSortDirection] = useState('desc'); // default latest first
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null); // for Case Detail Modal
  const itemsPerPage = 6;

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
    <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-7 sm:p-8 shadow-sm flex flex-col h-[400px] justify-between overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-6 py-4 border-b border-[#E7EAF0] bg-slate-50">
        <div>
          <h3 className="section-title text-[15px] font-extrabold text-[#0F172A] tracking-tight">Recent Intelligence Records</h3>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time case intakes</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search FIR, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 text-[12px] h-9 w-44 sm:w-64 border-transparent shadow-sm"
              aria-label="Search cases table"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button onClick={exportCSV} className="btn-secondary h-9 gap-2 px-4 shadow-sm" title="Export matching records">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-[12px]">Export</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
        <table className="w-full text-left" aria-label="Recent crime cases">
          <thead>
            <tr className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              {[
                { label: 'Case ID', field: 'id' },
                { label: 'Category', field: 'category' },
                { label: 'Jurisdiction', field: 'district' },
                { label: 'Date Logged', field: 'rawDate' },
                { label: 'AI Risk', field: 'risk' },
                { label: 'Status', field: 'status' },
                { label: '', field: null }
              ].map((h, i) => (
                <th key={i} className="table-header !py-2">
                  {h.label && (
                    <button
                      onClick={() => h.field && handleSort(h.field)}
                      className={`flex items-center gap-2 text-left w-full h-full hover:text-[#0F172A] transition-colors ${h.field ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
                    >
                      {h.label}
                      {h.field && (
                        <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity ${sortField === h.field ? 'opacity-100 text-[#0F172A]' : 'opacity-30'}`} />
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
                <td colSpan="7" className="text-center py-16 text-slate-500 text-[13px] font-medium">
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
                  <td className="table-cell !px-6 !py-2 font-mono text-[11px] font-extrabold text-[#1E3A8A]">{row.id}</td>
                  <td className="table-cell !px-6 !py-2 font-bold text-[#0F172A] text-[13px]">{row.category}</td>
                  <td className="table-cell !px-6 !py-2">
                    <p className="text-[#0F172A] font-bold text-[12px]">{row.policeStation}</p>
                    <p className="text-slate-500 font-medium text-[11px] mt-0.5">{row.district}</p>
                  </td>
                  <td className="table-cell !px-6 !py-2 text-[12px] font-medium text-slate-500">{row.date}</td>
                  <td className="table-cell !px-6 !py-2">
                    <span className={`badge ${riskBadge(row.risk)} !py-0.5 !px-2 text-[9px]`}>{row.risk}</span>
                  </td>
                  <td className="table-cell !px-6 !py-2">
                    <span className="flex items-center gap-2 text-[11px] text-[#0F172A] font-bold uppercase tracking-widest">
                      <span className={`w-2 h-2 rounded-full shadow-sm ${statusDot(row.status)}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="table-cell !px-6 !py-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedCase(row)} 
                      className="btn-ghost btn-icon hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
                      aria-label={`View details of ${row.id}`}
                    >
                      <MoreHorizontal className="w-4 h-4 text-slate-400 hover:text-[#0F172A]" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-[#E7EAF0] bg-white shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Showing <span className="font-extrabold text-[#0F172A]">{sortedCases.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-extrabold text-[#0F172A]">{Math.min(currentPage * itemsPerPage, sortedCases.length)}</span> of <span className="font-extrabold text-[#0F172A]">{sortedCases.length}</span> cases
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn-secondary h-7 px-3 text-[10px] uppercase tracking-widest shadow-sm rounded-lg"
          >
            Prev
          </button>
          <div className="flex items-center px-2 text-[11px] font-bold text-slate-500">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary h-7 px-3 text-[10px] uppercase tracking-widest shadow-sm rounded-lg"
          >
            Next
          </button>
        </div>
      </div>

      {/* CASE DETAIL DIALOG OVERLAY */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E7EAF0] rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between px-8 py-6 bg-[#F7F8FA] border-b border-[#E7EAF0]">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-[#0F172A] font-mono tracking-tight">{selectedCase.id}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Case Intelligence Brief</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-2 rounded-xl bg-white border border-[#E7EAF0] text-slate-400 hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                {/* Meta details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F7F8FA] p-5 rounded-2xl border border-[#E7EAF0]">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Classification</span>
                    <span className="text-[13px] font-extrabold text-[#0F172A] mt-1 block">{selectedCase.category}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jurisdiction</span>
                    <span className="text-[13px] font-extrabold text-[#0F172A] mt-1 block">{selectedCase.policeStation}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logged Date</span>
                    <span className="text-[13px] font-extrabold text-[#0F172A] mt-1 block">{selectedCase.date}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Risk / Status</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`badge ${riskBadge(selectedCase.risk)} py-0 px-2`}>{selectedCase.risk}</span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F172A]">
                        <span className={`w-2 h-2 rounded-full ${statusDot(selectedCase.status)} shadow-sm`} />
                        {selectedCase.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment brief */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 border border-[#E7EAF0] rounded-2xl flex items-center gap-4 bg-white shadow-sm">
                    <div className="p-3 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-xl">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investigator</span>
                      <span className="text-[14px] font-extrabold text-[#0F172A] mt-0.5 block">{selectedCase.details.officer}</span>
                    </div>
                  </div>
                  <div className="p-5 border border-[#E7EAF0] rounded-2xl flex items-center gap-4 bg-white shadow-sm">
                    <div className="p-3 bg-[#C79A2B]/10 text-[#C79A2B] rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Penal Code</span>
                      <span className="text-[14px] font-extrabold text-[#0F172A] font-mono mt-0.5 block">{selectedCase.details.section}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Summary */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Case Incident Narrative</h5>
                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed bg-[#F7F8FA] p-5 rounded-2xl border border-[#E7EAF0]">
                    {selectedCase.details.summary}
                  </p>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Historical System Logs</h5>
                  <div className="relative border-l-2 border-[#E7EAF0] ml-3 space-y-6">
                    {selectedCase.details.timeline.map((item, idx) => (
                      <div key={idx} className="relative pl-6">
                        {/* Timeline Node */}
                        <div className="absolute left-[-7px] top-1.5 w-3 h-3 rounded-full bg-[#1E3A8A] border-2 border-white shadow-sm" />
                        <div className="text-[13px]">
                          <span className="font-extrabold text-[#0F172A] font-mono flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.date}
                          </span>
                          <p className="text-slate-500 font-medium mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="px-8 py-5 bg-[#F7F8FA] border-t border-[#E7EAF0] flex justify-end">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="btn-primary"
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
