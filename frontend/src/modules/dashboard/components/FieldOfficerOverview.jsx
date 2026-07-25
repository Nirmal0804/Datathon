import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Activity, ShieldCheck, Clock, RefreshCw,
  Eye, ShieldAlert,
  User, AlertOctagon
} from 'lucide-react';
import { getFieldMapCases } from '../../../api/endpoints';

export default function FieldOfficerOverview({ onNavigate }) {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await getFieldMapCases({ page: 1, page_size: 50 });
        const mapped = (res?.items || []).map(c => ({
          id: c.fir_number || c.fir_id,
          category: c.crime_head,
          district: c.district,
          policeStation: c.station_name || c.station_id,
          date: c.incident_date ? new Date(c.incident_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          rawDate: c.incident_date ? new Date(c.incident_date) : new Date(),
          risk: 'Medium',
          status: c.status || 'Active',
          arrests: 0,
          details: {
            officer: c.investigating_officer || 'Unassigned',
            section: (c.bns_sections || []).join(', ') || '—',
            summary: `${c.crime_head} case at ${c.station_name || c.station_id}, ${c.district}.`,
            timeline: [{ date: 'FIR Registered', desc: 'Case logged in CCTNS' }],
          },
        }));
        if (!cancelled) setCases(mapped);
      } catch (err) {
        if (!cancelled) setError('Failed to load cases from API.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const patilCases = useMemo(() => {
    return cases.filter(c => c.details?.officer === 'Inspector Patil');
  }, [cases]);

  const activeFIRs = useMemo(() => cases.filter(c => c.status !== 'Closed').length, [cases]);
  const casesAssigned = patilCases.length;
  const pendingCases = patilCases.filter(c => c.status === 'Active' || c.status === 'Investigating').length;
  const todayIncidents = 2;

  const activityIcons = {
    fir_registration: { Icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    case_assignment: { Icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    status_update: { Icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    evidence_upload: { Icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
  ];

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
              Assigned cases dashboard and precinct alerts feed.
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
          { title: 'Active Station FIRs', value: isLoading ? '—' : activeFIRs, note: 'Station total', icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { title: 'Cases Assigned to You', value: isLoading ? '—' : casesAssigned, note: 'Inspector Patil roster', icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Pending Investigations', value: isLoading ? '—' : pendingCases, note: 'Requires inquiry logs', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
                <p className="text-4xs text-slate-500 mt-0.5">Assigned to Inspector Patil.</p>
              </div>
              <button
                onClick={() => onNavigate('assigned_cases')}
                className="text-4xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors shrink-0"
              >
                View Roster &rarr;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">Loading cases...</div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-red-400 text-xs">{error}</div>
              ) : (
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
                    {patilCases.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500 text-xs">
                          No cases assigned to Inspector Patil.
                        </td>
                      </tr>
                    ) : (
                      patilCases.slice(0, 4).map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-800/40 hover:bg-slate-800/20 cursor-pointer text-xs transition-colors"
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
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions (Write Operations Blocked) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[340px] justify-between">
            <div className="border-b border-slate-800/60 pb-3 mb-2 shrink-0">
              <h3 className="text-sm font-semibold text-white">Operations Utility Tool</h3>
              <p className="text-4xs text-slate-500 mt-0.5">Quick station-level actions.</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertOctagon className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Write Operations Unavailable</p>
                  <p className="text-3xs text-slate-500 mt-1 leading-relaxed max-w-[200px]">
                    Register FIR, Update Status, and Link Evidence require a BLOCKED_API_CONTRACT backend endpoint.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('assigned_cases')}
                className="flex items-center gap-2 text-4xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View Cases &rarr;
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
              {baseActivities.map((act, i) => {
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

        {/* Right Column: BOLO Alerts (BLOCKED) */}
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

            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              </div>
              <p className="text-xs font-semibold text-slate-200">Alert Feed Unavailable</p>
              <p className="text-3xs text-slate-500 leading-relaxed max-w-[220px]">
                Alert feed requires BLOCKED_API_CONTRACT backend endpoint. No authoritative alert system is available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
