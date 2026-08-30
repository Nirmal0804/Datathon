import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Activity, ShieldCheck, Clock, Map, Plus, RefreshCw, 
  Upload, Eye, ArrowRight, ShieldAlert, AlertTriangle, Info, X, 
  User, CheckCircle, MapPin
} from 'lucide-react';
import { MOCK_CASES, MOCK_ALERTS } from './mockData';
import { useToast } from '../../../components/ui/Toast';
import kspBadge from '../../../assets/ksp-badge.webp';
import LazyImage from '../../../components/ui/LazyImage';
import GlobalKPICard from '../../../components/shared/ui/GlobalKPICard';
import { useTranslation } from '../../../i18n';

// MiniMapCard removed to prevent duplication. Geographic details handled in Crime Map.

export default function FieldOfficerOverview({ onNavigate }) {
  const { t } = useTranslation();
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
      toast.error(t('common.validationError', 'Validation Error'), t('officer.fillAllRequired', 'Please fill in all required fields.'));
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
    toast.success(t('fir.firLogged', 'FIR Logged'), `FIR ${newId} ${t('officer.firLoggedToastMsg', 'has been successfully registered.')}`);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    const targetId = statusForm.caseId || patilCases[0]?.id;
    if (!targetId) {
      toast.error(t('common.error', 'Error'), t('officer.noCasesToUpdate', 'No cases available to update.'));
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
    toast.success(t('officer.statusUpdated', 'Status Updated'), `Case ${targetId} ${t('officer.statusUpdatedToastMsg', 'status updated to')} ${statusForm.status}.`);
  };

  const handleUploadEvidence = (e) => {
    e.preventDefault();
    const targetId = evidenceForm.caseId || patilCases[0]?.id;
    if (!targetId || !evidenceForm.fileName) {
      toast.error(t('common.validationError', 'Validation Error'), t('officer.selectCaseAndFileName', 'Please select a case and type a file name.'));
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
    toast.success(t('officer.evidenceUploaded', 'Evidence Uploaded'), `${t('officer.evidenceLinkedToast', 'Evidence Linked')}: Case ${targetId}.`);
  };

  const activityIcons = {
    fir_registration: { Icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    case_assignment: { Icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    status_update: { Icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    evidence_upload: { Icon: Upload, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    patrol_dispatch: { Icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    high_priority: { Icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  };

  const getActivityTitle = (act) => {
    switch (act.type) {
      case 'patrol_dispatch': return t('officer.patrolDispatchedTitle', act.title);
      case 'evidence_upload': return t('officer.evidenceLinkedTitle', act.title);
      case 'fir_registration': return t('officer.newFirRegisteredTitle', act.title);
      case 'case_assignment': return t('officer.caseDelegationTitle', act.title);
      case 'status_update': return t('officer.inquiryStatusUpdatedTitle', act.title);
      case 'high_priority': return t('officer.highPriorityAlertTitle', act.title);
      default: return act.title;
    }
  };

  const getActivityDesc = (act) => {
    switch (act.type) {
      case 'patrol_dispatch': return t('officer.patrolDispatchedDesc', act.desc);
      case 'evidence_upload': return t('officer.evidenceLinkedDesc', act.desc);
      case 'fir_registration': return t('officer.newFirRegisteredDesc', act.desc);
      case 'case_assignment': return t('officer.caseDelegationDesc', act.desc);
      case 'status_update': return t('officer.inquiryStatusUpdatedDesc', act.desc);
      case 'high_priority': return t('officer.highPriorityAlertDesc', act.desc);
      default: return act.desc;
    }
  };

  const getActivityStatusLabel = (status) => {
    switch (status) {
      case 'Deployed': return t('officer.activityDeployed', 'Deployed');
      case 'Linked': return t('officer.activityLinked', 'Linked');
      case 'Registered': return t('officer.activityRegistered', 'Registered');
      case 'Assigned': return t('officer.activityAssigned', 'Assigned');
      case 'Active': return t('cases.statusActive', 'Active');
      case 'Critical': return t('common.critical', 'Critical');
      default: return status;
    }
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
      added.forEach((c) => {
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
    <div className="space-y-8 sm:space-y-12">
      {/* Header and Live shift details (Spacious Hero) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-7 md:p-8 bg-white border border-[#E5E7EB] rounded-[20px] sm:rounded-[24px] shadow-sm transition-all duration-200 ease-in-out">
        {/* Left Section */}
        <div className="flex items-center gap-3.5 sm:gap-5">
          {/* Karnataka Police Official Badge */}
          <div className="h-11 sm:h-[60px] w-10 sm:w-[50px] shrink-0 overflow-hidden flex items-center justify-center">
            <LazyImage
              src={kspBadge}
              alt="Karnataka Police Badge"
              className="h-full w-auto object-contain drop-shadow-sm"
              containerClassName="w-full h-full"
              loading="eager"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
              {t('officer.overviewTitle', 'Field Officer Operations')}
            </h1>
            <p className="text-xs sm:text-sm font-normal text-[#64748B] mt-0.5 sm:mt-1 leading-normal">
              {t('officer.overviewSubtitle', 'Assigned cases dashboard, FIR registry utilities, and precinct alerts feed.')}
            </p>
          </div>
        </div>

        {/* Right Section: Compact Status Chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#F8F9FB] px-3 sm:px-4 h-8 sm:h-10 rounded-[14px] sm:rounded-[16px] border border-[#E5E7EB] shadow-sm cursor-default">
            <Clock className="w-4 h-4 text-[#C79A2B]" />
            <span className="text-[11px] sm:text-xs font-bold text-[#0F172A]">
              {t('officer.activeShift', 'Active Shift')}: 14:00 - 22:00
            </span>
          </div>
        </div>
      </div>

      {/* Field Officer KPIs (Spacious Minimal Proportions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { title: t('officer.activeStationFirs', 'Active Station FIRs'), value: activeFIRs, note: t('officer.stationTotal', 'Station total'), icon: FileText, type: 'info' },
          { title: t('officer.casesAssignedToYou', 'Cases Assigned to You'), value: casesAssigned, note: t('officer.rosterNote', 'Inspector Patil roster'), icon: User, type: 'info' },
          { title: t('officer.pendingInvestigations', 'Pending Investigations'), value: pendingCases, note: t('officer.requiresInquiryLogs', 'Requires inquiry logs'), icon: Activity, type: 'warning' },
          { title: t('officer.todayPrecinctLogs', 'Today Precinct Logs'), value: todayIncidents, note: t('officer.last24Hours', 'Last 24 hours'), icon: ShieldCheck, type: 'success' }
        ].map((card, i) => (
          <GlobalKPICard
            key={i}
            delay={i * 0.05}
            compact={true}
            title={card.title}
            value={card.value}
            icon={card.icon}
            type={card.type}
            description={card.note}
          />
        ))}
      </div>

      {/* Row 1 Grid: Assigned Cases + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Cases */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-7 sm:p-8 shadow-sm flex flex-col h-[400px] justify-between">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4 mb-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {t('officer.yourAssignedCases', 'Your Assigned Cases')}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {t('officer.assignedCasesDesc', 'Assigned to Inspector Patil. Select a row to update status.')}
                </p>
              </div>
              <button
                onClick={() => onNavigate('assigned_cases')}
                className="text-xs font-bold text-police-navy hover:text-police-blue hover:underline transition-colors shrink-0 cursor-pointer"
              >
                {t('officer.viewRoster', 'View Roster')} &rarr;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
              <table className="w-full text-left" aria-label="Assigned cases log">
                <thead>
                  <tr className="border-b border-[#E7EAF0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-4">{t('cases.firId', 'FIR ID')}</th>
                    <th className="py-3 px-4">{t('cases.crimeType', 'Classification')}</th>
                    <th className="py-3 px-4">{t('cases.dateReported', 'Date Logged')}</th>
                    <th className="py-3 px-4">{t('cases.priority', 'Risk')}</th>
                    <th className="py-3 px-4">{t('common.status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {patilCases.slice(0, 4).map((c) => (
                    <tr 
                      key={c.id} 
                      className="border-b border-[#F1F5F9] hover:bg-[#F8F9FB] cursor-pointer text-[13px] transition-colors"
                      onClick={() => {
                        setStatusForm(prev => ({ ...prev, caseId: c.id }));
                        setActiveModal('status');
                      }}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-police-navy">{c.id}</td>
                      <td className="py-3.5 px-4 text-[#334155] font-medium">{c.category}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{c.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`badge ${
                          c.risk === 'Critical' ? 'badge-critical' : c.risk === 'High' ? 'badge-high' : 'badge-medium'
                        } py-0.5 px-2 text-[10px]`}>
                          {c.risk === 'Critical' ? t('common.critical', 'Critical') : c.risk === 'High' ? t('common.high', 'High') : t('common.medium', 'Medium')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#334155] font-bold">
                        <span className="inline-flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            c.status === 'Closed' ? 'bg-[#94A3B8]' : 'bg-emerald-500 glow-success'
                          }`} />
                          {c.status === 'Active' ? t('cases.statusActive', 'Active') : c.status === 'Investigating' ? t('cases.statusInvestigating', 'Investigating') : c.status === 'Closed' ? t('cases.statusClosed', 'Closed') : c.status}
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
          <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-7 sm:p-8 shadow-sm flex flex-col h-[400px] justify-between">
            <div className="border-b border-[#E7EAF0] pb-4 mb-4 shrink-0">
              <h3 className="text-base font-bold text-[#0F172A]">
                {t('officer.operationsUtilityTool', 'Operations Utility Tool')}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {t('officer.quickActionsDesc', 'Quick station-level actions.')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1 pt-1">
              <button 
                onClick={() => setActiveModal('fir')}
                className="flex flex-col items-center justify-center p-5 rounded-[20px] border border-[#E5E7EB] bg-[#F8F9FB] hover:border-police-gold hover:bg-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md transition-all duration-200 text-center gap-3 group cursor-pointer"
              >
                <div className="p-2.5 rounded-full bg-police-blue/10 group-hover:bg-police-gold/10 transition-colors">
                  <Plus className="w-6 h-6 text-police-blue group-hover:text-police-gold transition-colors" />
                </div>
                <span className="text-xs font-bold text-[#0F172A]">{t('fir.registerFIR', 'Register FIR')}</span>
              </button>
              
              <button 
                onClick={() => {
                  if (patilCases.length > 0) {
                    setStatusForm({ caseId: patilCases[0].id, status: 'Investigating' });
                    setActiveModal('status');
                  } else {
                    toast.info(t('common.noRecordsFound', 'No Cases'), t('cases.noAssignedCases', 'You have no assigned cases to update.'));
                  }
                }}
                className="flex flex-col items-center justify-center p-5 rounded-[20px] border border-[#E5E7EB] bg-[#F8F9FB] hover:border-police-gold hover:bg-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md transition-all duration-200 text-center gap-3 group cursor-pointer"
              >
                <div className="p-2.5 rounded-full bg-police-navy/10 group-hover:bg-police-gold/10 transition-colors">
                  <RefreshCw className="w-6 h-6 text-police-navy group-hover:text-police-gold transition-colors" />
                </div>
                <span className="text-xs font-bold text-[#0F172A]">{t('cases.updateStatus', 'Update Status')}</span>
              </button>

              <button 
                onClick={() => {
                  if (patilCases.length > 0) {
                    setEvidenceForm({ caseId: patilCases[0].id, fileName: '', fileType: 'Document' });
                    setActiveModal('evidence');
                  } else {
                    toast.info(t('common.noRecordsFound', 'No Cases'), t('cases.noAssignedCases', 'You have no assigned cases to link files.'));
                  }
                }}
                className="flex flex-col items-center justify-center p-5 rounded-[20px] border border-[#E5E7EB] bg-[#F8F9FB] hover:border-police-gold hover:bg-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md transition-all duration-200 text-center gap-3 group cursor-pointer"
              >
                <div className="p-2.5 rounded-full bg-emerald-500/10 group-hover:bg-police-gold/10 transition-colors">
                  <Upload className="w-6 h-6 text-emerald-600 group-hover:text-police-gold transition-colors" />
                </div>
                <span className="text-xs font-bold text-[#0F172A]">{t('cases.uploadEvidence', 'Link Evidence')}</span>
              </button>

              <button 
                onClick={() => onNavigate('assigned_cases')}
                className="flex flex-col items-center justify-center p-5 rounded-[20px] border border-[#E5E7EB] bg-[#F8F9FB] hover:border-police-gold hover:bg-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md transition-all duration-200 text-center gap-3 group cursor-pointer"
              >
                <div className="p-2.5 rounded-full bg-indigo-500/10 group-hover:bg-police-gold/10 transition-colors">
                  <Eye className="w-6 h-6 text-indigo-600 group-hover:text-police-gold transition-colors" />
                </div>
                <span className="text-xs font-bold text-[#0F172A]">{t('cases.viewAllCases', 'View Cases')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 Grid: Recent Precinct Activity + BOLO Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Precinct Activity (wide left panel) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-7 sm:p-8 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4 mb-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {t('officer.recentPrecinctActivity', 'Recent Precinct Activity')}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-sans">
                  {t('officer.precinctActivityDesc', 'Precinct activity logs and notifications feed.')}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                {t('admin.active', 'Active Feed')}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5">
              {allActivities.map((act, i) => {
                const cfg = activityIcons[act.type] || activityIcons.fir_registration;
                const ActIcon = cfg.Icon;
                return (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-[14px] bg-[#F8F9FB] border border-[#E5E7EB] text-xs hover:border-[#CBD5E1] hover:bg-white hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${cfg.bg.replace('10', '20')}`}>
                        <ActIcon className={`w-4.5 h-4.5 ${cfg.color.replace('400', '600').replace('500', '700')}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0F172A] truncate">{getActivityTitle(act)}</p>
                        <p className="text-[#64748B] text-xs truncate mt-0.5">{getActivityDesc(act)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3.5 shrink-0 pl-3">
                      {act.status && (
                        <span className="badge badge-neutral bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5">
                          {getActivityStatusLabel(act.status)}
                        </span>
                      )}
                      <span className="text-[10px] text-[#64748B] font-mono">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: BOLO Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-7 sm:p-8 shadow-sm flex flex-col h-[400px] justify-between">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-police-alert" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  {t('officer.localPrecinctBolo', 'Local Precinct BOLO')}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-bold text-police-navy hover:text-police-blue hover:underline transition-colors shrink-0 cursor-pointer"
              >
                {t('officer.viewFeed', 'View Feed')} &rarr;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5">
              {MOCK_ALERTS.slice(0, 3).map((alert, i) => (
                <div key={i} className="flex gap-3 p-3.5 rounded-[14px] bg-[#FEF2F2] border-l-4 border-l-police-alert border-y border-r border-y-[#FCA5A5] border-r-[#FCA5A5] text-xs transition-colors">
                  <div className="p-2 rounded-[10px] bg-white border border-[#FCA5A5] shrink-0 h-9 w-9 flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-police-alert" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-critical py-0.5 px-2 text-[10px] font-bold uppercase">{t('common.critical', 'BOLO')}</span>
                      <span className="text-[10px] text-rose-500 font-mono font-semibold">{alert.time}</span>
                    </div>
                    <p className="font-bold text-[#0F172A] mt-1.5 truncate leading-tight">{alert.title}</p>
                    <p className="text-[#64748B] text-xs leading-relaxed mt-1 line-clamp-2">{alert.desc}</p>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleRegisterFIR}
              className="bg-white border border-[#E5E7EB] rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 bg-[#F8F9FB] border-b border-[#E7EAF0]">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-police-blue/10">
                    <Plus className="w-5 h-5 text-police-blue" />
                  </div>
                  {t('officer.logNewFIR', 'Log New Incident Report (FIR)')}
                </h3>
                <button type="button" onClick={() => setActiveModal(null)} className="p-2 rounded-full bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FB] transition-colors shadow-sm cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                      {t('fir.category', 'Crime Category')}
                    </label>
                    <select 
                      value={firForm.category} 
                      onChange={(e) => setFirForm(prev => ({ ...prev, category: e.target.value }))}
                      className="select text-sm h-10 w-full"
                    >
                      <option value="Cybercrime">{t('categories.cybercrime', 'Cybercrime')}</option>
                      <option value="Property Theft">{t('categories.propertyTheft', 'Property Theft')}</option>
                      <option value="Violent Crime">{t('categories.violentCrime', 'Violent Crime')}</option>
                      <option value="Financial Fraud">{t('categories.financialFraud', 'Financial Fraud')}</option>
                      <option value="Narcotics">{t('categories.narcotics', 'Narcotics')}</option>
                      <option value="Crime Against Women">{t('categories.crimeAgainstWomen', 'Crime Against Women')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                      {t('cases.priority', 'AI Risk Estimate')}
                    </label>
                    <select 
                      value={firForm.risk} 
                      onChange={(e) => setFirForm(prev => ({ ...prev, risk: e.target.value }))}
                      className="select text-sm h-10 w-full"
                    >
                      <option value="Low">{t('common.low', 'Low')}</option>
                      <option value="Medium">{t('common.medium', 'Medium')}</option>
                      <option value="High">{t('common.high', 'High')}</option>
                      <option value="Critical">{t('common.critical', 'Critical')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                      {t('common.station', 'Jurisdiction Station')}
                    </label>
                    <input type="text" disabled className="input text-sm h-10 w-full opacity-70 bg-[#F8F9FB]" value={firForm.policeStation} />
                  </div>
                  <div>
                    <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                      {t('fir.penalCode', 'Penal Section Code')}
                    </label>
                    <input 
                      type="text" 
                      className="input text-sm h-10 w-full" 
                      value={firForm.section}
                      onChange={(e) => setFirForm(prev => ({ ...prev, section: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                    {t('fir.complainantName', 'Complainant / Witness Name')}
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder={t('fir.complainantPlaceholder', 'Enter full name')}
                    className="input text-sm h-10 w-full"
                    value={firForm.complainant}
                    onChange={(e) => setFirForm(prev => ({ ...prev, complainant: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                    {t('fir.incidentNarrative', 'Briefing Narrative')}
                  </label>
                  <textarea 
                    required 
                    rows="3" 
                    placeholder={t('fir.narrativePlaceholder', 'Describe incident in detail...')}
                    className="input text-sm pt-2 w-full"
                    value={firForm.description}
                    onChange={(e) => setFirForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="px-6 py-5 bg-[#F8F9FB] border-t border-[#E7EAF0] flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary px-5 py-2 cursor-pointer">{t('common.cancel', 'Cancel')}</button>
                <button type="submit" className="btn-primary px-6 py-2 bg-police-navy text-white hover:bg-police-blue cursor-pointer">{t('fir.submitFIR', 'Submit FIR')}</button>
              </div>
            </motion.form>
          </div>
        )}

        {activeModal === 'status' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleUpdateStatus}
              className="bg-white border border-[#E5E7EB] rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 bg-[#F8F9FB] border-b border-[#E7EAF0]">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-police-navy/10">
                    <RefreshCw className="w-5 h-5 text-police-navy" />
                  </div>
                  {t('officer.updateInvestigationStatus', 'Update Investigation Status')}
                </h3>
                <button type="button" onClick={() => setActiveModal(null)} className="p-2 rounded-full bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FB] transition-colors shadow-sm cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                    {t('cases.assignedOfficer', 'Select Assigned Case')}
                  </label>
                  <select 
                    value={statusForm.caseId} 
                    onChange={(e) => setStatusForm(prev => ({ ...prev, caseId: e.target.value }))}
                    className="select text-sm h-10 w-full"
                  >
                    {patilCases.map(c => (
                      <option key={c.id} value={c.id}>{c.id} ({c.category})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                    {t('common.status', 'Operational Investigation Status')}
                  </label>
                  <select 
                    value={statusForm.status} 
                    onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="select text-sm h-10 w-full"
                  >
                    <option value="Active">{t('officer.statusActiveRoster', 'Active (In Roster)')}</option>
                    <option value="Investigating">{t('officer.statusInvestigatingActive', 'Investigating (Active Inquiry)')}</option>
                    <option value="Under Review">{t('officer.statusUnderReviewReport', 'Under Review (Report Pending)')}</option>
                    <option value="Closed">{t('officer.statusClosedChargesheet', 'Closed (Charge Sheet Filed)')}</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-5 bg-[#F8F9FB] border-t border-[#E7EAF0] flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary px-5 py-2 cursor-pointer">{t('common.cancel', 'Cancel')}</button>
                <button type="submit" className="btn-primary px-6 py-2 bg-police-navy text-white hover:bg-police-blue cursor-pointer">{t('common.save', 'Save Status')}</button>
              </div>
            </motion.form>
          </div>
        )}

        {activeModal === 'evidence' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleUploadEvidence}
              className="bg-white border border-[#E5E7EB] rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 bg-[#F8F9FB] border-b border-[#E7EAF0]">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-emerald-500/10">
                    <Upload className="w-5 h-5 text-emerald-600" />
                  </div>
                  {t('officer.linkEvidenceFile', 'Link Case Evidence File')}
                </h3>
                <button type="button" onClick={() => setActiveModal(null)} className="p-2 rounded-full bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FB] transition-colors shadow-sm cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                    {t('cases.assignedOfficer', 'Target Case')}
                  </label>
                  <select 
                    value={evidenceForm.caseId} 
                    onChange={(e) => setEvidenceForm(prev => ({ ...prev, caseId: e.target.value }))}
                    className="select text-sm h-10 w-full"
                  >
                    {patilCases.map(c => (
                      <option key={c.id} value={c.id}>{c.id} ({c.category})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                    {t('fir.category', 'Evidence File Classification')}
                  </label>
                  <select 
                    value={evidenceForm.fileType} 
                    onChange={(e) => setEvidenceForm(prev => ({ ...prev, fileType: e.target.value }))}
                    className="select text-sm h-10 w-full"
                  >
                    <option value="Document">{t('officer.writtenStatement', 'Written Statement Document')}</option>
                    <option value="Image">{t('officer.cctvSceneImage', 'CCTV/Crime Scene Image')}</option>
                    <option value="Audio">{t('officer.witnessVoiceRecording', 'Witness Voice Recording')}</option>
                    <option value="Video">{t('officer.precinctSurveillanceVideo', 'Precinct Surveillance Video')}</option>
                  </select>
                </div>
                <div>
                  <label className="label text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 block">
                    {t('cases.evidenceTitle', 'Evidence Identifier Name')}
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder={t('officer.evidencePlaceholder', 'e.g. CCTV_Footage_Oct24.mp4')}
                    className="input text-sm h-10 w-full"
                    value={evidenceForm.fileName}
                    onChange={(e) => setEvidenceForm(prev => ({ ...prev, fileName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="px-6 py-5 bg-[#F8F9FB] border-t border-[#E7EAF0] flex justify-end gap-3">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary px-5 py-2 cursor-pointer">{t('common.cancel', 'Cancel')}</button>
                <button type="submit" className="btn-primary px-6 py-2 bg-police-navy text-white hover:bg-police-blue cursor-pointer">{t('officer.uploadAndLink', 'Upload & Link Evidence')}</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
