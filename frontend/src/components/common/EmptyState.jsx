import React from 'react';
import { motion } from 'framer-motion';
import {
  FileX,
  MapPinOff,
  BellOff,
  SearchX,
  BarChart3,
  Network,
  ShieldOff,
  ScrollText,
  FilterX,
  Users,
  FolderOpen,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '../../i18n';

const PRESET_KEYS = {
  search: {
    Icon: SearchX,
    titleKey: 'common.noRecords',
    titleDefault: 'No Results Found',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'Your search returned no matching records. Try checking for spelling errors or adjusting your query terms.',
    actionKey: 'common.clear',
    actionDefault: 'Clear Search',
  },
  filters: {
    Icon: FilterX,
    titleKey: 'common.noRecords',
    titleDefault: 'No Matching Records',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'No records match your selected filter criteria. Try adjusting parameters.',
    actionKey: 'dashboard.clearFilters',
    actionDefault: 'Clear Filters',
  },
  table: {
    Icon: FileX,
    titleKey: 'common.noRecords',
    titleDefault: 'No Data Available',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'There are no active records to display for this view at this time.',
    actionKey: 'dashboard.liveSync',
    actionDefault: 'Refresh Table',
  },
  map: {
    Icon: MapPinOff,
    titleKey: 'common.noRecords',
    titleDefault: 'No Locations to Display',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'No geographic crime incidents or station hotspots correspond to active filters.',
    actionKey: 'map.resetView',
    actionDefault: 'Reset Map View',
  },
  analytics: {
    Icon: BarChart3,
    titleKey: 'common.noRecords',
    titleDefault: 'No Analytics Available',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'No statistical data points exist for the chosen timeframe to generate this visualization.',
    actionKey: 'common.reset',
    actionDefault: 'Reset Parameters',
  },
  network: {
    Icon: Network,
    titleKey: 'common.noRecords',
    titleDefault: 'No Connections Found',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'No criminal entity associations or repeat co-offender relationships detected.',
    actionKey: 'network.expandNetwork',
    actionDefault: 'Expand Network Scope',
  },
  audit: {
    Icon: ScrollText,
    titleKey: 'common.noRecords',
    titleDefault: 'No Audit Events',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'No system security events or authentication logs have been recorded for this filter range.',
    actionKey: 'dashboard.clearFilters',
    actionDefault: 'Reset Log Filters',
  },
  alerts: {
    Icon: BellOff,
    titleKey: 'notifications.noNotifications',
    titleDefault: 'No Active Alerts',
    messageKey: 'notifications.noNotificationsDesc',
    messageDefault: 'All crime intelligence channels and anomaly triggers are operating within normal operational thresholds.',
    actionKey: 'dashboard.viewAll',
    actionDefault: 'View Historical Feed',
  },
  users: {
    Icon: Users,
    titleKey: 'common.noRecords',
    titleDefault: 'No Users Found',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'No officer accounts or system personnel match the selected status or role filters.',
    actionKey: 'dashboard.clearFilters',
    actionDefault: 'Clear User Filter',
  },
  'no-records': {
    Icon: FolderOpen,
    titleKey: 'common.noRecords',
    titleDefault: 'No Crime Records Found',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'No FIR or chargesheet records match your current filters.',
    actionKey: 'dashboard.clearFilters',
    actionDefault: 'Clear Filters',
  },
  'no-results': {
    Icon: SearchX,
    titleKey: 'common.noRecords',
    titleDefault: 'No Results Found',
    messageKey: 'common.noRecordsDesc',
    messageDefault: 'Your query returned no matching entries.',
    actionKey: 'common.clear',
    actionDefault: 'Clear Search',
  },
  unauthorized: {
    Icon: ShieldOff,
    titleKey: 'common.unauthorized',
    titleDefault: 'Access Restricted',
    messageKey: 'common.unauthorizedDesc',
    messageDefault: 'You do not have the required operational clearance to view these intelligence records.',
    actionKey: 'public.dashboard',
    actionDefault: 'Return to Dashboard',
  },
};

/**
 * Production-ready reusable EmptyState component with full i18n support.
 */
export default function EmptyState({
  type = 'table',
  icon: CustomIcon,
  title: customTitle,
  message: customMessage,
  subtitle: legacySubtitle,
  actionLabel: customActionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
  className = '',
}) {
  const { t } = useTranslation();
  const preset = PRESET_KEYS[type] || PRESET_KEYS.table;
  const IconComponent = CustomIcon || preset.Icon;
  const title = customTitle || t(preset.titleKey, preset.titleDefault);
  const message = customMessage || legacySubtitle || t(preset.messageKey, preset.messageDefault);
  const actionLabel = customActionLabel || t(preset.actionKey, preset.actionDefault);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center select-none ${
        compact ? 'py-6 px-4' : 'py-12 sm:py-16 px-6'
      } ${className}`}
    >
      {/* Subtle Icon Badge */}
      <div
        className={`rounded-2xl bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 text-[#0B1F4D] flex items-center justify-center shadow-2xs ${
          compact ? 'w-11 h-11 mb-3' : 'w-14 h-14 sm:w-16 sm:h-16 mb-4.5'
        }`}
      >
        <IconComponent className={compact ? 'w-5 h-5 text-[#0B1F4D]/70' : 'w-7 h-7 text-[#0B1F4D]/75'} />
      </div>

      {/* Title */}
      <h3
        className={`font-extrabold text-[#0F172A] tracking-tight ${
          compact ? 'text-sm mb-1' : 'text-base sm:text-lg mb-2'
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={`text-[#64748B] font-normal leading-relaxed max-w-md ${
          compact ? 'text-xs mb-3.5' : 'text-xs sm:text-sm mb-6'
        }`}
      >
        {message}
      </p>

      {/* Action Buttons */}
      {(onAction || onSecondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`inline-flex items-center justify-center gap-1.5 font-bold rounded-xl bg-[#0B1F4D] hover:bg-[#153E75] text-white shadow-xs transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A2B] ${
                compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {actionLabel}
            </button>
          )}

          {onSecondaryAction && secondaryActionLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className={`inline-flex items-center justify-center gap-1.5 font-bold rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] shadow-2xs transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F4D] ${
                compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
              }`}
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export { EmptyState };
