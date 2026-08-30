import React from 'react';
import { Search, Calendar, MapPin, Activity, Tag, TrendingUp, RotateCcw, Download } from 'lucide-react';
import { DISTRICTS, CATEGORIES } from '../../dashboard/components/mockData';
import { useTranslation } from '../../../i18n';

export default function HotspotFilters({ 
  filters, 
  setFilters, 
  searchQuery, 
  setSearchQuery, 
  onReset,
  onExport,
  role
}) {
  const { t } = useTranslation();
  const isAnalyst = role === 'analyst';
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const inputBase = "h-8 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-[11px] font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B1F4D] transition-all cursor-pointer appearance-none uppercase tracking-wider";

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'Cybercrime': return t('categories.cybercrime', 'Cybercrime');
      case 'Property Theft': return t('categories.propertyTheft', 'Property Theft');
      case 'Violent Crime': return t('categories.violentCrime', 'Violent Crime');
      case 'Financial Fraud': return t('categories.financialFraud', 'Financial Fraud');
      case 'Narcotics': return t('categories.narcotics', 'Narcotics');
      case 'Crime Against Women': return t('categories.crimeAgainstWomen', 'Crime Against Women');
      default: return cat;
    }
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[16px] shadow-sm p-1.5 w-full flex flex-wrap lg:flex-nowrap items-center gap-1.5 overflow-hidden">
      
      {/* Search */}
      <div className="relative flex-1 min-w-[140px]">
        <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder={t('hotspots.searchPlaceholder', 'SEARCH HOTSPOT...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${inputBase} w-full pl-8 pr-2 uppercase placeholder:text-[10px] placeholder:font-bold placeholder:uppercase`}
        />
      </div>

      {/* District */}
      <div className="relative min-w-[110px]">
        <MapPin className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <select
          value={filters.district}
          onChange={(e) => handleFilterChange('district', e.target.value)}
          className={`${inputBase} w-full pl-8 pr-6`}
        >
          <option value="All">{t('dashboard.allDistricts', 'All Districts')}</option>
          {DISTRICTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Risk Level */}
      <div className="relative min-w-[100px]">
        <Activity className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <select
          value={filters.riskLevel}
          onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
          className={`${inputBase} w-full pl-8 pr-6`}
        >
          <option value="All">{t('cases.allPriorities', 'All Risks')}</option>
          <option value="Critical">{t('common.critical', 'Critical')}</option>
          <option value="High">{t('common.high', 'High')}</option>
          <option value="Medium">{t('common.medium', 'Medium')}</option>
          <option value="Low">{t('common.low', 'Low')}</option>
        </select>
      </div>

      {/* Crime Type */}
      <div className="relative min-w-[110px]">
        <Tag className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <select
          value={filters.crimeCategory}
          onChange={(e) => handleFilterChange('crimeCategory', e.target.value)}
          className={`${inputBase} w-full pl-8 pr-6`}
        >
          <option value="All">{t('categories.allCategories', 'All Categories')}</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
          ))}
        </select>
      </div>

      {/* Trend (Analyst Only) */}
      {isAnalyst && (
        <div className="relative min-w-[110px]">
          <TrendingUp className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.trend}
            onChange={(e) => handleFilterChange('trend', e.target.value)}
            className={`${inputBase} w-full pl-8 pr-6`}
          >
            <option value="All">{t('hotspots.allTrends', 'All Trends')}</option>
            <option value="Emerging">{t('hotspots.emergingHotspots', 'Emerging')}</option>
            <option value="Persistent">{t('hotspots.persistent', 'Persistent')}</option>
            <option value="Declining">{t('hotspots.declining', 'Declining')}</option>
          </select>
        </div>
      )}

      {/* Start Date */}
      <div className="relative min-w-[110px]">
        <Calendar className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className={`${inputBase} w-full pl-8 pr-2 uppercase`}
        />
      </div>

      {/* End Date */}
      <div className="relative min-w-[110px]">
        <Calendar className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className={`${inputBase} w-full pl-8 pr-2 uppercase`}
        />
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={onReset}
        title={t('dashboard.resetFilters', 'Reset all filters')}
        className="h-8 px-3 rounded-lg bg-[#F8F9FB] border border-[#E7ECF3] text-[#0B1F4D] hover:bg-[#0B1F4D] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 font-bold text-[10px] uppercase tracking-wider"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1" />
        {t('cases.resetFilters', 'Reset')}
      </button>
      
      {/* Export Button */}
      <button
        type="button"
        onClick={onExport}
        title={t('common.export', 'Export Data')}
        className="h-8 px-3 rounded-lg bg-[#0B1F4D] text-white hover:bg-[#0B1F4D]/90 flex items-center justify-center transition-colors cursor-pointer shrink-0 font-bold text-[10px] uppercase tracking-wider"
      >
        <Download className="w-3.5 h-3.5 mr-1" />
        {t('common.export', 'Export')}
      </button>

    </div>
  );
}
