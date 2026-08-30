import React, { useState, useMemo } from 'react';
import { BarChart2, X, RefreshCw, Layers, Calendar, HelpCircle, Activity } from 'lucide-react';
import { DISTRICTS } from '../../dashboard/components/mockData';
import TimelineSlider from './TimelineSlider';
import GlobalKPICard from '../../../components/shared/ui/GlobalKPICard';
import { useTranslation } from '../../../i18n';

export default function AnalyticsPanel({ 
  filteredCases = [], 
  onClose,
  allCases = [],
  role = 'analyst',
  onTimeChange,
  startDate,
  endDate
}) {
  const { t } = useTranslation();
  const isAnalyst = role === 'analyst';
  const [activeTab, setActiveTab] = useState('analytics');
  const [districtA, setDistrictA] = useState('Bengaluru City');
  const [districtB, setDistrictB] = useState('Mysuru');

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

  const safeCases = Array.isArray(filteredCases) ? filteredCases : [];
  const safeAllCases = Array.isArray(allCases) && allCases.length > 0 ? allCases : safeCases;

  // Compute stats on filteredCases
  const stats = useMemo(() => {
    const total = safeCases.length;
    const active = safeCases.filter(c => c.status === 'Active' || c.status === 'Investigating').length;
    const highSeverity = safeCases.filter(c => c.risk === 'Critical' || c.risk === 'High').length;
    
    // Most common category
    const catCounts = {};
    safeCases.forEach(c => {
      if (c && c.category) {
        catCounts[c.category] = (catCounts[c.category] || 0) + 1;
      }
    });
    let commonCat = 'N/A';
    let maxCatCount = 0;
    Object.entries(catCounts).forEach(([cat, count]) => {
      if (count > maxCatCount) {
        maxCatCount = count;
        commonCat = cat;
      }
    });

    // Compute hotspots count (districts with > 4 cases in dataset)
    const distCounts = {};
    safeAllCases.forEach(c => {
      if (c && c.district) {
        distCounts[c.district] = (distCounts[c.district] || 0) + 1;
      }
    });
    const hotspotsCount = Object.values(distCounts).filter(count => count > 4).length;

    // Density Score (ratio of high severity cases to total cases)
    const densityScore = total > 0 ? ((highSeverity / total) * 10).toFixed(1) : '0.0';

    return {
      total,
      active,
      highSeverity,
      densityScore,
      hotspotsCount,
      commonCat
    };
  }, [filteredCases, allCases]);

  // Compute comparative stats for District A and B
  const comparison = useMemo(() => {
    const getStats = (dist) => {
      const distCases = allCases.filter(c => c.district === dist);
      const total = distCases.length;
      const active = distCases.filter(c => c.status === 'Active' || c.status === 'Investigating').length;
      const high = distCases.filter(c => c.risk === 'Critical' || c.risk === 'High').length;
      const hotspot = total > 4 ? 1 : 0;
      // Simulated growth based on hash of district name
      const growth = ((dist.length * 7) % 15 - 5).toFixed(1); // -5% to +10%
      return { total, active, high, hotspot, growth };
    };

    return {
      a: getStats(districtA),
      b: getStats(districtB)
    };
  }, [allCases, districtA, districtB]);

  return (
    <div className="w-full bg-white border border-[#E7ECF3] rounded-[20px] shadow-sm p-6 space-y-5">
      
      {/* Section Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-[#E7ECF3]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#0B1F4D] text-white flex items-center justify-center shrink-0 shadow-xs">
            <BarChart2 className="w-4.5 h-4.5 text-police-gold" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">{t('analytics.title', 'Spatial Intelligence & Analytics')}</h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">{t('analytics.subtitle', 'Geospatial metrics, district comparative analysis, and temporal telemetry.')}</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1.5 bg-[#F8F9FB] p-1 rounded-[999px] border border-[#E7ECF3]">
          {[
            { id: 'analytics', label: t('analytics.spatialAnalytics', 'Spatial Analytics') },
            { id: 'comparison', label: t('analytics.districtComparison', 'District Comparison') }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 text-xs font-bold rounded-[999px] transition-all cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-[#0B1F4D] text-white shadow-xs' 
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-5">
        
        {/* Tab Content 1: Spatial Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            {/* KPI Cards in 4-column responsive grid matching dashboard scale */}
            <div>
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-police-blue" /> {t('analytics.keySpatialIndicators', 'Key Spatial Indicators')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlobalKPICard
                  title={t('analytics.totalCrimes', 'Total Crimes')}
                  value={stats.total}
                  type="info"
                  compact={true}
                />
                <GlobalKPICard
                  title={t('analytics.activeCases', 'Active Cases')}
                  value={stats.active}
                  type="warning"
                  compact={true}
                />
                <GlobalKPICard
                  title={t('analytics.highSeverity', 'High Severity')}
                  value={stats.highSeverity}
                  type="critical"
                  compact={true}
                />
                <GlobalKPICard
                  title={t('analytics.densityIndex', 'Density Index')}
                  value={stats.densityScore}
                  description="/ 10"
                  type="warning"
                  compact={true}
                />
              </div>
            </div>

            {/* Normalized Analytics Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] flex items-center justify-between">
                <div>
                  <span className="text-[#64748B] font-bold uppercase text-[11px] tracking-wider">{t('analytics.detectedHotspotZones', 'Detected Hotspot Zones')}</span>
                  <p className="text-xl font-extrabold text-rose-600 font-mono mt-0.5">{stats.hotspotsCount} {t('analytics.criticalClusters', 'Critical Clusters')}</p>
                </div>
                <div className="w-10 h-10 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] flex items-center justify-between">
                <div>
                  <span className="text-[#64748B] font-bold uppercase text-[11px] tracking-wider">{t('analytics.dominantCrimeCategory', 'Dominant Crime Category')}</span>
                  <p className="text-lg font-extrabold text-[#0F172A] mt-0.5">{getCategoryLabel(stats.commonCat)}</p>
                </div>
                <div className="w-10 h-10 rounded-[10px] bg-indigo-50 border border-indigo-200 text-[#0B1F4D] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: District Comparison */}
        {activeTab === 'comparison' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-police-blue" /> {t('analytics.districtComparativeMatrix', 'District Comparative Matrix')}
              </h3>

              {/* District Dropdown Selectors */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#0F172A]" htmlFor="compare-dist-a">{t('analytics.districtA', 'District A:')}</label>
                  <select 
                    id="compare-dist-a"
                    value={districtA} 
                    onChange={(e) => setDistrictA(e.target.value)}
                    className="h-9 rounded-[12px] bg-white border border-[#D9E2EC] px-3 text-xs font-bold text-[#0F172A] shadow-xs"
                  >
                    {DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <span className="text-xs font-bold text-slate-400">{t('analytics.vs', 'VS')}</span>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#0F172A]" htmlFor="compare-dist-b">{t('analytics.districtB', 'District B:')}</label>
                  <select 
                    id="compare-dist-b"
                    value={districtB} 
                    onChange={(e) => setDistrictB(e.target.value)}
                    className="h-9 rounded-[12px] bg-white border border-[#D9E2EC] px-3 text-xs font-bold text-[#0F172A] shadow-xs"
                  >
                    {DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="p-5 bg-[#F8F9FB] rounded-[16px] border border-[#E7ECF3]">
              <div className="grid grid-cols-3 text-center font-bold text-[#64748B] text-xs uppercase tracking-wider pb-2.5 border-b border-[#E7ECF3]">
                <span className="text-left font-extrabold text-[#0B1F4D]">{districtA}</span>
                <span>{t('analytics.comparativeIndicator', 'Comparative Indicator')}</span>
                <span className="text-right font-extrabold text-police-blue">{districtB}</span>
              </div>

              <div className="divide-y divide-[#E7ECF3]">
                {[
                  { label: t('analytics.totalCrimesRecorded', 'Total Crimes Recorded'), valA: comparison.a.total, valB: comparison.b.total, isMono: true },
                  { label: t('analytics.yoyGrowthRate', 'YoY Rate of Growth'), valA: `${comparison.a.growth >= 0 ? '+' : ''}${comparison.a.growth}%`, valB: `${comparison.b.growth >= 0 ? '+' : ''}${comparison.b.growth}%`, isMono: true, highlight: true },
                  { label: t('analytics.activeInvestigationCases', 'Active Investigation Cases'), valA: comparison.a.active, valB: comparison.b.active, isMono: true },
                  { label: t('analytics.highSeverityIncidents', 'High Severity Incidents'), valA: comparison.a.high, valB: comparison.b.high, isMono: true },
                  { label: t('analytics.highRiskHotspotZone', 'High Risk Hotspot Zone'), valA: comparison.a.hotspot ? t('analytics.yes', 'Yes') : t('analytics.no', 'No'), valB: comparison.b.hotspot ? t('analytics.yes', 'Yes') : t('analytics.no', 'No') },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 text-center text-xs py-2.5 items-center">
                    <span className={`text-left font-extrabold ${row.isMono ? 'font-mono text-[#0F172A]' : 'text-[#334155]'}`}>{row.valA}</span>
                    <span className="text-xs text-[#64748B] font-semibold">{row.label}</span>
                    <span className={`text-right font-extrabold ${row.isMono ? 'font-mono text-[#0F172A]' : 'text-[#334155]'} ${row.highlight ? (parseFloat(row.valB) > parseFloat(row.valA) ? 'text-rose-600' : 'text-emerald-600') : ''}`}>{row.valB}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
