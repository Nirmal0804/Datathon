import React from 'react';
import { Search, Calendar, MapPin, Activity, Tag, TrendingUp } from 'lucide-react';
import { DISTRICTS, CATEGORIES } from '../../dashboard/components/mockData';
import GlobalFilterPanel from '../../../components/shared/ui/GlobalFilterPanel';
import GlobalFilterSelect from '../../../components/shared/ui/GlobalFilterSelect';
import GlobalFilterInput from '../../../components/shared/ui/GlobalFilterInput';

export default function HotspotFilters({ 
  filters, 
  setFilters, 
  searchQuery, 
  setSearchQuery, 
  onReset,
  role
}) {
  const isAnalyst = role === 'analyst';
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <GlobalFilterPanel
      onReset={onReset}
      layout="grid"
    >
      <GlobalFilterInput
        label="Search Area"
        icon={Search}
        placeholder="Search by Hotspot ID or Station..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <GlobalFilterSelect
        label="District"
        icon={MapPin}
        value={filters.district}
        onChange={(e) => handleFilterChange('district', e.target.value)}
      >
        <option value="All">All Districts</option>
        {DISTRICTS.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </GlobalFilterSelect>

      <GlobalFilterSelect
        label="Risk Level"
        icon={Activity}
        value={filters.riskLevel}
        onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
      >
        <option value="All">All Risks</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </GlobalFilterSelect>

      {isAnalyst && (
        <GlobalFilterSelect
          label="Trend"
          icon={TrendingUp}
          value={filters.trend}
          onChange={(e) => handleFilterChange('trend', e.target.value)}
        >
          <option value="All">All Trends</option>
          <option value="Emerging">Emerging</option>
          <option value="Persistent">Persistent</option>
          <option value="Declining">Declining</option>
        </GlobalFilterSelect>
      )}

      <GlobalFilterSelect
        label="Crime Type"
        icon={Tag}
        value={filters.crimeCategory}
        onChange={(e) => handleFilterChange('crimeCategory', e.target.value)}
      >
        <option value="All">All Categories</option>
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </GlobalFilterSelect>

      <GlobalFilterInput
        label="Start Date"
        type="date"
        icon={Calendar}
        value={filters.startDate}
        onChange={(e) => handleFilterChange('startDate', e.target.value)}
      />

      <GlobalFilterInput
        label="End Date"
        type="date"
        icon={Calendar}
        value={filters.endDate}
        onChange={(e) => handleFilterChange('endDate', e.target.value)}
      />
    </GlobalFilterPanel>
  );
}
