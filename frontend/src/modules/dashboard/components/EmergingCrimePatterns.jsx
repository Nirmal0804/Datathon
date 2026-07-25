import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BrainCircuit, ShieldAlert, TrendingUp } from 'lucide-react';

export default function EmergingCrimePatterns() {
  const patterns = [
    {
      title: 'Property Theft Cluster',
      location: 'Mysuru (Saraswathipuram Sector)',
      riskScore: '84%',
      confidence: 'High',
      desc: 'Repeated nighttime residential burglary signatures matching syndicate patterns.'
    },
    {
      title: 'Phishing / Cyber Spike',
      location: 'Bengaluru City (Whitefield Sector)',
      riskScore: '92%',
      confidence: 'Critical',
      desc: '300% surge in financial impersonation scams logged at cyber units in 48h.'
    },
    {
      title: 'Narcotics Route Drift',
      location: 'Hubballi-Dharwad Border Checkpost',
      riskScore: '78%',
      confidence: 'Medium',
      desc: 'ML trajectory forecasting models predicted new transport syndicate path node.'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[390px] justify-between">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Emerging Crime Patterns (AI)</h3>
        </div>
        <span className="text-4xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
          ML Model Flagged
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5">
        {patterns.map((pat, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850/60 text-xs hover:border-slate-800 transition-colors flex items-start gap-3">
            {/* Risk icon color */}
            <div className={`p-1.5 rounded-md border shrink-0 mt-0.5 ${
              pat.confidence === 'Critical' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
              pat.confidence === 'High' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
              'text-blue-400 bg-blue-500/10 border-blue-500/20'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-200 truncate">{pat.title}</span>
                <span className="text-4xs font-mono font-bold text-slate-500 whitespace-nowrap">
                  Risk Level: <span className={
                    pat.confidence === 'Critical' ? 'text-rose-400' :
                    pat.confidence === 'High' ? 'text-amber-400' :
                    'text-blue-400'
                  }>{pat.riskScore}</span>
                </span>
              </div>
              <p className="text-4xs text-slate-500 font-mono mt-0.5 truncate">{pat.location}</p>
              <p className="text-4xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {pat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
