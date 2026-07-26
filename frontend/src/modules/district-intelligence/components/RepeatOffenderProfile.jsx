import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_OFFENDERS_DOSSIERS } from '../../../mock/offenderData';
import { 
  ArrowLeft, ShieldAlert, Award, FileText, Search, 
  MapPin, HelpCircle, User, Compass, Calendar, ChevronRight, Activity 
} from 'lucide-react';
import RiskBadge from '../../hotspot-detection/components/RiskBadge';

export default function RepeatOffenderProfile({ offenderName, onBack, onSelectOffender }) {
  // Load dossier from mock registry
  const offender = useMemo(() => {
    return MOCK_OFFENDERS_DOSSIERS[offenderName] || null;
  }, [offenderName]);

  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'timeline' | 'arrests' | 'associates' | 'cases' | 'ai'

  // Search & Filter States
  const [arrestSearch, setArrestSearch] = useState('');
  const [caseSearch, setCaseSearch] = useState('');
  const [caseFilterCategory, setCaseFilterCategory] = useState('All');
  const [caseSortKey, setCaseSortKey] = useState('date'); // 'date' | 'category' | 'status'

  if (!offender) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 shadow-md">
        <h3 className="text-sm font-bold text-white mb-2">Offender Dossier Not Found</h3>
        <button onClick={onBack} className="btn-secondary btn-sm gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to List
        </button>
      </div>
    );
  }

  // Filtered Arrest History
  const filteredArrests = useMemo(() => {
    let list = offender.arrestHistory || [];
    if (arrestSearch.trim()) {
      const q = arrestSearch.toLowerCase();
      list = list.filter(a => 
        a.charges.toLowerCase().includes(q) ||
        a.officer.toLowerCase().includes(q) ||
        a.station.toLowerCase().includes(q)
      );
    }
    return list;
  }, [offender, arrestSearch]);

  // Filtered Case History
  const filteredCases = useMemo(() => {
    let list = offender.caseHistory || [];
    
    if (caseSearch.trim()) {
      const q = caseSearch.toLowerCase();
      list = list.filter(c => 
        c.id.toLowerCase().includes(q) ||
        c.fir.toLowerCase().includes(q) ||
        c.officer.toLowerCase().includes(q)
      );
    }

    if (caseFilterCategory !== 'All') {
      list = list.filter(c => c.category === caseFilterCategory);
    }

    return [...list].sort((a, b) => {
      if (caseSortKey === 'category') {
        return a.category.localeCompare(b.category);
      }
      if (caseSortKey === 'status') {
        return a.status.localeCompare(b.status);
      }
      // default: date descending
      return new Date(b.date) - new Date(a.date);
    });
  }, [offender, caseSearch, caseFilterCategory, caseSortKey]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header with back navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <button 
          onClick={onBack}
          className="btn-secondary btn-sm gap-2 cursor-pointer hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back to District Intelligence</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>Last Known: <strong>{offender.lastKnownDistrict}</strong></span>
        </div>
      </div>

      {/* 1. Criminal Summary Profile Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Avatar & Basic details */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg text-indigo-400 border border-slate-700">
              {offender.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white leading-tight">{offender.name}</h2>
                <span className={`px-2 py-0.5 rounded text-4xs font-bold uppercase tracking-wider ${
                  offender.status === 'Wanted' ? 'bg-red-500/20 text-red-400' :
                  offender.status === 'In Custody' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-450'
                }`}>
                  {offender.status}
                </span>
              </div>
              <p className="text-4xs text-slate-500 mt-1 font-mono uppercase tracking-widest">Aliases: {offender.aliases || 'None'}</p>
              <p className="text-xs text-slate-400 mt-1">Age: {offender.age} • Gender: {offender.gender}</p>
            </div>
          </div>

          {/* Stats metrics block */}
          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
              <span className="block text-4xs text-slate-500 font-bold uppercase">Risk Rating</span>
              <span className="text-lg font-bold text-red-500 font-mono mt-0.5">{offender.riskScore} <span className="text-4xs text-slate-500">/100</span></span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
              <span className="block text-4xs text-slate-500 font-bold uppercase">Total Charges</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5">{offender.totalCases} cases</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
              <span className="block text-4xs text-slate-500 font-bold uppercase">Prior Arrests</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5">{offender.totalArrests} times</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
              <span className="block text-4xs text-slate-500 font-bold uppercase">Warrants</span>
              <span className="text-lg font-bold text-rose-500 font-mono mt-0.5">{offender.activeWarrants} active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar scroll-smooth bg-slate-900/40 rounded-t-xl shrink-0">
        {[
          { id: 'overview', label: 'Offenses & Movement' },
          { id: 'timeline', label: 'Timeline History' },
          { id: 'arrests', label: 'Arrest Record' },
          { id: 'associates', label: 'Known Associates Network' },
          { id: 'cases', label: 'Case Ledger' },
          { id: 'ai', label: 'AI Risk Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-5 py-3 text-3xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeSubTab === tab.id 
                ? 'border-b-primary text-primary bg-slate-900/40' 
                : 'border-b-transparent text-slate-400 hover:text-white hover:bg-slate-850/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Viewport */}
      <div className="p-1 min-h-[350px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* ── OVERVIEW TAB ── */}
            {activeSubTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Category distribution */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 border-b border-slate-850">
                    Crime Category Breakdown
                  </h3>
                  <div className="space-y-3.5">
                    {offender.crimeCategories.map((c, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-350">{c.name}</span>
                          <span className="font-mono text-slate-200 font-bold">{c.count} ({c.percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${c.percentage}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* District movement */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 border-b border-slate-850">
                      District Movement Path
                    </h3>
                    <p className="text-3xs text-slate-450 mt-1">Chronological transition log indicating territorial shifts in crime activity.</p>
                  </div>

                  {/* Flow items stack */}
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-4">
                    {offender.districtMovement.map((mv, i) => {
                      const isHighest = mv.district === offender.highestActivityDistrict;
                      return (
                        <div key={i} className="flex flex-col sm:flex-row items-center gap-4">
                          <div className={`p-3 rounded-lg border text-center min-w-28 relative ${
                            isHighest 
                              ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.15)] text-rose-400' 
                              : 'bg-slate-950/40 border-slate-850 text-slate-300'
                          }`}>
                            <p className="font-semibold text-xs">{mv.district}</p>
                            <p className="text-4xs text-slate-500 font-mono mt-0.5">{mv.date} ({mv.activity})</p>
                            {isHighest && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white font-mono text-[8px] font-bold px-1.5 py-0.2 rounded uppercase whitespace-nowrap">
                                Peak activity
                              </span>
                            )}
                          </div>
                          {i < offender.districtMovement.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-slate-600 rotate-90 sm:rotate-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850/60 text-3xs text-slate-400 font-mono">
                    System suggests high risk of transition toward neighboring border checkpoints.
                  </div>
                </div>

              </div>
            )}

            {/* ── TIMELINE TAB ── */}
            {activeSubTab === 'timeline' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 border-b border-slate-850">
                  Recorded Offenses timeline
                </h3>

                <div className="overflow-y-auto max-h-[350px] no-scrollbar pl-4 border-l border-slate-800 space-y-5 py-2">
                  {offender.offenseTimeline.map((item, i) => (
                    <div key={i} className="relative space-y-1 text-xs">
                      {/* Timeline dot */}
                      <span className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 absolute -left-[22px] top-1" />
                      
                      <div className="flex justify-between items-center text-4xs text-slate-500 font-mono">
                        <span>{item.date}</span>
                        <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-400">{item.fir}</span>
                      </div>
                      <h4 className="font-bold text-slate-200">{item.type}</h4>
                      <p className="text-3xs text-slate-450">{item.station} • Status: <strong className="text-indigo-400">{item.status}</strong></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ARRESTS TAB ── */}
            {activeSubTab === 'arrests' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-850">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Arrest Record Registry</h3>
                  
                  {/* Search box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search charges or officers..."
                      value={arrestSearch}
                      onChange={(e) => setArrestSearch(e.target.value)}
                      className="input pl-8 text-xs h-8.5 bg-slate-950 border-slate-850 w-full"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto text-xs text-left">
                  <table className="w-full text-slate-400" aria-label="Arrest History logs">
                    <thead>
                      <tr className="border-b border-slate-800 text-3xs uppercase font-semibold text-slate-500">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Jurisdiction</th>
                        <th className="py-2.5 px-3">Arresting Officer</th>
                        <th className="py-2.5 px-3">Charges</th>
                        <th className="py-2.5 px-3">Outcome</th>
                        <th className="py-2.5 px-3">Bail Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArrests.map((arr, i) => (
                        <tr key={i} className="border-b border-slate-850 hover:bg-slate-850/20">
                          <td className="py-2.5 px-3 font-mono">{arr.date}</td>
                          <td className="py-2.5 px-3">{arr.station}</td>
                          <td className="py-2.5 px-3">{arr.officer}</td>
                          <td className="py-2.5 px-3 text-slate-200 font-medium">{arr.charges}</td>
                          <td className="py-2.5 px-3">{arr.outcome}</td>
                          <td className="py-2.5 px-3 font-semibold text-indigo-400">{arr.bailStatus}</td>
                        </tr>
                      ))}
                      {filteredArrests.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500">
                            No arrests records matched your search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── ASSOCIATES TAB ── */}
            {activeSubTab === 'associates' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* SVG connection graph layout card */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between h-96">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 border-b border-slate-850">
                      Co-Offender Syndicate network
                    </h3>
                    <p className="text-3xs text-slate-500 mt-1 font-mono">Linked co-defendants and operational nodes. Click outer circles to inspect dossier.</p>
                  </div>

                  {/* SVG Node Graph */}
                  <div className="flex-1 flex justify-center items-center py-4 bg-slate-950/20 border border-slate-850 rounded-lg">
                    <svg viewBox="0 0 300 180" className="w-full h-full max-w-sm">
                      {/* Connection lines */}
                      {offender.knownAssociates.map((ass, i) => {
                        const angle = (i * Math.PI) / 1.5;
                        const targetX = 150 + Math.cos(angle) * 75;
                        const targetY = 90 + Math.sin(angle) * 55;
                        return (
                          <g key={i}>
                            <line 
                              x1="150" 
                              y1="90" 
                              x2={targetX} 
                              y2={targetY} 
                              stroke="#6366f1" 
                              strokeWidth="1.5" 
                              strokeDasharray="3 3"
                            />
                            <text 
                              x={(150 + targetX) / 2} 
                              y={(90 + targetY) / 2 - 4} 
                              fill="#94a3b8" 
                              fontSize="6" 
                              textAnchor="middle"
                              className="font-mono select-none"
                            >
                              {ass.relationship}
                            </text>
                          </g>
                        );
                      })}

                      {/* Center Node (active offender) */}
                      <circle cx="150" cy="90" r="16" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                      <text x="150" y="93" fill="#e2e8f0" fontSize="7" fontWeight="bold" textAnchor="middle" className="select-none">
                        {offender.initials}
                      </text>

                      {/* Outer Nodes (associates) */}
                      {offender.knownAssociates.map((ass, i) => {
                        const targetDossier = MOCK_OFFENDERS_DOSSIERS[ass.name];
                        const angle = (i * Math.PI) / 1.5;
                        const targetX = 150 + Math.cos(angle) * 75;
                        const targetY = 90 + Math.sin(angle) * 55;
                        return (
                          <g 
                            key={i} 
                            onClick={() => onSelectOffender(ass.name)}
                            className="cursor-pointer group"
                          >
                            <circle cx={targetX} cy={targetY} r="12" fill="#18181b" stroke={ass.riskLevel === 'Critical' ? '#ef4444' : '#f59e0b'} strokeWidth="1.5" />
                            <text x={targetX} y={targetY + 3} fill="#e2e8f0" fontSize="6" fontWeight="bold" textAnchor="middle" className="select-none">
                              {targetDossier?.initials || 'A'}
                            </text>
                            {/* Hover tooltip label */}
                            <text x={targetX} y={targetY - 14} fill="#ffffff" fontSize="6" textAnchor="middle" className="opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                              {ass.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Right side Associate descriptions */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 border-b border-slate-850">
                    Linked Associate details
                  </h3>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                    {offender.knownAssociates.map((ass, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectOffender(ass.name)}
                        className="w-full p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-left hover:border-slate-700 transition-colors flex justify-between items-center group cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-slate-200 text-xs">{ass.name}</p>
                          <p className="text-4xs text-slate-500 mt-0.5">{ass.relationship} • {ass.sharedCases} Shared cases</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          ass.riskLevel === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {ass.riskLevel}
                        </span>
                      </button>
                    ))}
                    {offender.knownAssociates.length === 0 && (
                      <div className="text-center p-8 text-slate-500 text-xs font-mono">
                        No known associates listed in database dossiers.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ── CASE HISTORY LEDGER TAB ── */}
            {activeSubTab === 'cases' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-850">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Investigative Cases ledger</h3>
                    
                    {/* Category filter tab */}
                    <div className="flex bg-slate-950 p-0.5 rounded border border-slate-850">
                      {['All', 'Theft', 'Assault', 'Drug', 'Cyber', 'Fraud'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCaseFilterCategory(cat)}
                          className={`px-2 py-0.5 text-4xs font-bold uppercase rounded cursor-pointer transition-all ${
                            caseFilterCategory === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search bar */}
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search case IDs..."
                        value={caseSearch}
                        onChange={(e) => setCaseSearch(e.target.value)}
                        className="input pl-7 text-[10px] h-8 bg-slate-950 border-slate-850 w-full"
                      />
                    </div>
                    {/* Sort buttons dropdown */}
                    <select
                      value={caseSortKey}
                      onChange={(e) => setCaseSortKey(e.target.value)}
                      className="select text-[10px] h-8 w-28 bg-slate-950 border-slate-850"
                    >
                      <option value="date">Date Sort</option>
                      <option value="category">Category Sort</option>
                      <option value="status">Status Sort</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto text-xs text-left">
                  <table className="w-full text-slate-400" aria-label="Case Ledger entries">
                    <thead>
                      <tr className="border-b border-slate-800 text-3xs uppercase font-semibold text-slate-500">
                        <th className="py-2.5 px-3">Case ID</th>
                        <th className="py-2.5 px-3">FIR Number</th>
                        <th className="py-2.5 px-3">Crime Category</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Police Station</th>
                        <th className="py-2.5 px-3">Investigating Officer</th>
                        <th className="py-2.5 px-3">Investigation Status</th>
                        <th className="py-2.5 px-3">Court Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((c, i) => (
                        <tr key={i} className="border-b border-slate-850 hover:bg-slate-850/20">
                          <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">{c.id}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-200">{c.fir}</td>
                          <td className="py-2.5 px-3 font-semibold">{c.category}</td>
                          <td className="py-2.5 px-3 font-mono">{c.date}</td>
                          <td className="py-2.5 px-3">{c.station}</td>
                          <td className="py-2.5 px-3">{c.officer}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Resolved' ? 'bg-slate-500' : 'bg-success animate-pulse-soft'}`} />
                              {c.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-200 font-medium">{c.courtStatus}</td>
                        </tr>
                      ))}
                      {filteredCases.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-500">
                            No cases listed match the filters/search selections.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── AI RISK TAB ── */}
            {activeSubTab === 'ai' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Risk Intelligence Assessment</h3>
                    <p className="text-4xs text-slate-400 mt-0.5 font-mono">Recidivism risk factors scoring profile.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Score circle */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-center space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Confidence Coefficient</span>
                    <div className="text-4xl font-bold font-mono text-indigo-400">{offender.aiRiskAssessment.confidence}%</div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                      {offender.aiRiskAssessment.riskLevel} threat
                    </span>
                  </div>

                  {/* Bullet points reasons list */}
                  <div className="md:col-span-2 space-y-2.5 text-xs text-slate-300">
                    <span className="block font-bold text-slate-400 text-4xs uppercase tracking-wider mb-1">Recidivism Risk Reasoning:</span>
                    {offender.aiRiskAssessment.reasoning.map((reason, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950/20 border border-slate-850 rounded-lg flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-[9px] text-indigo-400 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed text-xs">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
