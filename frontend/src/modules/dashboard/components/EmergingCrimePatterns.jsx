import React from 'react';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function EmergingCrimePatterns() {
  const { t } = useTranslation();

  const patterns = [
    {
      title: 'Property Theft Cluster',
      location: 'Mysuru (Saraswathipuram Sector)',
      riskScore: 84, // percentage as number
      confidence: 'High',
      confidenceKey: 'common.high',
      desc: 'Repeated nighttime residential burglary signatures matching syndicate patterns.'
    },
    {
      title: 'Phishing / Cyber Spike',
      location: 'Bengaluru City (Whitefield Sector)',
      riskScore: 92,
      confidence: 'Critical',
      confidenceKey: 'common.critical',
      desc: '300% surge in financial impersonation scams logged at cyber units in 48h.'
    },
    {
      title: 'Narcotics Route Drift',
      location: 'Hubballi-Dharwad Checkpost',
      riskScore: 78,
      confidence: 'Medium',
      confidenceKey: 'common.medium',
      desc: 'ML trajectory forecasting models predicted new transport syndicate path node.'
    },
    {
      title: 'Commercial Burglary Trend',
      location: 'Belagavi Central Market',
      riskScore: 88,
      confidence: 'High',
      confidenceKey: 'common.high',
      desc: 'Automated cluster alert: multi-store forced entries logged post-midnight.'
    },
    {
      title: 'Inter-district Vehicle Theft',
      location: 'Ballari Highway Sector 4',
      riskScore: 73,
      confidence: 'Medium',
      confidenceKey: 'common.medium',
      desc: 'High correlation with regional organized vehicle stripping operations.'
    }
  ];

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 sm:p-7 shadow-sm flex flex-col h-[560px] min-h-[560px] justify-between transition-all duration-200">
      
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#E7EAF0] pb-3 mb-3 shrink-0">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-[15px] font-bold text-[#0F172A] tracking-tight leading-tight">
              {t('dashboard.emergingPatterns', 'Emerging Crime Patterns (AI)')}
            </h3>
            <p className="text-[11px] font-medium text-[#64748B] mt-0.5">
              {t('dashboard.patternsSubtitle', 'AI-powered intelligence insights')}
            </p>
          </div>
        </div>
        
        {/* Status Chip */}
        <div className="flex items-center gap-1.5 bg-[#15803D]/10 px-2 py-0.5 rounded-full border border-[#15803D]/20 shrink-0 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
          <span className="text-[9px] font-bold text-[#15803D] uppercase tracking-wider">
            {t('admin.running', 'AI Analysis Running')}
          </span>
        </div>
      </div>

      {/* AI Summary (Today) */}
      <div className="shrink-0 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {t('dashboard.emergingPatterns', 'AI Summary')}
          </span>
          <span className="text-[11px] font-extrabold text-[#0F172A]">
            12 {t('dashboard.records', 'Active Patterns')}
          </span>
        </div>
        
        {/* Distribution Bar */}
        <div className="flex w-full h-1.5 rounded-full overflow-hidden mb-2 shadow-sm">
          <div className="bg-rose-500 w-[15%]" title="Critical: 2" />
          <div className="bg-[#C79A2B] w-[40%]" title="High: 5" />
          <div className="bg-blue-500 w-[35%]" title="Medium: 4" />
          <div className="bg-emerald-500 w-[10%]" title="Low: 1" />
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 bg-[#F7F8FA] rounded-lg p-1.5 flex flex-col items-center justify-center border border-[#E7EAF0]">
            <span className="text-[12px] font-extrabold text-rose-600">2</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase">{t('common.critical', 'Critical')}</span>
          </div>
          <div className="flex-1 bg-[#F7F8FA] rounded-lg p-1.5 flex flex-col items-center justify-center border border-[#E7EAF0]">
            <span className="text-[12px] font-extrabold text-[#C79A2B]">5</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase">{t('common.high', 'High')}</span>
          </div>
          <div className="flex-1 bg-[#F7F8FA] rounded-lg p-1.5 flex flex-col items-center justify-center border border-[#E7EAF0]">
            <span className="text-[12px] font-extrabold text-blue-600">4</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase">{t('common.medium', 'Medium')}</span>
          </div>
          <div className="flex-1 bg-[#F7F8FA] rounded-lg p-1.5 flex flex-col items-center justify-center border border-[#E7EAF0]">
            <span className="text-[12px] font-extrabold text-emerald-600">1</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase">{t('common.low', 'Low')}</span>
          </div>
        </div>
      </div>

      {/* Pattern Cards List */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
        {patterns.map((pat, i) => {
          let borderColor = 'border-l-blue-500';
          let progressColor = 'bg-blue-500';
          let textColor = 'text-blue-600';
          
          if (pat.confidence === 'Critical') {
            borderColor = 'border-l-rose-500';
            progressColor = 'bg-rose-500';
            textColor = 'text-rose-600';
          } else if (pat.confidence === 'High') {
            borderColor = 'border-l-[#C79A2B]';
            progressColor = 'bg-[#C79A2B]';
            textColor = 'text-[#C79A2B]';
          } else if (pat.confidence === 'Low') {
            borderColor = 'border-l-emerald-500';
            progressColor = 'bg-emerald-500';
            textColor = 'text-emerald-600';
          }

          return (
            <div key={i} className={`px-3 py-2 rounded-[14px] bg-white border border-[#E5E7EB] border-l-4 ${borderColor} hover:shadow-sm transition-shadow flex flex-col gap-1.5 group cursor-pointer shrink-0`}>
              <div className="flex justify-between items-center">
                <div className="min-w-0 flex-1 pr-3">
                  <h4 className="font-bold text-[#0F172A] text-[12px] truncate">{pat.title}</h4>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] font-bold uppercase ${textColor}`}>
                    {t(pat.confidenceKey, pat.confidence)}
                  </span>
                  <span className="text-[10px] font-extrabold text-[#0F172A]">{pat.riskScore}%</span>
                </div>
              </div>
              <p className="text-[10px] text-[#64748B] leading-tight line-clamp-1 w-full">
                {pat.desc}
              </p>
              {/* Thin Progress Bar */}
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                <div className={`h-full ${progressColor}`} style={{ width: `${pat.riskScore}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-[#E7EAF0] flex justify-center shrink-0 mt-2">
        <button className="text-[11px] font-bold text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer">
          {t('dashboard.viewAll', 'View All Patterns')} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
