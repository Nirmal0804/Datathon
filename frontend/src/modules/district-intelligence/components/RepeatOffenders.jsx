import React from 'react';
import { motion } from 'framer-motion';
import { User, Eye, ShieldAlert, FileText, Calendar } from 'lucide-react';
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
    bg: 'bg-rose-50 text-rose-700',
    badge: 'bg-rose-500/10 text-rose-600 border-rose-100'
  },
  {
    name: 'Suresh Gowda',
    firsCount: 9,
    category: 'Narcotics Trafficking',
    lastReported: '2026-07-20',
    riskLevel: 'Critical',
    jurisdiction: 'Devaraja PS',
    initials: 'SG',
    bg: 'bg-rose-50 text-rose-700',
    badge: 'bg-rose-500/10 text-rose-600 border-rose-100'
  },
  {
    name: 'Anand Shekar',
    firsCount: 7,
    category: 'Phishing Fraud',
    lastReported: '2026-07-18',
    riskLevel: 'High',
    jurisdiction: 'Indiranagar PS',
    initials: 'AS',
    bg: 'bg-amber-50 text-amber-700',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-100'
  },
  {
    name: 'Mohammad Ali',
    firsCount: 6,
    category: 'Vehicle Theft',
    lastReported: '2026-07-14',
    riskLevel: 'Medium',
    jurisdiction: 'Gokul Road PS',
    initials: 'MA',
    bg: 'bg-amber-50 text-amber-700',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-100'
  },
  {
    name: 'Priya Nair',
    firsCount: 4,
    category: 'Financial Fraud',
    lastReported: '2026-07-10',
    riskLevel: 'Low',
    jurisdiction: 'Whitefield PS',
    initials: 'PN',
    bg: 'bg-[#F8F9FB] text-slate-700',
    badge: 'bg-slate-100 text-slate-600 border-slate-200'
  },
  {
    name: 'Vikram Singh',
    firsCount: 3,
    category: 'Property Trespass',
    lastReported: '2026-07-05',
    riskLevel: 'Low',
    jurisdiction: 'Vidyanagar PS',
    initials: 'VS',
    bg: 'bg-[#F8F9FB] text-slate-700',
    badge: 'bg-slate-100 text-slate-600 border-slate-200'
  }
];

export default function RepeatOffenders({ onSelectOffender }) {
  const { t } = useTranslation();
  const toast = useToast();

  const handleViewProfile = (name) => {
    toast.success(t('district.dossierUnlocked', 'Dossier Unlocked'), `${t('district.dossierUnlockedDesc', 'Successfully retrieved intelligence records profile for')} ${name}.`);
    if (onSelectOffender) {
      onSelectOffender(name);
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'Armed Robbery': return t('categories.violentCrime', 'Armed Robbery');
      case 'Narcotics Trafficking': return t('categories.narcotics', 'Narcotics Trafficking');
      case 'Phishing Fraud': return t('categories.cybercrime', 'Phishing Fraud');
      case 'Vehicle Theft': return t('categories.propertyTheft', 'Vehicle Theft');
      case 'Financial Fraud': return t('categories.financialFraud', 'Financial Fraud');
      case 'Property Trespass': return t('categories.property', 'Property Trespass');
      default: return cat;
    }
  };

  const getRiskLabel = (risk) => {
    switch (risk) {
      case 'Critical': return t('common.critical', 'Critical');
      case 'High': return t('common.high', 'High');
      case 'Medium': return t('common.medium', 'Medium');
      case 'Low': return t('common.low', 'Low');
      default: return risk;
    }
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider mb-1">{t('district.repeatOffendersWatchlist', 'Repeat Offenders Watchlist')}</h3>
          <p className="text-xs font-semibold text-[#64748B]">{t('district.districtSurveillanceRoster', 'District surveillance roster categorized by prior charges.')}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{t('district.activeMonitoring', 'Active Monitoring')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFENDERS_DATA.map((offender, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="group flex flex-col p-4 bg-white border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-[18px] transition-all duration-300 hover:shadow-md"
          >
            {/* Top Row: Avatar, Name, Station, Risk */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${offender.bg}`}>
                  {offender.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0B1F4D] transition-colors">{offender.name}</h4>
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mt-0.5">{offender.jurisdiction}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${offender.badge}`}>
                {getRiskLabel(offender.riskLevel)}
              </span>
            </div>

            {/* Middle Row: FIRs, Type, Last Active */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#F8F9FB] rounded-xl mb-4 border border-[#F1F5F9]/50">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {t('fir.title', 'FIRs')}
                </span>
                <span className="text-sm font-black text-[#0B1F4D]">{offender.firsCount}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-l border-r border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> {t('common.category', 'Category')}
                </span>
                <span className="text-xs font-bold text-[#334155] leading-tight px-1 truncate w-full text-center" title={offender.category}>
                  {getCategoryLabel(offender.category)}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {t('cases.statusActive', 'Active')}
                </span>
                <span className="text-xs font-bold text-[#334155]">{offender.lastReported.split('-').slice(1).join('/')}</span>
              </div>
            </div>

            {/* Bottom Row: Action */}
            <button 
              onClick={() => handleViewProfile(offender.name)}
              className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-[#E7ECF3] hover:bg-[#F8F9FB] hover:border-[#CBD5E1] rounded-[14px] text-xs font-bold text-[#0B1F4D] transition-colors cursor-pointer group/btn"
            >
              <Eye className="w-4 h-4 text-[#64748B] group-hover/btn:text-[#C79A2B] transition-colors" />
              <span>{t('district.viewFullDossier', 'View Full Dossier')}</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
