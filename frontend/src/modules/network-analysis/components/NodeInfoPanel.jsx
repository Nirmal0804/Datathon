import React from 'react';
import { X, User, ShieldAlert, Calendar, Link2, MapPin } from 'lucide-react';
import { MOCK_OFFENDERS_DOSSIERS } from '../../../mock/offenderData';

export default function NodeInfoPanel({ node, onClose, onSelectNode }) {
  if (!node) return null;

  // Resolve details from database if offender
  const offenderDossier = node.type === 'Accused' ? MOCK_OFFENDERS_DOSSIERS[node.id] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Entity Inspector</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Node Profile Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400 border border-slate-700">
            {node.label.substring(0, 2)}
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-sm leading-tight">{node.label}</h4>
            <p className="text-4xs text-slate-500 font-mono mt-0.5 uppercase tracking-widest">{node.type}</p>
          </div>
        </div>

        {/* ── ACCUSED DETAILED PANEL ── */}
        {node.type === 'Accused' && offenderDossier && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg">
                <span className="block text-[8px] text-slate-500 font-bold uppercase">Cases</span>
                <span className="text-sm font-bold text-white font-mono">{offenderDossier.totalCases}</span>
              </div>
              <div className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg">
                <span className="block text-[8px] text-slate-500 font-bold uppercase">Arrests</span>
                <span className="text-sm font-bold text-white font-mono">{offenderDossier.totalArrests}</span>
              </div>
            </div>

            <div className="space-y-2 text-3xs font-mono">
              <div className="flex justify-between border-b border-slate-850 pb-1">
                <span>Threat Level</span>
                <span className="text-red-400 font-bold uppercase">{offenderDossier.riskLevel}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1">
                <span>District Jurisdiction</span>
                <span>{offenderDossier.lastKnownDistrict}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Active Warrants</span>
                <span className="text-rose-500 font-bold">{offenderDossier.activeWarrants}</span>
              </div>
            </div>

            {/* Connected Associates */}
            {offenderDossier.knownAssociates && offenderDossier.knownAssociates.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Connected Associates</span>
                <div className="space-y-1.5">
                  {offenderDossier.knownAssociates.map((ass, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectNode({ id: ass.name, label: ass.name, type: 'Accused' })}
                      className="w-full p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-left hover:border-slate-700 transition-colors flex justify-between items-center text-3xs"
                    >
                      <span className="font-semibold text-slate-200">{ass.name}</span>
                      <span className="text-slate-500 font-mono">{ass.relationship}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CASE DETAILED PANEL ── */}
        {node.type === 'Case' && (
          <div className="space-y-3.5">
            <div className="space-y-2 text-3xs font-mono">
              <div className="flex justify-between border-b border-slate-850 pb-1">
                <span>FIR ID</span>
                <span className="text-indigo-400 font-bold">{node.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1">
                <span>Crime Type</span>
                <span>{node.category || 'Theft'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1">
                <span>Intake Date</span>
                <span>{node.date || '2026-07-22'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Investigator</span>
                <span>{node.officer || 'Inspector Patil'}</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg text-3xs text-slate-400 leading-relaxed font-sans">
              Case files list co-defendants linked through mobile geolocation clusters.
            </div>
          </div>
        )}

        {/* ── POLICE STATION DETAILED PANEL ── */}
        {node.type === 'Police Station' && (
          <div className="space-y-3">
            <div className="space-y-2 text-3xs font-mono">
              <div className="flex justify-between border-b border-slate-850 pb-1">
                <span>Station Name</span>
                <span className="text-slate-200 font-bold">{node.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1">
                <span>District Zone</span>
                <span>{node.district || 'Bengaluru City'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1">
                <span>Connected Cases</span>
                <span className="text-indigo-400 font-bold">5 active</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Offenders Monitored</span>
                <span className="text-red-400 font-bold">8 monitored</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
