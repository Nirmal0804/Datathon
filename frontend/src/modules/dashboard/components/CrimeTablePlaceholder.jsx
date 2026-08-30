import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Download, ArrowUpDown, Search, X, Calendar, Shield, User, FileText, Clock, FolderOpen, Search as SearchIcon, CheckCircle2, ChevronDown } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';
import { useDateTimeFormatter } from '../../../utils/dateTime';
import { useTranslation } from '../../../i18n';

const riskBadge = (risk) => {
  switch (risk) {
    case 'Critical': return 'bg-rose-50 text-rose-600 border border-rose-200';
    case 'High':     return 'bg-amber-50 text-amber-600 border border-amber-200';
    case 'Medium':   return 'bg-sky-50 text-sky-600 border border-sky-200';
    default:         return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
  }
};

const statusDot = (status) => {
  if (status === 'Closed') return 'bg-slate-400';
  if (status === 'Active') return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse';
  if (status === 'Under Review') return 'bg-blue-500';
  if (status === 'Investigating') return 'bg-amber-500';
  return 'bg-amber-500';
};

export default function CrimeTablePlaceholder({ data, itemsPerPage: customItemsPerPage, title, subtitle }) {
  const cases = data || [];
  const { formatDate } = useDateTimeFormatter();
  const { t } = useTranslation();

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'Cybercrime': return t('categories.cybercrime', 'Cybercrime');
      case 'Property Theft': return t('categories.propertyTheft', 'Property Theft');
      case 'Violent Crime': return t('categories.violentCrime', 'Violent Crime');
      case 'Financial Fraud': return t('categories.financialFraud', 'Financial Fraud');
      case 'Narcotics': return t('categories.narcotics', 'Narcotics');
      case 'Crime Against Women': return t('categories.crimeAgainstWomen', 'Crime Against Women');
      default: return cat;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Active': return t('cases.statusActive', 'Active');
      case 'Investigating': return t('cases.statusInvestigating', 'Investigating');
      case 'Under Review': return t('cases.statusUnderReview', 'Under Review');
      case 'Closed': return t('cases.statusClosed', 'Closed');
      case 'Open': return t('cases.statusOpen', 'Open');
      default: return status;
    }
  };

  // Table states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('rawDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null); // which row's dropdown is open
  const [caseStatuses, setCaseStatuses] = useState({}); // override statuses per case id
  const [actionFeedback, setActionFeedback] = useState(null); // { id, label } for the last action taken
  const menuRef = useRef(null);
  const itemsPerPage = customItemsPerPage || 6;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Action handler: update status locally
  const handleCaseAction = (e, rowId, action) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const statusMap = { open: 'Active', investigate: 'Investigating', close: 'Closed' };
    const labelMap  = { open: 'Case Opened', investigate: 'Investigating', close: 'Case Closed' };
    setCaseStatuses(prev => ({ ...prev, [rowId]: statusMap[action] }));
    setActionFeedback({ id: rowId, label: labelMap[action] });
    setTimeout(() => setActionFeedback(null), 3000);
  };

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
  }, [sortedCases, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedCases.length / itemsPerPage) || 1;

  const handleSort = (field) => {
    if (sortField === field) {
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
    <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm flex flex-col min-h-[560px] justify-between overflow-hidden">
      {/* 3. Improved Table Header & Toolbar (One Clean Horizontal Row) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-[#E7ECF3] bg-[#F8F9FB]">
        <div>
          <h3 className="text-base font-black text-[#0F172A] tracking-tight">{title || t('dashboard.recentRecords', 'Recent Intelligence Records')}</h3>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">{subtitle || t('dashboard.recentSubtitle', 'Real-time case intakes')}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('dashboard.searchPlaceholder', 'Search FIR, category, district...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 h-10 pl-10 pr-8 bg-white border border-[#E7ECF3] text-[#0F172A] text-xs font-semibold rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all shadow-xs placeholder:text-slate-400 font-sans"
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

          <button 
            onClick={exportCSV} 
            className="h-10 px-4 rounded-[14px] bg-[#0B1F4D] text-white hover:bg-[#143275] font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2" 
            title="Export matching records"
          >
            <Download className="w-4 h-4 text-[#C79A2B]" />
            <span className="hidden sm:inline">{t('common.export', 'Export')}</span>
          </button>
        </div>
      </div>

      {/* 4. Table Element with Sticky Header & Row Hover Effects */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
        <table className="w-full text-left border-collapse" aria-label="Recent crime cases">
          <thead>
            <tr className="sticky top-0 bg-[#F8F9FB] z-10 border-b border-[#E7ECF3]">
              {[
                { label: t('cases.firId', 'Case ID'), field: 'id' },
                { label: t('cases.classification', 'Category'), field: 'category' },
                { label: t('cases.jurisdiction', 'Jurisdiction'), field: 'district' },
                { label: t('cases.loggedDate', 'Date Logged'), field: 'rawDate' },
                { label: t('cases.aiRisk', 'AI Risk'), field: 'risk' },
                { label: t('common.status', 'Status'), field: 'status' },
                { label: '', field: null }
              ].map((h, i) => (
                <th key={i} className="py-3.5 px-6 font-bold text-xs text-[#0F172A] uppercase tracking-wider text-left bg-[#F8F9FB]">
                  {h.label && (
                    <button
                      onClick={() => h.field && handleSort(h.field)}
                      className={`flex items-center gap-2 text-left w-full h-full hover:text-[#0B1F4D] transition-colors ${h.field ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
                    >
                      {h.label}
                      {h.field && (
                        <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity ${sortField === h.field ? 'opacity-100 text-[#0B1F4D]' : 'opacity-30'}`} />
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7ECF3]/60">
            {paginatedCases.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 px-4">
                  <EmptyState
                    type={searchQuery ? 'search' : 'filters'}
                    onAction={searchQuery ? () => setSearchQuery('') : null}
                    actionLabel={t('cases.resetFilters', 'Clear Search')}
                  />
                </td>
              </tr>
            ) : (
              paginatedCases.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedCase(row)}
                  className="h-14 border-b border-[#E7ECF3]/60 hover:bg-[#F8F9FB]/80 transition-colors duration-150 cursor-pointer align-middle"
                >
                  <td className="px-6 py-3.5 align-middle font-mono text-xs font-extrabold text-[#0B1F4D]">{row.id}</td>
                  <td className="px-6 py-3.5 align-middle font-bold text-[#0F172A] text-xs">{getCategoryLabel(row.category)}</td>
                  <td className="px-6 py-3.5 align-middle">
                    <p className="text-[#0F172A] font-bold text-xs">{row.policeStation}</p>
                    <p className="text-[#64748B] font-semibold text-[11px] mt-0.5">{row.district}</p>
                  </td>
                  <td className="px-6 py-3.5 align-middle text-xs font-medium text-[#64748B]">{formatDate(row.rawDate || row.date)}</td>
                  <td className="px-6 py-3.5 align-middle">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[11px] ${riskBadge(row.risk)}`}>
                      {row.risk === 'Critical' ? t('common.critical', 'Critical') : row.risk === 'High' ? t('common.high', 'High') : row.risk === 'Medium' ? t('common.medium', 'Medium') : t('common.low', 'Low')}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 align-middle">
                    <span className="inline-flex items-center gap-2 text-xs text-[#0F172A] font-bold">
                      <span className={`w-2 h-2 rounded-full ${statusDot(caseStatuses[row.id] || row.status)}`} />
                      {getStatusLabel(caseStatuses[row.id] || row.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block" ref={openMenuId === row.id ? menuRef : null}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id); }}
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center text-slate-400 hover:text-[#0B1F4D] hover:bg-slate-100 transition-colors cursor-pointer ml-auto"
                        aria-label={`Actions for ${row.id}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {openMenuId === row.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-10 z-50 w-48 bg-white border border-[#E7ECF3] rounded-[14px] shadow-xl overflow-hidden"
                          >
                            {/* Open Case */}
                            <button
                              onClick={(e) => handleCaseAction(e, row.id, 'open')}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#0B1F4D] hover:bg-[#F8F9FB] transition-colors text-left cursor-pointer"
                            >
                              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              {t('cases.openCase', 'Open Case')}
                            </button>

                            {/* Investigate */}
                            <button
                              onClick={(e) => handleCaseAction(e, row.id, 'investigate')}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#0B1F4D] hover:bg-[#F8F9FB] transition-colors text-left cursor-pointer"
                            >
                              <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                                <SearchIcon className="w-3.5 h-3.5 text-amber-600" />
                              </div>
                              {t('cases.investigate', 'Investigate')}
                            </button>

                            {/* Divider */}
                            <div className="mx-3 border-t border-[#F1F5F9]" />

                            {/* Close Case */}
                            <button
                              onClick={(e) => handleCaseAction(e, row.id, 'close')}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                            >
                              <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                              </div>
                              {t('cases.closeCase', 'Close Case')}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 6. Improved Pagination Footer */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-[#E7ECF3] bg-[#F8F9FB]/40 shrink-0 rounded-b-[24px]">
        <p className="text-xs font-semibold text-[#64748B]">
          {t('cases.showing', 'Showing')} <span className="font-extrabold text-[#0F172A]">{sortedCases.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> {t('cases.showingTo', 'to')} <span className="font-extrabold text-[#0F172A]">{Math.min(currentPage * itemsPerPage, sortedCases.length)}</span> {t('cases.showingOf', 'of')} <span className="font-extrabold text-[#0F172A]">{sortedCases.length}</span> {t('dashboard.records', 'records')}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="h-9 px-4 rounded-[12px] bg-white border border-[#E7ECF3] font-bold text-xs text-[#0F172A] hover:bg-[#F8F9FB] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
          >
            {t('cases.previous', 'Previous')}
          </button>
          <div className="px-3 text-xs font-bold text-[#0F172A]">
            {t('cases.page', 'Page')} {currentPage} {t('cases.showingOf', 'of')} {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="h-9 px-4 rounded-[12px] bg-white border border-[#E7ECF3] font-bold text-xs text-[#0F172A] hover:bg-[#F8F9FB] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
          >
            {t('cases.next', 'Next')}
          </button>
        </div>
      </div>

      {/* CASE DETAIL DIALOG OVERLAY */}
      <AnimatePresence>
        {selectedCase && (
          <>
            {/* Backdrop — starts below the navbar, never covers it */}
            <div
              className="fixed left-0 right-0 bottom-0 bg-slate-900/60 backdrop-blur-md"
              style={{ top: '68px', zIndex: 1000 }}
              onClick={() => setSelectedCase(null)}
            />

            {/* Modal — positioned above backdrop, also below the navbar */}
            <div
              className="fixed left-0 right-0 bottom-0 flex items-start justify-center overflow-y-auto"
              style={{ top: '68px', zIndex: 1001, paddingTop: '20px', paddingBottom: '24px', paddingLeft: '16px', paddingRight: '16px' }}
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedCase(null); }}
            >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E7EAF0] rounded-[24px] w-full max-w-2xl shadow-2xl relative flex flex-col"
              style={{ maxHeight: 'calc(100vh - 112px)' }}
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between px-8 py-6 bg-[#0B1F4D] border-b border-[#0A192F] flex-shrink-0 rounded-t-[24px]">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-white/10 text-[#C79A2B]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-white font-mono tracking-tight">{selectedCase.id}</h4>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">{t('cases.caseDetailsTitle', 'Case Intelligence Brief')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8 overflow-y-auto flex-1 min-h-0 no-scrollbar">
                {/* Meta details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F7F8FA] p-5 rounded-2xl border border-[#E7EAF0]">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('cases.classification', 'Classification')}</span>
                    <span className="text-[13px] font-extrabold text-[#0F172A] mt-1 block">{getCategoryLabel(selectedCase.category)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('cases.jurisdiction', 'Jurisdiction')}</span>
                    <span className="text-[13px] font-extrabold text-[#0F172A] mt-1 block">{selectedCase.policeStation}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('cases.loggedDate', 'Logged Date')}</span>
                    <span className="text-[13px] font-extrabold text-[#0F172A] mt-1 block">{formatDate(selectedCase.rawDate || selectedCase.date)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('cases.statusRisk', 'AI Risk / Status')}</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`badge ${riskBadge(selectedCase.risk)} py-0 px-2`}>
                        {selectedCase.risk === 'Critical' ? t('common.critical', 'Critical') : selectedCase.risk === 'High' ? t('common.high', 'High') : selectedCase.risk === 'Medium' ? t('common.medium', 'Medium') : t('common.low', 'Low')}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F172A]">
                        <span className={`w-2 h-2 rounded-full ${statusDot(caseStatuses[selectedCase.id] || selectedCase.status)} shadow-sm`} />
                        {getStatusLabel(caseStatuses[selectedCase.id] || selectedCase.status)}
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
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('cases.investigatingOfficer', 'Investigator')}</span>
                      <span className="text-[14px] font-extrabold text-[#0F172A] mt-0.5 block">{selectedCase.details.officer}</span>
                    </div>
                  </div>
                  <div className="p-5 border border-[#E7EAF0] rounded-2xl flex items-center gap-4 bg-white shadow-sm">
                    <div className="p-3 bg-[#C79A2B]/10 text-[#C79A2B] rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('fir.penalCode', 'Penal Code')}</span>
                      <span className="text-[14px] font-extrabold text-[#0F172A] font-mono mt-0.5 block">{selectedCase.details.section}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Summary */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('cases.narrativeSummary', 'Case Incident Narrative')}</h5>
                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed bg-[#F7F8FA] p-5 rounded-2xl border border-[#E7EAF0]">
                    {selectedCase.details.summary}
                  </p>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('cases.historicalLogs', 'Historical System Logs')}</h5>
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

              {/* Footer with action buttons */}
              <div className="px-8 py-5 bg-[#F7F8FA] border-t border-[#E7EAF0] flex items-center justify-between gap-3 flex-shrink-0 rounded-b-[24px]">
                {/* Action feedback badge */}
                <AnimatePresence>
                  {actionFeedback?.id === selectedCase?.id && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {actionFeedback.label}
                    </motion.span>
                  )}
                  {!actionFeedback && <span />}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  {/* Open Case */}
                  <button
                    onClick={(e) => handleCaseAction(e, selectedCase.id, 'open')}
                    className="flex items-center gap-2 h-9 px-4 rounded-[12px] bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" /> {t('cases.startReopen', 'Open')}
                  </button>
                  {/* Investigate */}
                  <button
                    onClick={(e) => handleCaseAction(e, selectedCase.id, 'investigate')}
                    className="flex items-center gap-2 h-9 px-4 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <SearchIcon className="w-3.5 h-3.5" /> {t('cases.investigate', 'Investigate')}
                  </button>
                  {/* Close Case */}
                  <button
                    onClick={(e) => handleCaseAction(e, selectedCase.id, 'close')}
                    className="flex items-center gap-2 h-9 px-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('cases.closeCase', 'Close Case')}
                  </button>
                  {/* Dismiss */}
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="h-9 px-4 rounded-[12px] bg-[#0B1F4D] text-white font-bold text-xs hover:bg-[#0B1F4D]/90 transition-colors cursor-pointer"
                  >
                    {t('common.close', 'Dismiss')}
                  </button>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
