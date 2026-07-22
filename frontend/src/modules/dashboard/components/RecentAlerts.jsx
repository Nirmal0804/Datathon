import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertCircle, Info, ExternalLink } from 'lucide-react';

const alerts = [
  {
    type: 'critical',
    title: 'Anomaly: Hubballi North',
    desc: 'Sudden 40% spike in vehicle theft in the last 24h — ML model flagged.',
    time: '10m ago',
    Icon: Zap,
  },
  {
    type: 'warning',
    title: 'New Network Node Detected',
    desc: 'Repeat offender linked to known syndicate spotted in Mangaluru.',
    time: '1h ago',
    Icon: AlertCircle,
  },
  {
    type: 'info',
    title: 'Predictive Model Retrained',
    desc: 'Risk scoring model updated with Q3 data — accuracy improved to 91.2%.',
    time: '3h ago',
    Icon: Info,
  },
];

const typeStyles = {
  critical: 'text-danger  bg-danger/10  border-danger/20',
  warning:  'text-warning bg-warning/10 border-warning/20',
  info:     'text-info    bg-info/10    border-info/20',
};

export default function RecentAlerts() {
  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="section-title text-sm">System Alerts</h3>
        <button className="btn-ghost btn-sm text-primary" aria-label="View all alerts">
          View All
        </button>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto no-scrollbar">
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-3 p-3 rounded-lg hover:bg-surface-2/50 border border-transparent hover:border-border transition-all duration-150 cursor-pointer group"
            role="listitem"
          >
            <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${typeStyles[alert.type]}`}>
              <alert.Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary leading-snug">{alert.title}</p>
                <span className="text-2xs text-text-muted whitespace-nowrap shrink-0 mt-0.5">{alert.time}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{alert.desc}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
