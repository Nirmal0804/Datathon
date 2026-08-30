import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { useTranslation } from '../../../i18n';

const cases = [
  { id: 'FIR-2023-0892', category: 'Cybercrime', time: '2 hours ago', risk: 'High' },
  { id: 'FIR-2023-0891', category: 'Property', time: '5 hours ago', risk: 'Medium' },
  { id: 'FIR-2023-0890', category: 'Violent', time: '1 day ago', risk: 'Critical' },
  { id: 'FIR-2023-0889', category: 'Narcotics', time: '1 day ago', risk: 'Medium' },
];

export default function RecentCases() {
  const { t } = useTranslation();
  const toast = useToast();

  const handleInspect = (caseId) => {
    toast.success(t('cases.inspectionModeActive', 'Inspection Mode Active'), `${t('cases.openingDossierLog', 'Opening database dossier log for Case')} ${caseId}.`);
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'Cybercrime': return t('categories.cybercrime', 'Cybercrime');
      case 'Property': return t('categories.property', 'Property');
      case 'Violent': return t('categories.violentCrime', 'Violent');
      case 'Narcotics': return t('categories.narcotics', 'Narcotics');
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

  const getTimeLabel = (time) => {
    const map = {
      '2 hours ago': t('common.twoHoursAgo', '2 hours ago'),
      '5 hours ago': t('common.fiveHoursAgo', '5 hours ago'),
      '1 day ago': t('common.oneDayAgo', '1 day ago'),
    };
    return map[time] || time;
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#0B1F4D]/5 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#0B1F4D]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider mb-1">{t('dashboard.recentCases', 'Recent Case Intake')}</h3>
            <p className="text-xs font-semibold text-[#64748B]">{t('dashboard.liveIncidentFeed', 'Live Activity Feed')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {cases.map((c, idx) => (
          <motion.div 
            key={c.id} 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="group flex justify-between items-center p-3 hover:bg-[#F8F9FB] rounded-xl transition-all duration-200 border border-transparent hover:border-[#E7ECF3] cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full shadow-sm shrink-0 ${
                c.risk === 'Critical' ? 'bg-rose-500' :
                c.risk === 'High' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-sm font-bold text-[#0F172A]">{c.id}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                    c.risk === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    c.risk === 'High' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {getRiskLabel(c.risk)}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{getCategoryLabel(c.category)} • {getTimeLabel(c.time)}</p>
              </div>
            </div>
            <button 
              onClick={() => handleInspect(c.id)}
              className="w-8 h-8 rounded-full bg-white border border-[#E7ECF3] flex items-center justify-center text-[#0B1F4D] hover:bg-[#0B1F4D] hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
