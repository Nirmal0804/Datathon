import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, Info, ExternalLink } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';
import { useTranslation } from '../../../i18n';

const typeStyles = {
  critical: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    labelKey: 'feed.highSeverity',
    defaultLabel: 'High Severity',
    iconClass: 'text-red-700 bg-red-100 border-red-200',
    cardClass: 'bg-[#FEF2F2] border-[#E7EAF0] border-l-red-500 border-l-4 hover:border-l-red-600',
    Icon: Zap
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    labelKey: 'feed.mediumSeverity',
    defaultLabel: 'Medium Severity',
    iconClass: 'text-amber-700 bg-amber-100 border-amber-200',
    cardClass: 'bg-[#FFF8E7] border-[#E7EAF0] border-l-[#C79A2B] border-l-4 hover:border-l-[#B45309]',
    Icon: AlertCircle
  },
  info: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    labelKey: 'feed.lowSeverity',
    defaultLabel: 'Low Severity',
    iconClass: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    cardClass: 'bg-[#F0FDF4] border-[#E7EAF0] border-l-emerald-500 border-l-4 hover:border-l-emerald-600',
    Icon: Info
  },
};

export default function RecentAlerts({ data }) {
  const { t } = useTranslation();
  const alerts = (data || []).slice(0, 3);

  const getAlertTitle = (title) => {
    const map = {
      'Cybercrime Surge': t('alerts.cybercrimeSurgeTitle', 'Cybercrime Surge'),
      'Property Theft Alert': t('alerts.propertyTheftTitle', 'Property Theft Alert'),
      'Narcotics Syndicate Node': t('alerts.narcoticsNodeTitle', 'Narcotics Syndicate Node'),
      'Data Reconciliation Complete': t('alerts.dataReconciliationTitle', 'Data Reconciliation Complete'),
      'Repeat Offender Alert': t('alerts.repeatOffenderTitle', 'Repeat Offender Alert'),
    };
    return map[title] || title;
  };

  const getAlertDesc = (desc) => {
    const map = {
      'Phishing cases spiked 35% in Bengaluru City during last 48 hours.': t('alerts.cybercrimeSurgeDesc', 'Phishing cases spiked 35% in Bengaluru City during last 48 hours.'),
      'Unusual nighttime burglary pattern spotted in Saraswathipuram, Mysuru.': t('alerts.propertyTheftDesc', 'Unusual nighttime burglary pattern spotted in Saraswathipuram, Mysuru.'),
      'Syndicate transport route flagged near Hubballi-Dharwad highway checkpost.': t('alerts.narcoticsNodeDesc', 'Syndicate transport route flagged near Hubballi-Dharwad highway checkpost.'),
      'Weekly Crime & Criminal Tracking Network Systems (CCTNS) databases synced.': t('alerts.dataReconciliationDesc', 'Weekly Crime & Criminal Tracking Network Systems (CCTNS) databases synced.'),
      'Known financial fraud offender spotted near bank cluster in Mangaluru.': t('alerts.repeatOffenderDesc', 'Known financial fraud offender spotted near bank cluster in Mangaluru.'),
    };
    return map[desc] || desc;
  };

  const getAlertTime = (time) => {
    const map = {
      '10m ago': t('common.tenMinAgo', '10m ago'),
      '24m ago': t('common.twentyFourMinAgo', '24m ago'),
      '45m ago': t('common.fortyFiveMinAgo', '45m ago'),
      '1h ago': t('common.oneHourAgo', '1h ago'),
      '2h ago': t('common.twoHoursAgo', '2h ago'),
      '3h ago': t('common.threeHoursAgo', '3h ago'),
      '4h ago': t('common.fourHoursAgo', '4h ago'),
      '6h ago': t('common.sixHoursAgo', '6h ago'),
      '1d ago': t('common.oneDayAgo', '1d ago'),
      '2d ago': t('common.twoDaysAgo', '2d ago'),
      'Just now': t('common.justNow', 'Just now'),
    };
    return map[time] || time;
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-7 sm:p-8 shadow-sm flex flex-col h-auto lg:h-[400px] justify-between w-full">
      <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-red-50 text-red-700">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-extrabold text-[#0F172A] tracking-tight">{t('feed.securityAlertsTitle', 'Security Alerts')}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{t('feed.aiAnomalyFeed', 'Automated AI anomaly feed')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-bold text-[#1E3A8A] hover:text-[#0F172A] hover:underline transition-colors shrink-0 uppercase tracking-widest cursor-pointer">
            {t('feed.viewAll', 'View All')}
          </button>
          <span className="text-[10px] font-extrabold text-white bg-red-600 px-2 py-0.5 rounded-full shadow-sm shrink-0" title="Total active anomalies">
            {data?.length || 0}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <EmptyState type="alerts" compact={true} />
          ) : (
            alerts.map((alert, i) => {
              const cfg = typeStyles[alert.type] || typeStyles.info;
              const AlertIcon = cfg.Icon;
              return (
                <motion.div
                  key={alert.title + i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className={`flex gap-4 p-4.5 rounded-[16px] border hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-sm ${cfg.cardClass}`}
                  role="listitem"
                >
                  {/* Left severity indicator icon */}
                  <div className={`p-2.5 rounded-xl border shrink-0 flex items-center justify-center ${cfg.iconClass}`}>
                    <AlertIcon className="w-4 h-4 shrink-0" />
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`border ${cfg.badge} py-0.5 px-2 rounded-full text-[9px] font-bold uppercase tracking-wider`}>
                        {t(cfg.labelKey, cfg.defaultLabel)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                        {getAlertTime(alert.time)}
                      </span>
                    </div>
                    <p className="text-[14px] font-extrabold text-[#0F172A] leading-snug group-hover:text-[#1E3A8A] transition-colors pr-2">
                      {getAlertTitle(alert.title)}
                    </p>
                    <p className="text-[12px] font-medium text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                      {getAlertDesc(alert.desc)}
                    </p>
                  </div>

                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 self-start" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

