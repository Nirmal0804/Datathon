import React from 'react';
import CrimeTablePlaceholder from './CrimeTablePlaceholder';
import { MOCK_CASES } from './mockData';
import { Briefcase, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function FieldOfficerAssignedCases() {
  const { t } = useTranslation();
  // Filter cases assigned to Inspector Patil (dynamic officer filter remains intact)
  const patilCases = MOCK_CASES.filter(c => c.details?.officer === 'Inspector Patil');

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      {/* 1. Compact Page Header Banner */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[80px] shrink-0">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0 shadow-xs">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#C79A2B]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">{t('cases.title', 'Your Assigned Cases')}</h2>
              <span className="bg-[#0B1F4D]/10 text-[#0B1F4D] border border-[#0B1F4D]/20 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] sm:text-xs">
                {patilCases.length} {t('cases.activeIntakes', 'Active Intakes')}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              {t('cases.subtitle', 'Roster of active crime investigations delegated to your precinct.')}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#F8F9FB] border border-[#E7ECF3] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0F172A]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t('cases.dutyStatus', 'Duty Status: Active On-Field')}</span>
        </div>
      </div>
      
      {/* 2. Expanded Table Grid displaying only Patil's assigned cases */}
      <CrimeTablePlaceholder 
        data={patilCases} 
        itemsPerPage={10} 
        title={t('cases.title', 'Assigned Case Roster')} 
        subtitle={t('cases.subtitle', 'Real-time case intakes assigned to your precinct')} 
      />
    </div>
  );
}
