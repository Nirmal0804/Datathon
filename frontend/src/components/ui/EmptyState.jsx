import React from 'react';
import { motion } from 'framer-motion';
import { FileX, MapPin, Bell, SearchX, BarChart2, Network, ShieldOff } from 'lucide-react';

const CONFIGS = {
  'no-records': {
    Icon: FileX,
    title: 'No Crime Records Found',
    subtitle: 'No records match your current filters. Try adjusting the date range or district selection.',
    action: 'Clear Filters',
  },
  'no-hotspots': {
    Icon: MapPin,
    title: 'No Active Hotspots',
    subtitle: 'No high-risk zones detected for the selected parameters. The area appears to be within normal thresholds.',
    action: 'View All Zones',
  },
  'no-reports': {
    Icon: BarChart2,
    title: 'No Reports Generated',
    subtitle: 'You haven\'t generated any reports yet. Create your first intelligence report to get started.',
    action: 'Generate Report',
  },
  'no-alerts': {
    Icon: Bell,
    title: 'All Clear',
    subtitle: 'No active alerts or anomalies detected. The system is operating within normal parameters.',
    action: 'View History',
  },
  'no-results': {
    Icon: SearchX,
    title: 'No Results Found',
    subtitle: 'Your search returned no matches. Try different keywords or adjust your filters.',
    action: 'Clear Search',
  },
  'no-network': {
    Icon: Network,
    title: 'No Network Data',
    subtitle: 'No entity relationships found for this query. Expand the search radius or check different identifiers.',
    action: 'Expand Search',
  },
  'unauthorized': {
    Icon: ShieldOff,
    title: 'Access Restricted',
    subtitle: 'You do not have permission to view this content. Contact your administrator to request access.',
    action: 'Go Back',
  },
};

export function EmptyState({ type = 'no-results', onAction, actionLabel, className = '' }) {
  const config = CONFIGS[type] || CONFIGS['no-results'];
  const { Icon, title, subtitle, action } = config;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-5 shadow-card">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-6">{subtitle}</p>
      {onAction && (
        <button onClick={onAction} className="btn-secondary btn-sm">
          {actionLabel || action}
        </button>
      )}
    </motion.div>
  );
}
