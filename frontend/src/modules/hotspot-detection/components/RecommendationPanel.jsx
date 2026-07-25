import React, { useMemo } from 'react';
import { ClipboardList, ShieldAlert, Award, FileText } from 'lucide-react';

export default function RecommendationPanel({ hotspot }) {
  const recommendations = useMemo(() => {
    if (!hotspot) return null;

    const isCritical = hotspot.riskLevel === 'Critical';
    const isHigh = hotspot.riskLevel === 'High';
    const growth = hotspot.growthPercentage;
    const type = hotspot.dominantCrime;

    let strategy = 'Maintain Regular Area Sweeps';
    let details = 'Hotspot indices are stable. Recommend normal precinct patrol logging and regular safety coordination.';
    let steps = ['Standard patrol sweeps', 'Weekly database syncs'];

    if (isCritical || isHigh) {
      if (growth > 20) {
        strategy = 'Immediate Intercept Deployment & Checkpoints';
        details = `High-density alert. Active growth index of +${growth}% suggests emerging criminal activity. Deploy tactical units and checkpoints.`;
        steps = [
          'Set up static vehicle checkposts (ANPR logs)',
          'Establish late-night patrol rounds (22:00 - 04:00)',
          'Deploy plainclothes intelligence officers'
        ];
      } else {
        strategy = 'Deploy Additional Patrol Units & CCTV Audits';
        details = 'Sustained threat indices require permanent precinct coverage. Audit surveillance grids and increase presence.';
        steps = [
          'Verify CCTV connection uptime to Command Hub',
          'Deploy double-officer patrol units',
          'Coordinate coordinate sweeps with border precinct stations'
        ];
      }
    }

    // Category overrides
    if (type === 'Cybercrime' || type === 'Financial Fraud') {
      strategy = isCritical ? 'Cyber Division Investigation Required' : 'Public Counter-Fraud Campaigns';
      details = 'Spike in online scam registers. Requires corporate security audits and card reader inspections.';
      steps = [
        'Audit ATM terminal card readers (check for skimmers)',
        'Release caution notices to local business clusters',
        'Liaise with State Cyber Crime division cell'
      ];
    } else if (type === 'Narcotics') {
      strategy = 'Highway Drug Sweeps & Interceptions';
      details = 'Syndicate transport drop flagged near borders. Conduct vehicular checkpoints.';
      steps = [
        'Inspect cargo carriers at border toll boundaries',
        'Verify interstate commercial shipping documentation',
        'Deploy narcotics sniffing dog units'
      ];
    }

    return {
      strategy,
      details,
      steps
    };
  }, [hotspot]);

  if (!hotspot) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center h-full flex flex-col justify-center items-center text-slate-500 shadow-md">
        <ClipboardList className="w-10 h-10 text-slate-700 mb-3 animate-pulse-soft" />
        <h3 className="text-sm font-bold text-white mb-1">Select a Hotspot</h3>
        <p className="text-4xs text-slate-400">Click a record in the ranking table to construct strategic recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md flex flex-col justify-between h-full">
      <div className="space-y-4">
        
        {/* Title */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Award className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Strategic Policy Directives</h3>
            <p className="text-4xs text-slate-400 mt-0.5 font-mono">Intelligence recommendations for {hotspot.hotspotId}.</p>
          </div>
        </div>

        {/* Action Strategy */}
        <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
          <span className="inline-flex items-center gap-1.5 text-4xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded">
            Strategy Protocol
          </span>
          <h4 className="text-xs font-bold text-white mt-1">{recommendations.strategy}</h4>
          <p className="text-slate-400 text-3xs leading-relaxed mt-1.5">{recommendations.details}</p>
        </div>

        {/* Action Checkpoints */}
        <div className="space-y-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-4xs flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Actionable Beat Plan
          </span>
          <div className="space-y-2">
            {recommendations.steps.map((step, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950/20 border border-slate-850 rounded-lg text-slate-200 text-xs flex items-start gap-3">
                <span className="w-4 h-4 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-[9px] text-indigo-400 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
