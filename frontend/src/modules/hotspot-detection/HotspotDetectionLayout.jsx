import React, { useState, useMemo, useEffect } from 'react';
import HotspotFilters from './components/HotspotFilters';
import HotspotTable from './components/HotspotTable';
import HotspotDetailPanel from './components/HotspotDetailPanel';
import PatrolRecommendationCard from './components/PatrolRecommendationCard';
import { getFieldMapHotspots, getFieldMapFilters } from '../../api/endpoints';
import { Shield, ShieldAlert, Zap, Activity, Navigation, Radio, MapPin, Eye } from 'lucide-react';

// Custom Skeleton for Top KPIs & Registry Tables
function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* KPIs Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-850 rounded-xl p-5 space-y-3 animate-pulse">
            <div className="h-3.5 bg-slate-800 rounded w-1/2" />
            <div className="h-6 bg-slate-800 rounded w-1/3" />
          </div>
        ))}
      </div>
      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-850 rounded-xl p-5 h-96 animate-pulse" />
        <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-5 h-96 animate-pulse" />
      </div>
    </div>
  );
}

export default function HotspotDetectionLayout({ onNavigate }) {
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rawHotspots, setRawHotspots] = useState([]);

  const [filters, setFilters] = useState({
    district: 'All',
    riskLevel: 'All',
    crimeCategory: 'All',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchHotspots = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (filters.district !== 'All') params.district = filters.district;
        if (filters.startDate) params.start_date = filters.startDate;
        if (filters.endDate) params.end_date = filters.endDate;
        const res = await getFieldMapHotspots(params);
        const items = (res?.hotspots || []).map(h => ({
          hotspotId: h.hotspot_id,
          district: h.districts?.[0] || 'Unknown',
          policeStation: h.dominant_crime_type || h.hotspot_id,
          latitude: h.center_latitude,
          longitude: h.center_longitude,
          crimeCount: h.fir_count,
          dominantCrime: h.dominant_crime_type || 'Unknown',
          riskLevel: h.fir_count > 20 ? 'Critical' : h.fir_count > 10 ? 'High' : h.fir_count > 5 ? 'Medium' : 'Low',
          trend: 'Persistent',
          lastIncidentDate: new Date().toISOString().slice(0, 10),
          patrolPriority: h.fir_count > 20 ? 'Critical' : h.fir_count > 10 ? 'High' : 'Medium',
          recommendedAction: 'Monitor and patrol recommended.',
          activitySummary: `${h.fir_count} FIRs recorded in this hotspot zone. Dominant crime: ${h.dominant_crime_type || 'Unknown'}.`,
        }));
        setRawHotspots(items);
      } catch (err) {
        console.error('Failed to load hotspots:', err);
        setRawHotspots([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotspots();
  }, [filters.district, filters.startDate, filters.endDate]);

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

  const filteredHotspots = useMemo(() => {
    let list = [...rawHotspots];

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

    return list;
  }, [rawHotspots, filters, searchQuery]);

  // If selected hotspot is filtered out, clear selection
  useEffect(() => {
    if (selectedHotspot) {
      const stillExists = filteredHotspots.some(h => h.hotspotId === selectedHotspot.hotspotId);
      if (!stillExists) {
        setSelectedHotspot(null);
      }
    }
  }, [filteredHotspots, selectedHotspot]);

  // Compute Top KPI Cards dynamically from filtered list
  const kpis = useMemo(() => {
    const total = filteredHotspots.length;
    const critical = filteredHotspots.filter(h => h.riskLevel === 'Critical').length;
    const highPatrol = filteredHotspots.filter(h => h.patrolPriority === 'Critical' || h.patrolPriority === 'High').length;
    
    // Calculate Average Risk index
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
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Radio className="w-5 h-5 text-primary animate-pulse-soft" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">Crime Hotspot Detection</h1>
            <p className="text-2xs text-slate-400 mt-0.5 font-sans">AI-driven hotspot telemetry for tactical officer deployments.</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonDashboard />
      ) : (
        <>
          {/* 1. Dynamic KPI Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Hotspots</span>
              <span className="text-xl font-bold text-white font-mono mt-1">{kpis.total}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Critical Threat Zones</span>
              <span className="text-xl font-bold text-rose-500 font-mono mt-1">{kpis.critical}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">High Priority Patrols</span>
              <span className="text-xl font-bold text-amber-500 font-mono mt-1">{kpis.highPatrol}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Threat Rating</span>
              <span className="text-sm font-bold text-indigo-400 uppercase mt-1.5">{kpis.avgLabel} Risk</span>
            </div>
          </div>

          {/* 2. Collapsible Filters */}
          <HotspotFilters 
            filters={filters}
            setFilters={setFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onReset={handleResetFilters}
          />

          {/* 3. Splitted Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Table area */}
            <div className="lg:col-span-2 space-y-4">
              {filteredHotspots.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl max-w-md mx-auto">
                  <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-white">No hotspots matches filters</h4>
                  <p className="text-4xs text-slate-400 mt-1 mb-4">Try clearing date ranges or search terms.</p>
                  <button onClick={handleResetFilters} className="btn-secondary btn-sm w-full">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <HotspotTable 
                  hotspots={filteredHotspots}
                  selectedHotspot={selectedHotspot}
                  onSelect={setSelectedHotspot}
                />
              )}
            </div>

            {/* Inspection details sidebar */}
            <div className="space-y-6">
              <HotspotDetailPanel 
                hotspot={selectedHotspot}
                onClose={() => setSelectedHotspot(null)}
                onNavigate={onNavigate}
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
