import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALERTS_DATA } from '../../../mock/analyticsData';
import { AlertOctagon, Clock, UserCheck, ShieldAlert, Zap } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function AnomalyDetection({ timeFilter }) {
  const { t } = useTranslation();
  // Filter alerts simulated by timeFilter
  const activeAlerts = useMemo(() => {
    if (timeFilter === 'Today') {
      return ALERTS_DATA.slice(0, 1);
    }
    if (timeFilter === 'This Week') {
      return ALERTS_DATA.slice(0, 2);
    }
    return ALERTS_DATA;
  }, [timeFilter]);

  const severityStyles = {
    Critical: 'bg-rose-50 text-rose-600 border border-rose-200',
    High: 'bg-orange-50 text-orange-600 border border-orange-200',
    Medium: 'bg-emerald-50 text-emerald-600 border border-emerald-200'
  };

  const severityIcons = {
    Critical: '🔴',
    High: '🟠',
    Medium: '🟢'
  };

  const getSeverityLabel = (s) => {
    switch (s) {
      case 'Critical': return t('common.critical', 'Critical');
      case 'High': return t('common.high', 'High');
      case 'Medium': return t('common.medium', 'Medium');
      case 'Low': return t('common.low', 'Low');
      default: return s;
    }
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm space-y-4 flex flex-col h-full justify-between">
      
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-[#C79A2B] animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wider">{t('dashboard.recentAlerts', 'Automatic Intelligence Alerts')}</h3>
              <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">{t('analytics.anomaliesTriggered', 'AI outlier models detecting precinct threat increases in real-time.')}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
            <Zap className="w-3 h-3" /> {t('dashboard.liveSync', 'Live Feed')}
          </span>
        </div>

        {/* Alerts list */}
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {activeAlerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] flex flex-col sm:flex-row gap-4 items-start hover:border-[#CBD5E1] transition-colors cursor-default shadow-sm"
              >
                {/* Left: Severity & Category */}
                <div className="w-full sm:w-32 shrink-0 flex flex-col gap-1.5 border-b sm:border-b-0 sm:border-r border-[#E2E8F0] pb-3 sm:pb-0 sm:pr-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider w-fit ${
                    severityStyles[alert.severity] || severityStyles.Medium
                  }`}>
                    <span className="text-[8px]">{severityIcons[alert.severity] || '🟢'}</span>
                    <span>{getSeverityLabel(alert.severity)}</span>
                  </span>
                  <span className="text-[11px] text-[#0B1F4D] font-bold mt-1 block leading-tight">{alert.crimeType}</span>
                </div>

                {/* Center: Description & Recommendation */}
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#0B1F4D] font-medium leading-relaxed mb-2">{alert.text}</p>
                  
                  {/* AI recommendations */}
                  <div className="p-2.5 bg-white border border-[#E7ECF3] rounded-xl text-[10px] font-medium text-[#64748B] leading-relaxed flex items-start gap-2 shadow-sm">
                    <AlertOctagon className="w-4 h-4 text-[#C79A2B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0B1F4D] uppercase tracking-wider text-[9px] block mb-0.5">{t('district.aiRecommendations', 'AI Recommendation')}</span>
                      {alert.recommendation}
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp & Status */}
                <div className="w-full sm:w-24 shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-[#E2E8F0] pt-3 sm:pt-0">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider bg-[#F1F5F9] px-2 py-1 rounded-md">{t('common.status', 'New')}</span>
                  <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#E7ECF3] shadow-sm">
                    <Clock className="w-3 h-3 text-[#C79A2B]" />
                    {alert.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
