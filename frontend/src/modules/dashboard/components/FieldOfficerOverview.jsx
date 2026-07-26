import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Activity, ShieldCheck, Clock, Map, Plus, RefreshCw, 
  Upload, Eye, ArrowRight, ShieldAlert, AlertTriangle, Info, X, 
  User, CheckCircle, MapPin
} from 'lucide-react';
import { MOCK_CASES, MOCK_ALERTS } from './mockData';
import { useToast } from '../../../components/ui/Toast';

// MiniMapCard removed to prevent duplication. Geographic details handled in Crime Map.

export default function FieldOfficerOverview({ onNavigate }) {
  const toast = useToast();

  // Local state for Field Officer cases
  const [localCases, setLocalCases] = useState(MOCK_CASES);
  
  // Filter cases assigned to Inspector Patil
  const patilCases = useMemo(() => {
    return localCases.filter(c => c.details?.officer === 'Inspector Patil');
  }, [localCases]);

  // Operational metrics
  const activeFIRs = useMemo(() => localCases.filter(c => c.status !== 'Closed').length, [localCases]);
  const casesAssigned = patilCases.length;
  const pendingCases = patilCases.filter(c => c.status === 'Active' || c.status === 'Investigating').length;
  const todayIncidents = 2; // Fixed simulated count for today's logs in this precinct

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState(null); // 'fir' | 'status' | 'evidence' | null

  // Register FIR Form State
  const [firForm, setFirForm] = useState({
    category: 'Cybercrime',
    district: 'Bengaluru City',
    policeStation: 'Cubbon Park PS',
    complainant: '',
    section: 'Section 379 IPC',
    description: '',
    risk: 'Medium'
  });

  // Update Status Form State
  const [statusForm, setStatusForm] = useState({
    caseId: patilCases[0]?.id || '',
    status: 'Investigating'
  });

  // Upload Evidence Form State
  const [evidenceForm, setEvidenceForm] = useState({
    caseId: patilCases[0]?.id || '',
    fileName: '',
    fileType: 'Document'
  });

  const handleRegisterFIR = (e) => {
    e.preventDefault();
    if (!firForm.complainant || !firForm.description) {
      toast.error('Validation Error', 'Please fill in all required fields.');
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
          { date: 'Just now - FIR Registered', desc: `Complainant: ${firForm.complainant}. Registered by Officer Patil.` }
        ]
      }
    };

    setLocalCases(prev => [newCase, ...prev]);
    setActiveModal(null);
    setFirForm({
      category: 'Cybercrime',
      district: 'Bengaluru City',
      policeStation: 'Cubbon Park PS',
      complainant: '',
      section: 'Section 379 IPC',
      description: '',
      risk: 'Medium'
    });
    toast.success('FIR Logged', `FIR ${newId} has been successfully registered.`);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    const targetId = statusForm.caseId || patilCases[0]?.id;
    if (!targetId) {
      toast.error('Error', 'No cases available to update.');
      return;
    }

    setLocalCases(prev => prev.map(c => {
      if (c.id === targetId) {
        return { 
          ...c, 
          status: statusForm.status,
          details: {
            ...c.details,
            timeline: [
              { date: 'Status Updated', desc: `Status changed to ${statusForm.status} by Inspector Patil.` },
              ...(c.details?.timeline || [])
            ]
          }
        };
      }
      return c;
    }));
    setActiveModal(null);
    toast.success('Status Updated', `Case ${targetId} status updated to ${statusForm.status}.`);
  };

  const handleUploadEvidence = (e) => {
    e.preventDefault();
    const targetId = evidenceForm.caseId || patilCases[0]?.id;
    if (!targetId || !evidenceForm.fileName) {
      toast.error('Validation Error', 'Please select a case and type a file name.');
      return;
    }

    setLocalCases(prev => prev.map(c => {
      if (c.id === targetId) {
        return {
          ...c,
          details: {
            ...c.details,
            timeline: [
              { date: 'Evidence Linked', desc: `${evidenceForm.fileType} "${evidenceForm.fileName}" uploaded by Inspector Patil.` },
              ...(c.details?.timeline || [])
            ]
          }
        };
      }
      return c;
    }));
    setActiveModal(null);
    setEvidenceForm(prev => ({ ...prev, fileName: '' }));
    toast.success('Evidence Uploaded', `Linked evidence successfully to Case ${targetId}.`);
  };

  const activityIcons = {
    fir_registration: { Icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    case_assignment: { Icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    status_update: { Icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    evidence_upload: { Icon: Upload, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    patrol_dispatch: { Icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    high_priority: { Icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  };

  const baseActivities = [
    {
      time: '10m ago',
      type: 'patrol_dispatch',
      title: 'Patrol Unit Dispatched',
      desc: 'Unit 4 dispatched to Sector B (MG Road) for routine precinct security checks.',
      status: 'Deployed'
    },
    {
      time: '24m ago',
      type: 'evidence_upload',
      title: 'Evidence File Linked',
      desc: 'CCTV footage CCTV_Footage_Oct24.mp4 uploaded and linked to FIR-2026-1012.',
      status: 'Linked'
    },
    {
      time: '45m ago',
      type: 'fir_registration',
      title: 'New FIR Registered',
      desc: 'FIR-2026-1025 logged under Section 379 IPC (Property Theft) at desk.',
      status: 'Registered'
    },
    {
      time: '1h ago',
      type: 'case_assignment',
      title: 'Case Delegation',
      desc: 'FIR-2026-1022 cyber theft case assigned to Inspector Patil.',
      status: 'Assigned'
    },
    {
      time: '2h ago',
      type: 'status_update',
      title: 'Inquiry Status Updated',
      desc: 'FIR-2026-1011 investigation status set to active inquiry.',
      status: 'Active'
    },
    {
      time: '3h ago',
      type: 'high_priority',
      title: 'High-Priority Alert Triggered',
      desc: 'Automatic license plate reader flagged syndicate-linked SUV near checkpost.',
      status: 'Critical'
    }
  ];

  const allActivities = useMemo(() => {
    const list = [...baseActivities];
    // Check if new FIRs have been registered in this state session
    if (localCases.length > MOCK_CASES.length) {
      const added = localCases.slice(0, localCases.length - MOCK_CASES.length);
      added.forEach((c, idx) => {
        list.unshift({
          time: 'Just now',
          type: 'fir_registration',
          title: 'New FIR Registered',
          desc: `FIR ${c.id} (${c.category}) logged by Inspector Patil.`,
          status: 'Registered'
        });
      });
    }
    return list.slice(0, 5); // limit to top 5 for visual layout alignment
  }, [localCases]);

  return (
    <div className="space-y-8">
      {/* Header and Live shift details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.15)]">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                Cubbon Park PS
              </span>
              <span className="inline-flex items-center gap-1 text-2xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                Active Patrol Shift
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Field Officer Operations
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned cases dashboard, FIR registry utilities, and precinct alerts feed.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>Active Shift: 14:00 - 22:00</span>
        </div>
      </div>

      {/* Field Officer KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Station FIRs', value: activeFIRs, note: 'Station total', icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { title: 'Cases Assigned to You', value: casesAssigned, note: 'Inspector Patil roster', icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Pending Investigations', value: pendingCases, note: 'Requires inquiry logs', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { title: 'Today Precinct Logs', value: todayIncidents, note: 'Last 24 hours', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
        ].map((card, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700/80 transition-all duration-200 cursor-default group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1.5 font-mono">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-slate-500 text-3xs mt-3.5 pt-2 border-t border-slate-800/40">{card.note}</p>
          </div>
        ))}
      </div>

      {/* Row 1 Grid: Assigned Cases + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assigned Cases */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[340px] justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-2 shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-white">Your Assigned Cases</h3>
                <p className="text-4xs text-slate-500 mt-0.5">Assigned to Inspector Patil. Select a row to update status.</p>
              </div>
              <button
                onClick={() => onNavigate('assigned_cases')}
                className="text-4xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors shrink-0"
              >
                View Roster &rarr;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
              <table className="w-full text-left" aria-label="Assigned cases log">
                <thead>
                  <tr className="border-b border-slate-800 text-3xs font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">FIR ID</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Date Logged</th>
                    <th className="py-2.5 px-3">Risk</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patilCases.slice(0, 4).map((c) => (
                    <tr 
                      key={c.id} 
                      className="border-b border-slate-800/40 hover:bg-slate-800/20 cursor-pointer text-xs transition-colors"
                      onClick={() => {
                        setStatusForm(prev => ({ ...prev, caseId: c.id }));
                        setActiveModal('status');
                      }}
                    >
                      <td className="py-2.5 px-3 font-mono font-semibold text-primary">{c.id}</td>
                      <td className="py-2.5 px-3 text-slate-200">{c.category}</td>
                      <td className="py-2.5 px-3 text-slate-400">{c.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`badge ${
                          c.risk === 'Critical' ? 'badge-critical' : c.risk === 'High' ? 'badge-high' : 'badge-medium'
                        } py-0 px-1.5 text-4xs`}>
                          {c.risk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'Closed' ? 'bg-slate-500' : 'bg-success glow-success animate-pulse-soft'
                          }`} />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[340px] justify-between">
            <div className="border-b border-slate-800/60 pb-3 mb-2 shrink-0">
              <h3 className="text-sm font-semibold text-white">Operations Utility Tool</h3>
              <p className="text-4xs text-slate-500 mt-0.5">Quick station-level actions.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1 pt-1">
              <button 
                onClick={() => setActiveModal('fir')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 hover:border-primary bg-slate-950/40 hover:bg-primary/5 transition-all text-center gap-2 group cursor-pointer"
              >
                <Plus className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-2xs font-semibold text-slate-200 group-hover:text-white">Register FIR</span>
              </button>
              
              <button 
                onClick={() => {
                  if (patilCases.length > 0) {
                    setStatusForm({ caseId: patilCases[0].id, status: 'Investigating' });
                    setActiveModal('status');
                  } else {
                    toast.info('No Cases', 'You have no assigned cases to update.');
                  }
                }}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 hover:border-primary bg-slate-950/40 hover:bg-primary/5 transition-all text-center gap-2 group cursor-pointer"
              >
                <RefreshCw className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-2xs font-semibold text-slate-200 group-hover:text-white">Update Status</span>
              </button>

              <button 
                onClick={() => {
                  if (patilCases.length > 0) {
                    setEvidenceForm({ caseId: patilCases[0].id, fileName: '', fileType: 'Document' });
                    setActiveModal('evidence');
                  } else {
                    toast.info('No Cases', 'You have no assigned cases to link files.');
                  }
                }}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 hover:border-primary bg-slate-950/40 hover:bg-primary/5 transition-all text-center gap-2 group cursor-pointer"
              >
                <Upload className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-2xs font-semibold text-slate-200 group-hover:text-white">Link Evidence</span>
              </button>

              <button 
                onClick={() => onNavigate('assigned_cases')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 hover:border-primary bg-slate-950/40 hover:bg-primary/5 transition-all text-center gap-2 group cursor-pointer"
              >
                <Eye className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-2xs font-semibold text-slate-200 group-hover:text-white">View Cases</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 Grid: Recent Precinct Activity + BOLO Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Precinct Activity (wide left panel) */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4 shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Precinct Activity</h3>
                <p className="text-4xs text-slate-500 mt-0.5 font-sans"> precinct activity logs and notifications feed.</p>
              </div>
              <span className="flex items-center gap-1.5 text-4xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                Active Feed
              </span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {allActivities.map((act, i) => {
                const cfg = activityIcons[act.type] || activityIcons.fir_registration;
                const ActIcon = cfg.Icon;
                return (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-850/60 text-xs hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${cfg.bg}`}>
                        <ActIcon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 truncate">{act.title}</p>
                        <p className="text-slate-450 text-3xs truncate mt-0.5">{act.desc}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3.5 shrink-0 pl-3">
                      {act.status && (
                        <span className="badge badge-neutral text-4xs font-bold uppercase tracking-wider py-0.5 px-2">
                          {act.status}
                        </span>
                      )}
                      <span className="text-4xs text-slate-500 font-mono">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: BOLO Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[380px] justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-semibold text-white">Local Precinct BOLO</h3>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-4xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors shrink-0"
              >
                View Feed &rarr;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5">
              {MOCK_ALERTS.slice(0, 3).map((alert, i) => (
                <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-slate-950/30 border border-slate-850/60 text-xs hover:border-slate-800 transition-colors">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 shrink-0 h-8 w-8 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-critical py-0 px-1.5 text-4xs font-bold uppercase">BOLO</span>
                      <span className="text-4xs text-slate-500 font-mono">{alert.time}</span>
                    </div>
                    <p className="font-semibold text-slate-200 mt-1 truncate">{alert.title}</p>
                    <p className="text-slate-455 text-3xs leading-relaxed mt-0.5">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK UTILITY MODALS (Interactive overlays) */}
      <AnimatePresence>
        {activeModal === 'fir' && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleRegisterFIR}
              className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Log New Incident Report (FIR)
                </h3>
                <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-3xs">Crime Category</label>
                    <select 
                      value={firForm.category} 
                      onChange={(e) => setFirForm(prev => ({ ...prev, category: e.target.value }))}
                      className="select text-xs h-9"
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
                    <label className="label text-3xs">AI Risk Scoring Estimate</label>
                    <select 
                      value={firForm.risk} 
                      onChange={(e) => setFirForm(prev => ({ ...prev, risk: e.target.value }))}
                      className="select text-xs h-9"
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
                    <label className="label text-3xs">Jurisdiction Station</label>
                    <input type="text" disabled className="input text-xs h-9 opacity-60" value={firForm.policeStation} />
                  </div>
                  <div>
                    <label className="label text-3xs">Penal Section Code</label>
                    <input 
                      type="text" 
                      className="input text-xs h-9" 
                      value={firForm.section}
                      onChange={(e) => setFirForm(prev => ({ ...prev, section: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-3xs">Complainant / Witness Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter name"
                    className="input text-xs h-9"
                    value={firForm.complainant}
                    onChange={(e) => setFirForm(prev => ({ ...prev, complainant: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label text-3xs">Brief Briefing Narrative</label>
                  <textarea 
                    required 
                    rows="3" 
                    placeholder="Describe incident in detail..."
                    className="input text-xs pt-2"
                    value={firForm.description}
                    onChange={(e) => setFirForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary btn-sm px-4">Cancel</button>
                <button type="submit" className="btn-primary btn-sm px-5">Submit FIR</button>
              </div>
            </motion.form>
          </div>
        )}

        {activeModal === 'status' && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleUpdateStatus}
              className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  Update Investigation Status
                </h3>
                <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label text-3xs">Select Assigned Case</label>
                  <select 
                    value={statusForm.caseId} 
                    onChange={(e) => setStatusForm(prev => ({ ...prev, caseId: e.target.value }))}
                    className="select text-xs h-9"
                  >
                    {patilCases.map(c => (
                      <option key={c.id} value={c.id}>{c.id} ({c.category})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-3xs">Operational Investigation Status</label>
                  <select 
                    value={statusForm.status} 
                    onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="select text-xs h-9"
                  >
                    <option value="Active">Active (In Roster)</option>
                    <option value="Investigating">Investigating (Active Inquiry)</option>
                    <option value="Under Review">Under Review (Report Pending)</option>
                    <option value="Closed">Closed (Charge Sheet Filed)</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary btn-sm px-4">Cancel</button>
                <button type="submit" className="btn-primary btn-sm px-5">Save Status</button>
              </div>
            </motion.form>
          </div>
        )}

        {activeModal === 'evidence' && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleUploadEvidence}
              className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Link Case Evidence File
                </h3>
                <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label text-3xs">Target Case</label>
                  <select 
                    value={evidenceForm.caseId} 
                    onChange={(e) => setEvidenceForm(prev => ({ ...prev, caseId: e.target.value }))}
                    className="select text-xs h-9"
                  >
                    {patilCases.map(c => (
                      <option key={c.id} value={c.id}>{c.id} ({c.category})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-3xs">Evidence File Classification</label>
                  <select 
                    value={evidenceForm.fileType} 
                    onChange={(e) => setEvidenceForm(prev => ({ ...prev, fileType: e.target.value }))}
                    className="select text-xs h-9"
                  >
                    <option value="Document">Written Statement Document</option>
                    <option value="Image">CCTV/Crime Scene Image</option>
                    <option value="Audio">Witness Voice Recording</option>
                    <option value="Video">Precinct Surveillance Video</option>
                  </select>
                </div>
                <div>
                  <label className="label text-3xs">Evidence Identifier Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. CCTV_Footage_Oct24.mp4"
                    className="input text-xs h-9"
                    value={evidenceForm.fileName}
                    onChange={(e) => setEvidenceForm(prev => ({ ...prev, fileName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary btn-sm px-4">Cancel</button>
                <button type="submit" className="btn-primary btn-sm px-5">Upload File</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
