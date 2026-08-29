import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, RefreshCw, Download, ChevronRight, Zap, AlertTriangle, Info, ShieldCheck, Filter } from 'lucide-react';
import { MOCK_ALERTS } from './mockData';

const severityStripColor = (type) => {
  switch (type) {
    case 'critical': return 'bg-rose-500';
    case 'warning':  return 'bg-amber-500';
    case 'info':     return 'bg-sky-500';
    default:         return 'bg-emerald-500';
  }
};

const severityBadgeClass = (type) => {
  switch (type) {
    case 'critical': return 'bg-rose-50 text-rose-600 border border-rose-200';
    case 'warning':  return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'info':     return 'bg-sky-50 text-sky-700 border border-sky-200';
    default:         return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
};

const severityLabel = (type) => {
  switch (type) {
    case 'critical': return 'CRITICAL';
    case 'warning':  return 'HIGH';
    case 'info':     return 'MEDIUM';
    default:         return 'NORMAL';
  }
};

const severityIcon = (type) => {
  switch (type) {
    case 'critical': return <Zap className="w-5 h-5 text-rose-600" />;
    case 'warning':  return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    case 'info':     return <Info className="w-5 h-5 text-sky-600" />;
    default:         return <Bell className="w-5 h-5 text-emerald-600" />;
  }
};

export default function FieldOfficerAlerts() {
  const [alertsList] = useState(MOCK_ALERTS || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Compute KPI Stats
  const kpis = useMemo(() => {
    const critical = alertsList.filter(a => a.type === 'critical').length;
    const high = alertsList.filter(a => a.type === 'warning').length;
    const active = alertsList.length;
    return { critical, high, active, avgResponse: '< 4 min' };
  }, [alertsList]);

  // Filter & Sort logic
  const filteredAlerts = useMemo(() => {
    setCurrentPage(1);
    let result = [...alertsList];

    if (selectedSeverity !== 'all') {
      result = result.filter(a => a.type === selectedSeverity);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.desc && a.desc.toLowerCase().includes(q)) ||
        (a.time && a.time.toLowerCase().includes(q))
      );
    }

    if (sortOrder === 'oldest') {
      result.reverse();
    }

    return result;
  }, [alertsList, searchQuery, selectedSeverity, sortOrder]);

  const paginatedAlerts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAlerts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAlerts, currentPage]);

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage) || 1;

  const exportAlertsCSV = () => {
    const headers = 'Title,Severity,Description,Timestamp,Status\n';
    const csvContent = filteredAlerts.map(a => 
      `"${a.title}","${a.type}","${a.desc}","${a.time}","Open"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `operations_alerts_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      {/* 1. Compact Page Header Banner */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[80px] shrink-0">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#C79A2B]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">Operations Alerts Feed</h2>
              <span className="bg-[#0B1F4D]/10 text-[#0B1F4D] border border-[#0B1F4D]/20 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] sm:text-xs">
                {alertsList.length} Active Feeds
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              Precinct bulletins, automated anomaly streams, and local BOLOs.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#F0FDF4] border border-[#DCFCE7] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#166534]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Duty Status: Active On-Field</span>
        </div>
      </div>

      {/* 2. Alert Statistics KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">Critical Alerts</p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight mt-1">{kpis.critical}</h3>
          </div>
          <div className="w-10 h-10 rounded-[14px] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-extrabold">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">High Priority</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight mt-1">{kpis.high}</h3>
          </div>
          <div className="w-10 h-10 rounded-[14px] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-extrabold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">Active Feeds</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-1">{kpis.active}</h3>
          </div>
          <div className="w-10 h-10 rounded-[14px] bg-[#0B1F4D]/10 border border-[#0B1F4D]/20 flex items-center justify-center text-[#0B1F4D] font-extrabold">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">Avg Response Time</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight mt-1">{kpis.avgResponse}</h3>
          </div>
          <div className="w-10 h-10 rounded-[14px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Compact Horizontal Toolbar */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4 min-h-[60px]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by keyword, title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-8 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-xs font-semibold rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all placeholder:text-slate-400 font-sans"
          />
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Severity Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="h-10 px-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#0B1F4D] cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">High Priority</option>
              <option value="info">Medium / Low</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-10 px-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#0B1F4D] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Refresh Button */}
          <button 
            onClick={() => { setSearchQuery(''); setSelectedSeverity('all'); }} 
            className="h-10 w-10 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] hover:bg-[#0B1F4D] hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export Button */}
          <button 
            onClick={exportAlertsCSV} 
            className="h-10 px-4 rounded-[14px] bg-[#0B1F4D] text-white hover:bg-[#143275] font-extrabold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            title="Export Alerts Data"
          >
            <Download className="w-4 h-4 text-[#C79A2B]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 4 & 5. Intelligence Feed: Modern Horizontal Alert Rows (~90px height) */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-4">
          <h3 className="text-base font-black text-[#0F172A] tracking-tight">Live Intelligence Stream</h3>
          <span className="text-xs font-semibold text-[#64748B]">Showing {paginatedAlerts.length} of {filteredAlerts.length} feeds</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {paginatedAlerts.length === 0 ? (
              <div className="p-12 text-center text-[#64748B] text-xs font-semibold bg-[#F8F9FB] rounded-[20px] border border-[#E7ECF3]">
                No operations alerts match your filter criteria.
              </div>
            ) : (
              paginatedAlerts.map((alert, i) => (
                <motion.div
                  key={alert.title + i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="bg-white rounded-[20px] border border-[#E7ECF3] p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                >
                  {/* Left Colored Vertical Severity Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${severityStripColor(alert.type)}`} />

                  {/* Left: Severity Icon + Title + Description */}
                  <div className="flex items-center gap-4 pl-2">
                    <div className="w-10 h-10 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center shrink-0 shadow-xs">
                      {severityIcon(alert.type)}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-[#0F172A] tracking-tight hover:text-[#0B1F4D] transition-colors">
                        {alert.title}
                      </h4>
                      <p className="text-xs font-semibold text-[#64748B] mt-0.5 line-clamp-1 max-w-2xl">
                        {alert.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right: Timestamp + Pill Badges + Chevron */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <span className="text-xs font-semibold text-[#64748B] mr-1">{alert.time}</span>

                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-extrabold text-[10px] tracking-wider ${severityBadgeClass(alert.type)}`}>
                      {severityLabel(alert.type)}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      OPEN
                    </span>

                    <ChevronRight className="w-5 h-5 text-slate-400 ml-1" />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* 6. Clean Pagination Footer */}
        <div className="flex items-center justify-between px-2 pt-4 border-t border-[#E7ECF3]">
          <p className="text-xs font-semibold text-[#64748B]">
            Showing <span className="font-extrabold text-[#0F172A]">{filteredAlerts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-extrabold text-[#0F172A]">{Math.min(currentPage * itemsPerPage, filteredAlerts.length)}</span> of <span className="font-extrabold text-[#0F172A]">{filteredAlerts.length}</span> alerts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9 px-4 rounded-[12px] bg-white border border-[#E7ECF3] font-bold text-xs text-[#0F172A] hover:bg-[#F8F9FB] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
            >
              Previous
            </button>
            <div className="px-3 text-xs font-bold text-[#0F172A]">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-9 px-4 rounded-[12px] bg-white border border-[#E7ECF3] font-bold text-xs text-[#0F172A] hover:bg-[#F8F9FB] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
