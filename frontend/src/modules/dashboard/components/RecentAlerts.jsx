import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, Info, ExternalLink } from 'lucide-react';

const typeStyles = {
  critical: {
    badge: 'badge-critical',
    label: 'High Severity',
    iconClass: 'text-danger bg-danger/10 border-danger/20',
    Icon: Zap
  },
  warning: {
    badge: 'badge-high',
    label: 'Medium Severity',
    iconClass: 'text-warning bg-warning/10 border-warning/20',
    Icon: AlertCircle
  },
  info: {
    badge: 'badge-medium',
    label: 'Low Severity',
    iconClass: 'text-info bg-info/10 border-info/20',
    Icon: Info
  },
};

export default function RecentAlerts({ data }) {
  const alerts = (data || []).slice(0, 3);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[280px] justify-between">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2.5 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-white">Security Alerts</h3>
          <p className="text-4xs text-slate-500 mt-0.5 font-sans">Automated AI anomaly feed.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-4xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors shrink-0">
            View All
          </button>
          <span className="text-4xs font-mono font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded shrink-0" title="Total active anomalies">
            {data?.length || 0}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-10">
              <Info className="w-8 h-8 opacity-45 text-slate-600 mb-2" />
              <p className="text-xs">No active anomalies in this scope.</p>
              <p className="text-3xs text-slate-600 mt-0.5">Systems operational and clear.</p>
            </div>
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
                  className="flex gap-3.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/40 hover:bg-slate-800/40 hover:border-slate-700/60 transition-all duration-150 cursor-pointer group"
                  role="listitem"
                >
                  {/* Left severity indicator icon */}
                  <div className={`p-2 rounded-lg border shrink-0 h-9 w-9 flex items-center justify-center ${cfg.iconClass}`}>
                    <AlertIcon className="w-4 h-4 shrink-0" />
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`badge ${cfg.badge} py-0 px-1.5 text-4xs font-bold`}>
                        {cfg.label}
                      </span>
                      <span className="text-4xs text-slate-500 font-mono shrink-0">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-1.5 leading-snug group-hover:text-white transition-colors truncate">
                      {alert.title}
                    </p>
                    <p className="text-3xs text-slate-400 mt-1 leading-relaxed">
                      {alert.desc}
                    </p>
                  </div>

                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 self-start" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
