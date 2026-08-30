import React from 'react';
import { useTranslation } from '../../../i18n';

export default function RiskBadge({ risk }) {
  const { t } = useTranslation();
  const styles = {
    Critical: 'bg-[#B91C1C]/10 text-[#B91C1C]',
    High: 'bg-[#B45309]/10 text-[#B45309]',
    Medium: 'bg-[#C79A2B]/10 text-[#C79A2B]',
    Low: 'bg-[#15803D]/10 text-[#15803D]'
  };

  const style = styles[risk] || styles.Low;
  const label = risk === 'Critical' ? t('common.critical', 'Critical') : risk === 'High' ? t('common.high', 'High') : risk === 'Medium' ? t('common.medium', 'Medium') : t('common.low', 'Low');

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
}
