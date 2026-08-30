import React, { useState, useMemo, useEffect } from 'react';
import HotspotFilters from './components/HotspotFilters';
import HotspotTable from './components/HotspotTable';
import HotspotDetailPanel from './components/HotspotDetailPanel';
import PatrolRecommendationCard from './components/PatrolRecommendationCard';
import { MOCK_HOTSPOTS } from '../../mock/hotspotData';
import { getMLHotspots } from '../../services/api';
import { ShieldAlert, Radio, ShieldCheck, Activity, Zap, AlertTriangle } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { useTranslation } from '../../i18n';

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-[#E7ECF3] rounded-[24px] p-5 space-y-3 animate-pulse">
            <div className="h-3.5 bg-slate-100 rounded w-1/2" />
            <div className="h-6 bg-slate-100 rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[70%] bg-white border border-[#E7ECF3] rounded-[24px] p-6 h-96 animate-pulse" />
        <div className="w-full lg:w-[30%] bg-white border border-[#E7ECF3] rounded-[24px] p-6 h-96 animate-pulse" />
      </div>
    </div>
  );
}

export default function HotspotDetectionLayout({ onNavigate, role }) {
  const { t } = useTranslation();
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mlHotspotData, setMlHotspotData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getMLHotspots()
      .then((data) => {
        if (isMounted) {
          setMlHotspotData(data);
          console.log('[ML Hotspots API Connected]:', data);
        }
      })
      .catch((err) => {
        console.warn('ML Hotspots API warning:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // Filters State
  const [filters, setFilters] = useState({
    district: 'All',
    riskLevel: 'All',
    crimeCategory: 'All',
    startDate: '',
    endDate: ''
  });

  // Trigger skeleton loader on filter modifications
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      district: 'All',
      riskLevel: 'All',
      crimeCategory: 'All',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
  };

  const handleExportData = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const headers = 'Hotspot ID,Police Station,District,Dominant Crime,Risk Level,Patrol Priority,Incident Count,Last Incident Date\n';
    const csvContent = filteredHotspots.map(h =>
      `"${h.hotspotId}","${h.policeStation}","${h.district}","${h.dominantCrime}","${h.riskLevel}","${h.patrolPriority}","${h.crimeCount}","${h.lastIncidentDate}"`
    ).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Hotspot_Detection_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Perform local filtering on MOCK_HOTSPOTS
  const filteredHotspots = useMemo(() => {
    let list = [...MOCK_HOTSPOTS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h => 
        h.hotspotId.toLowerCase().includes(q) ||
        h.policeStation.toLowerCase().includes(q)
      );
    }

    if (filters.district !== 'All') {
      list = list.filter(h => h.district === filters.district);
    }
    if (filters.riskLevel !== 'All') {
      list = list.filter(h => h.riskLevel === filters.riskLevel);
    }
    if (filters.crimeCategory !== 'All') {
      list = list.filter(h => h.dominantCrime === filters.crimeCategory);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      list = list.filter(h => new Date(h.lastIncidentDate) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      list = list.filter(h => new Date(h.lastIncidentDate) <= end);
    }

    return list;
  }, [filters, searchQuery]);

  useEffect(() => {
    if (selectedHotspot) {
      const stillExists = filteredHotspots.some(h => h.hotspotId === selectedHotspot.hotspotId);
      if (!stillExists) {
        setSelectedHotspot(null);
      }
    }
  }, [filteredHotspots, selectedHotspot]);

  const kpis = useMemo(() => {
    const total = filteredHotspots.length;
    const critical = filteredHotspots.filter(h => h.riskLevel === 'Critical').length;
    const highPatrol = filteredHotspots.filter(h => h.patrolPriority === 'Critical' || h.patrolPriority === 'High').length;
    
    const riskWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const totalWeight = filteredHotspots.reduce((acc, h) => acc + (riskWeights[h.riskLevel] || 0), 0);
    const avgWeight = total > 0 ? totalWeight / total : 0;
    
    let avgLabel = 'Low';
    if (avgWeight > 3.2) avgLabel = 'Critical';
    else if (avgWeight > 2.5) avgLabel = 'High';
    else if (avgWeight > 1.5) avgLabel = 'Medium';

    return {
      total,
      critical,
      highPatrol,
      avgLabel
    };
  }, [filteredHotspots]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12">
      
      {/* 1. Compact Page Header Banner */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[80px] shrink-0">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0 shadow-xs">
            <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-[#C79A2B] animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">{t('hotspots.title', 'Crime Hotspot Detection')}</h1>
              <span className="bg-[#0B1F4D]/10 text-[#0B1F4D] border border-[#0B1F4D]/20 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] sm:text-xs">
                {filteredHotspots.length} {t('hotspots.activeZones', 'Active Zones')}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              {t('hotspots.subtitle', 'AI-driven geospatial hotspot telemetry for tactical officer deployments.')}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#F0FDF4] border border-[#DCFCE7] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#166534]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t('hotspots.telemetryLiveSync', 'Telemetry Status: Live Sync')}</span>
        </div>
      </div>

      {isLoading ? (
        <SkeletonDashboard />
      ) : (
        <>
          {/* 2. White KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-[#64748B] uppercase tracking-wider">{t('hotspots.activeHotspots', 'Active Hotspots')}</p>
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-1">{kpis.total}</h3>
              </div>
              <div className="w-10 h-10 rounded-[14px] bg-[#0B1F4D]/10 border border-[#0B1F4D]/20 flex items-center justify-center text-[#0B1F4D] font-extrabold">
                <ShieldAlert className="w-5 h-5 text-[#C79A2B]" />
              </div>
            </div>

            <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{t('hotspots.criticalThreatZones', 'Critical Threat Zones')}</p>
                <h3 className="text-2xl font-black text-rose-600 tracking-tight mt-1">{kpis.critical}</h3>
              </div>
              <div className="w-10 h-10 rounded-[14px] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-extrabold">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{t('hotspots.highPriorityPatrols', 'High Priority Patrols')}</p>
                <h3 className="text-2xl font-black text-amber-600 tracking-tight mt-1">{kpis.highPatrol}</h3>
              </div>
              <div className="w-10 h-10 rounded-[14px] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-extrabold">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{t('hotspots.avgThreatRating', 'Avg Threat Rating')}</p>
                <h3 className="text-2xl font-black text-[#0B1F4D] tracking-tight mt-1">
                  {kpis.avgLabel === 'Critical' ? t('common.critical', 'Critical') : kpis.avgLabel === 'High' ? t('common.high', 'High') : kpis.avgLabel === 'Medium' ? t('common.medium', 'Medium') : t('common.low', 'Low')}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-[14px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 3. Compact Filters Toolbar */}
          <HotspotFilters 
            filters={filters}
            setFilters={setFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onReset={handleResetFilters}
            onExport={handleExportData}
            role={role}
          />

          {/* 4 & 5. 70/30 Split Grid (Registry Table & Right Inspector Panel) */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Table Area (70% Width) */}
            <div className="w-full lg:w-[70%] space-y-4">
              {filteredHotspots.length === 0 ? (
                <div className="p-8 bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm">
                  <EmptyState
                    type="map"
                    title={t('hotspots.noHotspotsMatch', 'No Hotspots Match Filters')}
                    message={t('hotspots.noHotspotsDesc', 'No geospatial crime hotspots match your current filter parameters. Try clearing date ranges or search terms.')}
                    onAction={handleResetFilters}
                    actionLabel={t('cases.resetFilters', 'Clear Filters')}
                  />
                </div>
              ) : (
                <HotspotTable 
                  hotspots={filteredHotspots}
                  selectedHotspot={selectedHotspot}
                  onSelect={setSelectedHotspot}
                />
              )}
            </div>

            {/* Inspector Details Sidebar (30% Width) */}
            <div className="w-full lg:w-[30%] space-y-4">
              <HotspotDetailPanel 
                hotspot={selectedHotspot}
                onClose={() => setSelectedHotspot(null)}
                onNavigate={onNavigate}
                role={role}
              />
              
              {selectedHotspot && (
                <PatrolRecommendationCard 
                  hotspot={selectedHotspot}
                />
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
