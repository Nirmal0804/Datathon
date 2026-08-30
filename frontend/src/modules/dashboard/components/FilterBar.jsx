import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Building2, Tag, Activity } from 'lucide-react';
import { DISTRICTS, POLICE_STATIONS, CATEGORIES, STATUSES } from './mockData';
import GlobalFilterPanel from '../../../components/shared/ui/GlobalFilterPanel';
import GlobalFilterSelect from '../../../components/shared/ui/GlobalFilterSelect';
import { useTranslation } from '../../../i18n';

export default function FilterBar({ filters, onApply, onReset, compact = false }) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const [availableStations, setAvailableStations] = useState([]);

  // Sync with parent filters when they change (e.g. on reset)
  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters]);

  // Handle cascading dropdown for Police Stations based on selected District
  useEffect(() => {
    if (localFilters.district && localFilters.district !== 'All') {
      setAvailableStations(POLICE_STATIONS[localFilters.district] || []);
    } else {
      setAvailableStations([]);
    }
  }, [localFilters.district]);

  const handleChange = (field, value) => {
    setLocalFilters(prev => {
      const next = { ...prev, [field]: value };
      // If district changes, reset police station to All
      if (field === 'district') {
        next.policeStation = 'All';
      }
      return next;
    });
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleResetClick = () => {
    onReset();
  };

  return (
    <GlobalFilterPanel 
      title={t('common.filter', 'Intelligence Filters')}
      onApply={handleApply} 
      onReset={handleResetClick}
      layout="grid"
      compact={compact}
    >
      <GlobalFilterSelect
        label={t('common.date', 'Date Range')}
        icon={Calendar}
        value={localFilters.dateRange}
        onChange={(e) => handleChange('dateRange', e.target.value)}
        compact={compact}
      >
        <option value="Daily">{t('dashboard.daily', 'Daily (24 Hours)')}</option>
        <option value="Weekly">{t('dashboard.weekly', 'Weekly (7 Days)')}</option>
        <option value="Monthly">{t('dashboard.monthly', 'Monthly (30 Days)')}</option>
        <option value="Quarterly">{t('dashboard.quarterly', 'Quarterly (90 Days)')}</option>
        <option value="Yearly">{t('dashboard.yearly', 'Yearly (365 Days)')}</option>
      </GlobalFilterSelect>

      <GlobalFilterSelect
        label={t('common.district', 'District')}
        icon={MapPin}
        value={localFilters.district}
        onChange={(e) => handleChange('district', e.target.value)}
        compact={compact}
      >
        <option value="All">{t('dashboard.allDistricts', 'All Districts')}</option>
        {DISTRICTS.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </GlobalFilterSelect>

      <GlobalFilterSelect
        label={t('common.station', 'Police Station')}
        icon={Building2}
        value={localFilters.policeStation}
        onChange={(e) => handleChange('policeStation', e.target.value)}
        disabled={localFilters.district === 'All'}
        compact={compact}
      >
        <option value="All">{t('dashboard.allStations', 'All Stations')}</option>
        {availableStations.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </GlobalFilterSelect>

      <GlobalFilterSelect
        label={t('fir.category', 'Category')}
        icon={Tag}
        value={localFilters.category}
        onChange={(e) => handleChange('category', e.target.value)}
        compact={compact}
      >
        <option value="All">{t('dashboard.allCategories', 'All Categories')}</option>
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </GlobalFilterSelect>

      <GlobalFilterSelect
        label={t('common.status', 'Status')}
        icon={Activity}
        value={localFilters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        compact={compact}
      >
        <option value="All">{t('dashboard.allStatuses', 'All Statuses')}</option>
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </GlobalFilterSelect>
    </GlobalFilterPanel>
  );
}
