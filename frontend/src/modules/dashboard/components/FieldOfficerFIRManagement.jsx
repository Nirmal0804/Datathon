import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, X, ChevronRight, ShieldCheck, Shield, User, Clock, FolderOpen, CheckCircle2 } from 'lucide-react';
import { MOCK_CASES } from './mockData';
import { useToast } from '../../../components/ui/Toast';

const riskBadgeClass = (risk) => {
  switch (risk) {
    case 'Critical': return 'bg-rose-50 text-rose-600 border border-rose-200';
    case 'High':     return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Medium':   return 'bg-sky-50 text-sky-700 border border-sky-200';
    default:         return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'Active':        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Closed':        return 'bg-slate-100 text-slate-600 border border-slate-200';
    case 'Investigating': return 'bg-amber-50 text-amber-700 border border-amber-200';
    default:              return 'bg-blue-50 text-blue-700 border border-blue-200';
  }
};

const statusDotClass = (status) => {
  switch (status) {
    case 'Active':        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse';
    case 'Closed':        return 'bg-slate-400';
    case 'Investigating': return 'bg-amber-500';
    default:              return 'bg-blue-500';
  }
};

export default function FieldOfficerFIRManagement() {
  const { addToast } = useToast();
  const [localCases, setLocalCases] = useState(MOCK_CASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [registerModal, setRegisterModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseStatuses, setCaseStatuses] = useState({});
  const [actionFeedback, setActionFeedback] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleCaseAction = (e, rowId, action) => {
    if (e) e.stopPropagation();
    const statusMap = { open: 'Active', investigate: 'Investigating', close: 'Closed' };
    const labelMap  = { open: 'Case Active', investigate: 'Investigating', close: 'Case Closed' };
    const newStatus = statusMap[action];

    setCaseStatuses(prev => ({ ...prev, [rowId]: newStatus }));
    setLocalCases(prev => prev.map(c => c.id === rowId ? { ...c, status: newStatus } : c));
    setActionFeedback({ id: rowId, label: labelMap[action] });
    
    if (selectedCase && selectedCase.id === rowId) {
      setSelectedCase(prev => ({ ...prev, status: newStatus }));
    }

    addToast({
      title: 'Status Updated',
      message: `FIR ${rowId} status updated to ${newStatus}`,
      type: action === 'close' ? 'warning' : 'success'
    });
  };

  // Form State
  const [firForm, setFirForm] = useState({
    category: 'Cybercrime',
    district: 'Bengaluru City',
    policeStation: 'Cubbon Park PS',
    complainant: '',
    section: 'Section 379 IPC',
    description: '',
    risk: 'Medium'
  });

  const filteredCases = useMemo(() => {
    setCurrentPage(1);
    if (!searchQuery.trim()) return localCases;
    const q = searchQuery.toLowerCase();
    return localCases.filter(c => 
      c.id.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.policeStation.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }, [localCases, searchQuery]);

  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCases, currentPage]);

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;

  const handleRegister = (e) => {
    e.preventDefault();
    if (!firForm.complainant || !firForm.description) {
      addToast({ title: 'Validation Error', message: 'Required fields missing.', type: 'danger' });
      return;
    }
    const newId = `FIR-2026-${1000 + localCases.length + 1}`;
    const newCase = {
      id: newId,
      category: firForm.category,
      district: firForm.district,
      policeStation: firForm.policeStation,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      rawDate: new Date(),
      risk: firForm.risk,
      status: 'Active',
      arrests: 0,
      details: {
        officer: 'Inspector Patil',
        section: firForm.section,
        summary: firForm.description,
        timeline: [
          { date: 'FIR Logged', desc: `Complainant: ${firForm.complainant}. Registered by Officer Patil.` }
        ]
      }
    };

    setLocalCases(prev => [newCase, ...prev]);
    setRegisterModal(false);
    setFirForm({
      category: 'Cybercrime',
      district: 'Bengaluru City',
      policeStation: 'Cubbon Park PS',
      complainant: '',
      section: 'Section 379 IPC',
      description: '',
      risk: 'Medium'
    });
    addToast({ title: 'FIR Logged', message: `FIR ${newId} registered at Cubbon Park PS.`, type: 'success' });
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      {/* 1. Compact Page Header Banner */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[80px] shrink-0">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-[#E00000] text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">FIR Management</h2>
              <span className="bg-[#E00000]/10 text-[#E00000] border border-[#E00000]/20 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] sm:text-xs">
                {localCases.length} Active Records
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              Register new incident complaints and view precinct intake logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
          <div className="hidden md:flex items-center gap-2 bg-[#F0FDF4] border border-[#DCFCE7] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#166534]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Duty Status: Active On-Field</span>
          </div>

          <button 
            onClick={() => setRegisterModal(true)} 
            className="w-full sm:w-auto h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-[#E00000] hover:bg-[#C90000] text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#D49A00]" />
            <span>Register New FIR</span>
          </button>
        </div>
      </div>

      {/* 2 & 3. Search Toolbar & FIR Records Section */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-7 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E7ECF3] pb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-[#0F172A] tracking-tight">Precinct FIR Records</h3>
            <span className="bg-[#E00000]/10 text-[#E00000] border border-[#E00000]/20 px-2.5 py-0.5 rounded-full font-extrabold text-xs">
              {filteredCases.length} Records
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search FIR number, category, station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 sm:h-11 pl-10 pr-8 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-xs font-semibold rounded-[14px] sm:rounded-[16px] focus:outline-none focus:ring-2 focus:ring-[#E00000] transition-all placeholder:text-slate-400 font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 & 5. Modern Horizontal FIR Cards */}
        <div className="space-y-3.5 sm:space-y-4">
          {paginatedCases.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] text-xs font-semibold bg-[#F8F9FB] rounded-[20px] border border-[#E7ECF3]">
              No FIR records match your filter criteria.
            </div>
          ) : (
            paginatedCases.map(c => {
              const currentStatus = caseStatuses[c.id] || c.status;
              return (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedCase(c)}
                  className="bg-white rounded-[20px] sm:rounded-[24px] border border-[#E7ECF3] p-4 sm:p-6 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-l-4 hover:border-l-[#D49A00] transition-all duration-250 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 group"
                >
                  {/* Left: FIR Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <span className="font-mono font-extrabold text-[#E00000] text-xs sm:text-sm tracking-tight bg-[#E00000]/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[10px] sm:rounded-[12px] border border-[#E00000]/20 shrink-0 w-fit">
                      {c.id}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-[#0F172A] text-sm tracking-tight group-hover:text-[#E00000] transition-colors">{c.category}</h4>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#64748B] font-semibold mt-0.5">
                        <span>{c.policeStation}</span>
                        <span>•</span>
                        <span>{c.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Risk Badge, Status Badge & Chevron */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full font-extrabold text-xs ${riskBadgeClass(c.risk)}`}>
                      {c.risk}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-xs ${statusBadgeClass(currentStatus)}`}>
                      <span className={`w-2 h-2 rounded-full ${statusDotClass(currentStatus)}`} />
                      {currentStatus}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#0B1F4D] transition-all ml-1" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 10. Clean Pagination Footer */}
        <div className="flex items-center justify-between px-2 pt-4 border-t border-[#E7ECF3]">
          <p className="text-xs font-semibold text-[#64748B]">
            Showing <span className="font-extrabold text-[#0F172A]">{filteredCases.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-extrabold text-[#0F172A]">{Math.min(currentPage * itemsPerPage, filteredCases.length)}</span> of <span className="font-extrabold text-[#0F172A]">{filteredCases.length}</span> records
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

      {/* 11. Register FIR Modal */}
      <AnimatePresence>
        {registerModal && (
          <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleRegister}
              className="bg-white border border-[#E7ECF3] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 bg-[#E00000] text-white">
                <h3 className="text-base font-black flex items-center gap-2 tracking-tight">
                  <Plus className="w-5 h-5 text-[#D49A00]" />
                  Log New Incident Report (FIR)
                </h3>
                <button 
                  type="button" 
                  onClick={() => setRegisterModal(false)} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Crime Category</label>
                    <select 
                      value={firForm.category} 
                      onChange={(e) => setFirForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-11 px-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E00000]"
                    >
                      <option value="Cybercrime">Cybercrime</option>
                      <option value="Property Theft">Property Theft</option>
                      <option value="Violent Crime">Violent Crime</option>
                      <option value="Financial Fraud">Financial Fraud</option>
                      <option value="Narcotics">Narcotics</option>
                      <option value="Crime Against Women">Crime Against Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">AI Risk Scoring Estimate</label>
                    <select 
                      value={firForm.risk} 
                      onChange={(e) => setFirForm(prev => ({ ...prev, risk: e.target.value }))}
                      className="w-full h-11 px-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E00000]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Jurisdiction Station</label>
                    <input type="text" disabled className="w-full h-11 px-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs font-bold text-slate-400 opacity-70" value={firForm.policeStation} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Penal Section Code</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-3 bg-white border border-[#E7ECF3] rounded-[14px] text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E00000]" 
                      value={firForm.section}
                      onChange={(e) => setFirForm(prev => ({ ...prev, section: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Complainant / Witness Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter full name"
                    className="w-full h-11 px-3 bg-white border border-[#E7ECF3] rounded-[14px] text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E00000]"
                    value={firForm.complainant}
                    onChange={(e) => setFirForm(prev => ({ ...prev, complainant: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Brief Narrative</label>
                  <textarea 
                    required 
                    rows="3" 
                    placeholder="Describe incident in detail..."
                    className="w-full p-3 bg-white border border-[#E7ECF3] rounded-[14px] text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#E00000]"
                    value={firForm.description}
                    onChange={(e) => setFirForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#F8F9FB] border-t border-[#E7ECF3] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setRegisterModal(false)} 
                  className="h-10 px-5 rounded-full bg-white border border-[#E7ECF3] text-[#0F172A] font-bold text-xs hover:bg-[#F8F9FB] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="h-10 px-6 rounded-full bg-[#E00000] hover:bg-[#C90000] text-white font-extrabold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Submit FIR
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* 12. FIR Case Detail Modal Overlay */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E7ECF3] rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between px-6 py-5 bg-[#E00000] text-white border-b border-[#C90000]">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-white/10 text-[#D49A00]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold font-mono tracking-tight text-white">{selectedCase.id}</h4>
                    <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-0.5">FIR Case Details & Brief</p>
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
              <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#F8F9FB] p-4 rounded-2xl border border-[#E7ECF3]">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Classification</span>
                    <span className="text-xs font-extrabold text-[#0F172A] mt-1 block">{selectedCase.category}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jurisdiction</span>
                    <span className="text-xs font-extrabold text-[#0F172A] mt-1 block">{selectedCase.policeStation}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logged Date</span>
                    <span className="text-xs font-extrabold text-[#0F172A] mt-1 block">{selectedCase.date}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status / Risk</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-extrabold text-[10px] ${riskBadgeClass(selectedCase.risk)}`}>{selectedCase.risk}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-extrabold text-[10px] ${statusBadgeClass(caseStatuses[selectedCase.id] || selectedCase.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(caseStatuses[selectedCase.id] || selectedCase.status)}`} />
                        {caseStatuses[selectedCase.id] || selectedCase.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Investigator & Penal Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-[#E7ECF3] rounded-2xl flex items-center gap-3.5 bg-white shadow-xs">
                    <div className="p-2.5 bg-[#E00000]/10 text-[#E00000] rounded-xl">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Investigating Officer</span>
                      <span className="text-xs font-extrabold text-[#0F172A] mt-0.5 block">{selectedCase.details?.officer || 'Inspector Patil'}</span>
                    </div>
                  </div>
                  <div className="p-4 border border-[#E7ECF3] rounded-2xl flex items-center gap-3.5 bg-white shadow-xs">
                    <div className="p-2.5 bg-[#D49A00]/10 text-[#D49A00] rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Penal Section Code</span>
                      <span className="text-xs font-extrabold text-[#0F172A] font-mono mt-0.5 block">{selectedCase.details?.section || 'Section 379 IPC'}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Summary */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Case Narrative & Summary</h5>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-[#F8F9FB] p-4 rounded-2xl border border-[#E7ECF3]">
                    {selectedCase.details?.summary || 'Complaint logged and registered under precinct jurisdiction.'}
                  </p>
                </div>

                {/* Timeline */}
                {selectedCase.details?.timeline && (
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Historical Case Logs</h5>
                    <div className="relative border-l-2 border-[#E7ECF3] ml-3 space-y-4">
                      {selectedCase.details.timeline.map((item, idx) => (
                        <div key={idx} className="relative pl-5">
                          <div className="absolute left-[-7px] top-1.5 w-3 h-3 rounded-full bg-[#E00000] border-2 border-white shadow-xs" />
                          <div className="text-xs">
                            <span className="font-extrabold text-[#0F172A] font-mono flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.date}
                            </span>
                            <p className="text-slate-600 font-medium mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions: Start, Investigate, Close Case */}
              <div className="px-6 py-4 bg-[#F8F9FB] border-t border-[#E7ECF3] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={(e) => handleCaseAction(e, selectedCase.id, 'open')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" /> Start / Reopen
                  </button>
                  <button
                    onClick={(e) => handleCaseAction(e, selectedCase.id, 'investigate')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" /> Investigate
                  </button>
                  <button
                    onClick={(e) => handleCaseAction(e, selectedCase.id, 'close')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Close Case
                  </button>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-full sm:w-auto h-9 px-5 rounded-full bg-[#E00000] text-white font-bold text-xs hover:bg-[#C90000] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
