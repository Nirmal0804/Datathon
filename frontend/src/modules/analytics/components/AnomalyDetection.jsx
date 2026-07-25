import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALERTS_DATA } from '../../../mock/analyticsData';
import { AlertOctagon, Clock, UserCheck, ShieldAlert } from 'lucide-react';

export default function AnomalyDetection({ timeFilter }) {
  // Filter alerts simulated by timeFilter
  const activeAlerts = useMemo(() => {
    // Return subsets to make it update dynamically
    if (timeFilter === 'Today') {
      return ALERTS_DATA.slice(0, 1);
    }
    if (timeFilter === 'This Week') {
      return ALERTS_DATA.slice(0, 2);
    }
    return ALERTS_DATA; // Return all for Month, Year, Custom
  }, [timeFilter]);

  const severityStyles = {
    Critical: 'bg-red-500/10 text-red-400 border border-red-500/25 shadow-[0_0_8px_rgba(239,68,68,0.1)] animate-pulse-soft',
    High: 'bg-orange-500/10 text-orange-405 border border-orange-500/20',
    Medium: 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
  };

  const severityIcons = {
    Critical: '🔴',
    High: '🟠',
    Medium: '🟡'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-full justify-between">
      
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
          <ShieldAlert className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Automatic Intelligence Alerts</h3>
            <p className="text-4xs text-slate-400 mt-0.5 font-sans">AI outlier models detecting precinct threat increases in real-time.</p>
          </div>
        </div>

        {/* Alerts list */}
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar min-h-[260px]">
          <AnimatePresence mode="popLayout">
            {activeAlerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2.5 flex flex-col hover:border-slate-800 transition-colors cursor-default"
              >
                {/* Header info */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      severityStyles[alert.severity] || severityStyles.Medium
                    }`}>
                      <span>{severityIcons[alert.severity] || '🟡'}</span>
                      <span>{alert.severity}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{alert.crimeType}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {alert.timestamp}
                  </span>
                </div>

                {/* Description text */}
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{alert.text}</p>

                {/* AI recommendations */}
                <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg text-3xs text-indigo-300 leading-relaxed flex items-start gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[8px] block mb-0.5">AI Recommendation</span>
                    {alert.recommendation}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
