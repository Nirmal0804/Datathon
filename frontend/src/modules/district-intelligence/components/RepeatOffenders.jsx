import React from 'react';
import { motion } from 'framer-motion';
import { User, Eye } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

const OFFENDERS_DATA = [
  {
    name: 'Ramesh Kumar',
    firsCount: 12,
    category: 'Armed Robbery',
    lastReported: '2026-07-22',
    riskLevel: 'Critical',
    jurisdiction: 'Cubbon Park PS',
    initials: 'RK',
    bg: 'bg-red-500/10 text-red-400'
  },
  {
    name: 'Suresh Gowda',
    firsCount: 9,
    category: 'Narcotics Trafficking',
    lastReported: '2026-07-20',
    riskLevel: 'Critical',
    jurisdiction: 'Devaraja PS',
    initials: 'SG',
    bg: 'bg-rose-500/10 text-rose-450'
  },
  {
    name: 'Anand Shekar',
    firsCount: 7,
    category: 'Phishing Fraud',
    lastReported: '2026-07-18',
    riskLevel: 'High',
    jurisdiction: 'Indiranagar PS',
    initials: 'AS',
    bg: 'bg-orange-500/10 text-orange-400'
  },
  {
    name: 'Mohammad Ali',
    firsCount: 6,
    category: 'Vehicle Theft',
    lastReported: '2026-07-14',
    riskLevel: 'Medium',
    jurisdiction: 'Gokul Road PS',
    initials: 'MA',
    bg: 'bg-amber-500/10 text-amber-400'
  },
  {
    name: 'Priya Nair',
    firsCount: 4,
    category: 'Financial Fraud',
    lastReported: '2026-07-10',
    riskLevel: 'Low',
    jurisdiction: 'Whitefield PS',
    initials: 'PN',
    bg: 'bg-emerald-500/10 text-emerald-450'
  },
  {
    name: 'Vikram Singh',
    firsCount: 3,
    category: 'Property Trespass',
    lastReported: '2026-07-05',
    riskLevel: 'Low',
    jurisdiction: 'Vidyanagar PS',
    initials: 'VS',
    bg: 'bg-slate-700/30 text-slate-400'
  }
];

export default function RepeatOffenders({ onSelectOffender }) {
  const toast = useToast();

  const handleViewProfile = (name) => {
    toast.success('Dossier Unlocked', `Successfully retrieved intelligence records profile for ${name}.`);
    if (onSelectOffender) {
      onSelectOffender(name);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-lg font-semibold text-white">Repeat Offenders</h3>
          <p className="text-xs text-slate-400 mt-0.5">District surveillance roster categorized by prior charges and threat risk rates.</p>
        </div>
        <span className="text-4xs font-mono font-bold bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded uppercase">
          Surveillance Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OFFENDERS_DATA.map((offender, idx) => {
          const isCritical = offender.riskLevel === 'Critical';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -3, scale: 1.01, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}
              onClick={() => handleViewProfile(offender.name)}
              className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-start gap-4 transition-all duration-200 hover:border-slate-700 cursor-pointer"
            >
              {/* Profile Avatar */}
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 border border-slate-700 shrink-0">
                {offender.initials}
              </div>

              {/* Detail fields */}
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm truncate">{offender.name}</h4>
                  <p className="text-4xs text-slate-500 font-mono mt-0.5">{offender.jurisdiction}</p>
                </div>

                <div className="space-y-1 text-3xs">
                  <div className="flex justify-between">
                    <span className="text-slate-450">Previous FIRs</span>
                    <span className="font-mono font-bold text-slate-200">{offender.firsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Crime Type</span>
                    <span className="text-slate-200 truncate max-w-28">{offender.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Last Active</span>
                    <span className="font-mono text-slate-250">{offender.lastReported}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850/60">
                  {/* Critical Badge Pulsing Animation */}
                  {isCritical ? (
                    <motion.span 
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20"
                    >
                      <span>🔴</span>
                      <span>{offender.riskLevel}</span>
                    </motion.span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      offender.riskLevel === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      offender.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      <span>
                        {offender.riskLevel === 'High' ? '🟠' :
                         offender.riskLevel === 'Medium' ? '🟡' : '🟢'}
                      </span>
                      <span>{offender.riskLevel}</span>
                    </span>
                  )}

                  {/* View dossier action button */}
                  <button
                    onClick={() => handleViewProfile(offender.name)}
                    className="inline-flex items-center gap-1.5 text-3xs font-bold text-primary hover:text-primary-hover hover:underline transition-all duration-200 group cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
                    <span>Dossier</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
