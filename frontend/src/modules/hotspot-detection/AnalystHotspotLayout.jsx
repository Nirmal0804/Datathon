import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HotspotFilters from './components/HotspotFilters';
import HotspotRankingTable from './components/HotspotRankingTable';
import RiskBadge from './components/RiskBadge';
import TrendBadge from './components/TrendBadge';
import { ANALYST_HOTSPOTS } from '../../mock/hotspotAnalytics';
import { 
  Layers, ShieldAlert, Radio, FileText, BarChart2, 
  Columns, TrendingUp, Info, Eye, CheckCircle2, ChevronDown, ChevronRight, ClipboardList
} from 'lucide-react';

// Configurable thresholds for Module 9 Anomaly Detection
const ANOMALY_THRESHOLDS = {
  ANOMALY_GROWTH_THRESHOLD: 15.0,        // deviation % to trigger growth spike anomaly
  CATEGORY_SHIFT_THRESHOLD: 10.0,        // deviation % to trigger category shift anomaly
  ANOMALY_SCORE_THRESHOLD: 60,           // score (0-100) to trigger critical overall anomaly
  FREQUENCY_DEVIATION_THRESHOLD: 20.0,   // deviation % to trigger abnormal frequency status
};

export default function AnalystHotspotLayout({ onNavigate }) {
  // Initialize with first hotspot to ensure analyst sees populated data immediately
  const [selectedHotspot, setSelectedHotspot] = useState(ANALYST_HOTSPOTS[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('rank');
  const [isLoading, setIsLoading] = useState(false);

  // Tabs within details panel: 'overview' | 'analytics' | 'history' | 'recommendations' | 'comparison'
  const [activeTab, setActiveTab] = useState('overview');

  // Accordion within Analytics tab: 'category' | 'risk' | 'district' | 'trends'
  const [expandedAccordion, setExpandedAccordion] = useState('category');

  // Comparison target hotspot ID (defaults to Rank 2 hotspot if Rank 1 is selected)
  const [comparisonTargetId, setComparisonTargetId] = useState(
    ANALYST_HOTSPOTS.find(h => h.hotspotId !== selectedHotspot?.hotspotId)?.hotspotId || ''
  );

  // Filters State
  const [filters, setFilters] = useState({
    district: 'All',
    riskLevel: 'All',
    crimeCategory: 'All',
    trend: 'All',
    startDate: '',
    endDate: ''
  });

  // Simulated filter skeletons loader
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
      trend: 'All',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
  };

  // Perform local filters on ANALYST_HOTSPOTS
  const filteredHotspots = useMemo(() => {
    let list = [...ANALYST_HOTSPOTS];

    // Search query matches
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h => 
        h.hotspotId.toLowerCase().includes(q) ||
        h.policeStation.toLowerCase().includes(q)
      );
    }

    // Dropdowns filters
    if (filters.district !== 'All') {
      list = list.filter(h => h.district === filters.district);
    }
    if (filters.riskLevel !== 'All') {
      list = list.filter(h => h.riskLevel === filters.riskLevel);
    }
    if (filters.crimeCategory !== 'All') {
      list = list.filter(h => h.dominantCrime === filters.crimeCategory);
    }
    if (filters.trend !== 'All') {
      list = list.filter(h => h.trend === filters.trend);
    }

    // Date range filters
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

  // Sync selected hotspot
  useEffect(() => {
    if (selectedHotspot) {
      const stillExists = filteredHotspots.some(h => h.hotspotId === selectedHotspot.hotspotId);
      if (!stillExists && filteredHotspots.length > 0) {
        setSelectedHotspot(filteredHotspots[0]);
      } else if (filteredHotspots.length === 0) {
        setSelectedHotspot(null);
      }
    } else if (filteredHotspots.length > 0) {
      setSelectedHotspot(filteredHotspots[0]);
    }
  }, [filteredHotspots, selectedHotspot]);

  // Update comparison target default value when selectedHotspot changes
  useEffect(() => {
    if (selectedHotspot) {
      const nextTarget = ANALYST_HOTSPOTS.find(h => h.hotspotId !== selectedHotspot.hotspotId);
      if (nextTarget) {
        setComparisonTargetId(nextTarget.hotspotId);
      }
    }
  }, [selectedHotspot]);

  // Compute Top KPI Cards dynamically from filtered list
  const kpis = useMemo(() => {
    const total = filteredHotspots.length;
    const emerging = filteredHotspots.filter(h => h.trend === 'Emerging').length;
    const persistent = filteredHotspots.filter(h => h.trend === 'Persistent').length;
    const declining = filteredHotspots.filter(h => h.trend === 'Declining').length;
    const critical = filteredHotspots.filter(h => h.riskLevel === 'Critical').length;
    
    // Average Density Index
    const totalDensity = filteredHotspots.reduce((acc, h) => acc + h.densityIndex, 0);
    const avgDensity = total > 0 ? (totalDensity / total).toFixed(1) : '0.0';

    // Find highest risk district
    const districtCounts = {};
    filteredHotspots.forEach(h => {
      if (h.riskLevel === 'Critical' || h.riskLevel === 'High') {
        districtCounts[h.district] = (districtCounts[h.district] || 0) + 1;
      }
    });

    let highestRiskDistrict = 'None';
    let maxCount = 0;
    Object.entries(districtCounts).forEach(([dist, count]) => {
      if (count > maxCount) {
        maxCount = count;
        highestRiskDistrict = dist;
      }
    });

    return {
      total,
      emerging,
      persistent,
      declining,
      critical,
      avgDensity,
      highestRiskDistrict
    };
  }, [filteredHotspots]);

  // SVG Chart Computations
  const chartData = useMemo(() => {
    const riskCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    filteredHotspots.forEach(h => {
      if (riskCounts[h.riskLevel] !== undefined) {
        riskCounts[h.riskLevel]++;
      }
    });

    const crimeCounts = {};
    filteredHotspots.forEach(h => {
      crimeCounts[h.dominantCrime] = (crimeCounts[h.dominantCrime] || 0) + 1;
    });

    const categoriesSorted = Object.entries(crimeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const districtHotspotCount = {};
    filteredHotspots.forEach(h => {
      districtHotspotCount[h.district] = (districtHotspotCount[h.district] || 0) + 1;
    });

    const districtsSorted = Object.entries(districtHotspotCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      riskCounts,
      categoriesSorted,
      districtsSorted
    };
  }, [filteredHotspots]);

  // Resolve comparison target details
  const comparisonTarget = useMemo(() => {
    return ANALYST_HOTSPOTS.find(h => h.hotspotId === comparisonTargetId);
  }, [comparisonTargetId]);

  // Compute dynamic anomalies data for the selected hotspot
  const anomalyInfo = useMemo(() => {
    if (!selectedHotspot) return null;

    const { ANOMALY_GROWTH_THRESHOLD, CATEGORY_SHIFT_THRESHOLD, FREQUENCY_DEVIATION_THRESHOLD } = ANOMALY_THRESHOLDS;

    // 1. Spike Detection (Expected base growth = 10%)
    const expectedGrowth = 10.0;
    const growthDeviation = selectedHotspot.growthPercentage - expectedGrowth;
    const isGrowthAnomaly = growthDeviation > ANOMALY_GROWTH_THRESHOLD;

    // 2. Unexpected Dominant Category Shift (Mocked via rank checks)
    const isCategoryShift = selectedHotspot.hotspotRank % 2 !== 0;
    const historicalCategory = isCategoryShift 
      ? (selectedHotspot.dominantCrime === 'Cybercrime' ? 'Property Theft' : 'Vehicle Theft')
      : selectedHotspot.dominantCrime;
    const shiftPercent = isCategoryShift ? 47.0 : 0.0;

    // 3. Abnormal Crime Frequency (Weekly averages)
    const expectedWeekly = selectedHotspot.historicalAverage ? (selectedHotspot.historicalAverage / 4) : 5.0;
    const currentWeekly = selectedHotspot.crimeCount ? (selectedHotspot.crimeCount / 4) : 8.0;
    const frequencyDeviation = ((currentWeekly - expectedWeekly) / expectedWeekly) * 100;
    const isFrequencyAnomaly = frequencyDeviation > FREQUENCY_DEVIATION_THRESHOLD;

    // 4. Weighted Anomaly Score (0-100)
    const rawScore = Math.min(100, Math.max(0, Math.round(
      selectedHotspot.growthPercentage * 1.2 + 
      selectedHotspot.densityIndex * 4 + 
      Math.abs(selectedHotspot.crimeCount - selectedHotspot.historicalAverage) * 1.4
    )));

    const anomalySeverity = 
      rawScore > 80 ? 'Critical' :
      rawScore > 60 ? 'High' :
      rawScore > 35 ? 'Medium' : 'Low';

    const enhancedTrend = 
      selectedHotspot.growthPercentage > 30 ? 'Critical Spike' :
      selectedHotspot.growthPercentage > 15 ? 'Escalating' :
      selectedHotspot.dominantCrime === 'Property Theft' ? 'Seasonal' :
      selectedHotspot.growthPercentage > 5 ? 'Increasing' : 'Stable';

    return {
      expectedGrowth,
      growthDeviation,
      isGrowthAnomaly,
      isCategoryShift,
      historicalCategory,
      shiftPercent,
      expectedWeekly,
      currentWeekly,
      frequencyDeviation,
      isFrequencyAnomaly,
      rawScore,
      anomalySeverity,
      enhancedTrend
    };
  }, [selectedHotspot]);

  // Compute active filtered alerts list sorted by severity
  const activeAlerts = useMemo(() => {
    const alerts = [];
    filteredHotspots.forEach(h => {
      const dev = h.crimeCount - h.historicalAverage;
      const expectedWeekly = h.historicalAverage ? (h.historicalAverage / 4) : 5.0;
      const currentWeekly = h.crimeCount ? (h.crimeCount / 4) : 8.0;
      const freqDeviation = ((currentWeekly - expectedWeekly) / expectedWeekly) * 100;

      let priority = 'Low';
      let title = '';

      if (h.growthPercentage > 30) {
        priority = 'Critical';
        title = `🚨 Critical Spike: ${h.dominantCrime} increased ${h.growthPercentage}% in ${h.district} (${h.policeStation})`;
      } else if (h.trend === 'Emerging') {
        priority = 'High';
        title = `🔥 New Hotspot: Emerged zone detected near ${h.policeStation}`;
      } else if (freqDeviation > 25) {
        priority = 'Medium';
        title = `⚠️ Abnormal Frequency: ${h.policeStation} crime deviation shift at +${freqDeviation.toFixed(0)}%`;
      } else if (h.hotspotRank % 2 !== 0) {
        priority = 'Medium';
        title = `⚠️ Category Shift: ${h.dominantCrime} replaced historical category in ${h.policeStation}`;
      }

      if (title) {
        alerts.push({ priority, title });
      }
    });

    const weights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return alerts
      .sort((a, b) => weights[b.priority] - weights[a.priority])
      .slice(0, 5);
  }, [filteredHotspots]);

  const handleViewOnMap = () => {
    if (!selectedHotspot) return;
    localStorage.setItem('selectedMapPosition', JSON.stringify({
      center: [selectedHotspot.latitude, selectedHotspot.longitude],
      zoom: 12
    }));
    onNavigate('map');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers className="w-5 h-5 text-primary animate-pulse-soft" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">Crime Hotspot Intelligence Workspace</h1>
            <p className="text-2xs text-slate-400 mt-0.5 font-sans">Tactical command suite for district-level risk rankings and predictive hotspots telemetry.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Hotspots', val: kpis.total, color: 'text-white' },
          { label: 'Emerging Hotspots', val: kpis.emerging, color: 'text-rose-500' },
          { label: 'Persistent Hotspots', val: kpis.persistent, color: 'text-amber-500' },
          { label: 'Critical Risk Zones', val: kpis.critical, color: 'text-red-500' },
          { label: 'Avg Density Index', val: `${kpis.avgDensity} /10`, color: 'text-indigo-400' },
          { label: 'Highest Risk District', val: kpis.highestRiskDistrict, color: 'text-indigo-300', textOnly: true }
        ].map((card, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{card.label}</span>
            {card.textOnly ? (
              <span className="text-2xs font-bold text-indigo-300 truncate mt-2.5 uppercase">{card.val}</span>
            ) : (
              <span className={`text-xl font-bold font-mono mt-1 ${card.color}`}>{card.val}</span>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <HotspotFilters 
        filters={filters}
        setFilters={setFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={handleResetFilters}
        role="analyst"
      />

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        
        {/* Left Column: Hotspot Ranking Table (70% width) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Crime Anomalies Alert Banner */}
          <AnimatePresence>
            {activeAlerts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                    <span>🚨</span>
                    <span>{activeAlerts.length} Active Crime Anomalies Detected</span>
                  </div>
                  <span className="text-[8px] bg-red-500/20 text-red-450 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse-soft">Early Warning Alerts</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 font-mono text-[10px] pl-1">
                  {activeAlerts.map((alert, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="shrink-0">{alert.priority === 'Critical' ? '🔴' : alert.priority === 'High' ? '🟠' : '⚠️'}</span>
                      <span>{alert.title}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-5 h-96 animate-pulse" />
          ) : filteredHotspots.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl max-w-md mx-auto">
              <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">No hotspots matches filters</h4>
              <p className="text-4xs text-slate-400 mt-1 mb-4">Try adjusting your query or resetting all filter tags.</p>
              <button onClick={handleResetFilters} className="btn-secondary btn-sm w-full">
                Clear Filters
              </button>
            </div>
          ) : (
            <HotspotRankingTable 
              hotspots={filteredHotspots}
              selectedHotspot={selectedHotspot}
              onSelect={setSelectedHotspot}
              sortKey={sortKey}
              setSortKey={setSortKey}
            />
          )}
        </div>

        {/* Right Column: Progressive Disclosure Tabbed details panel (30% width, sticky) */}
        <div className="lg:col-span-3 sticky top-6 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-elevation-2 flex flex-col">
            
            {/* Details Panel Header */}
            <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hotspot Telemetry</h3>
              </div>
              {selectedHotspot && (
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                  {selectedHotspot.hotspotId}
                </span>
              )}
            </div>

            {/* Scrollable Horizontal Tabs selectors */}
            <div className="flex border-b border-slate-850 overflow-x-auto no-scrollbar scroll-smooth bg-slate-950/20 shrink-0">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'history', label: 'Incident History' },
                { id: 'recommendations', label: 'Recommendations' },
                { id: 'comparison', label: 'Comparison' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-3xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id 
                      ? 'border-b-primary text-primary bg-slate-900/40' 
                      : 'border-b-transparent text-slate-400 hover:text-white hover:bg-slate-850/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content viewport */}
            <div className="p-5 min-h-[350px]">
              {!selectedHotspot ? (
                <div className="flex flex-col items-center justify-center text-center text-slate-500 h-64 space-y-3">
                  <ClipboardList className="w-10 h-10 text-slate-700 animate-pulse-soft" />
                  <h4 className="text-xs font-bold text-white">No Hotspot Selected</h4>
                  <p className="text-4xs text-slate-400">Identify a precinct hotspot from the rankings table to load statistics.</p>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* ────────────────── OVERVIEW TAB ────────────────── */}
                  {activeTab === 'overview' && anomalyInfo && (
                    <div className="space-y-4 text-xs animate-fade-in">
                      
                      {/* Risk and Trend badges */}
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                          <span className="block text-4xs text-slate-500 font-bold uppercase mb-1">Threat Risk</span>
                          <RiskBadge risk={selectedHotspot.riskLevel} />
                        </div>
                        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                          <span className="block text-4xs text-slate-500 font-bold uppercase mb-1">Trend Status</span>
                          <TrendBadge trend={anomalyInfo.enhancedTrend} />
                        </div>
                      </div>

                      {/* Detail attributes list */}
                      <div className="space-y-2.5 p-3.5 bg-slate-950/30 rounded-lg border border-slate-850">
                        {[
                          { label: 'Crime Count', val: `${selectedHotspot.crimeCount} cases`, mono: true },
                          { label: 'Dominant Category', val: selectedHotspot.dominantCrime },
                          { label: 'Density Index', val: `${selectedHotspot.densityIndex} /10`, mono: true },
                          { label: 'Anomaly Score', val: `${anomalyInfo.rawScore} /100 (${anomalyInfo.anomalySeverity})`, mono: true, color: anomalyInfo.anomalySeverity === 'Critical' || anomalyInfo.anomalySeverity === 'High' ? 'text-red-400 font-bold animate-pulse-soft' : anomalyInfo.anomalySeverity === 'Medium' ? 'text-orange-400 font-bold' : 'text-emerald-450 font-bold' },
                          { label: 'Growth YoY', val: `${selectedHotspot.growthPercentage >= 0 ? '+' : ''}${selectedHotspot.growthPercentage}%`, mono: true, color: selectedHotspot.growthPercentage >= 0 ? 'text-rose-450' : 'text-emerald-450' },
                          { label: 'Historical Avg', val: selectedHotspot.historicalAverage, mono: true },
                          { label: 'Last Incident', val: selectedHotspot.lastIncidentDate, mono: true },
                          { label: 'District', val: selectedHotspot.district },
                          { label: 'Police Station', val: selectedHotspot.policeStation }
                        ].map((row, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-850/40 last:border-b-0">
                            <span className="text-slate-400 text-3xs">{row.label}</span>
                            <span className={`font-semibold text-slate-200 ${row.mono ? 'font-mono' : ''} ${row.color || ''}`}>
                              {row.val}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Spike Detection sub-card */}
                      <div className="p-3 bg-slate-950/45 border border-slate-850 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Spike Detection Analysis</span>
                          {anomalyInfo.isGrowthAnomaly && (
                            <span className="px-1.5 py-0.2 bg-red-500/15 text-red-400 border border-red-500/20 rounded text-[7px] font-bold uppercase animate-pulse-soft">Growth Anomaly</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 text-center text-4xs font-mono text-slate-400">
                          <div>
                            <span className="block text-slate-500 font-bold uppercase">Expected</span>
                            <span className="text-slate-350">{anomalyInfo.expectedGrowth}%</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 font-bold uppercase">Actual</span>
                            <span className={anomalyInfo.isGrowthAnomaly ? 'text-red-400 font-bold' : 'text-white'}>{selectedHotspot.growthPercentage}%</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 font-bold uppercase">Deviation</span>
                            <span className={anomalyInfo.isGrowthAnomaly ? 'text-red-400 font-bold' : 'text-emerald-450'}>{anomalyInfo.growthDeviation >= 0 ? '+' : ''}{anomalyInfo.growthDeviation.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Category Shift sub-card */}
                      <div className="p-3 bg-slate-950/45 border border-slate-850 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category Shift Analysis</span>
                          {anomalyInfo.isCategoryShift && (
                            <span className="px-1.5 py-0.2 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded text-[7px] font-bold uppercase">Category Shift</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 text-center text-4xs font-mono text-slate-400">
                          <div>
                            <span className="block text-slate-500 font-bold uppercase">Current Dominant</span>
                            <span className="text-white truncate block max-w-28 mx-auto font-bold" title={selectedHotspot.dominantCrime}>{selectedHotspot.dominantCrime}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 font-bold uppercase">Historical Category</span>
                            <span className="text-slate-350 truncate block max-w-28 mx-auto" title={anomalyInfo.historicalCategory}>{anomalyInfo.historicalCategory}</span>
                          </div>
                        </div>
                        {anomalyInfo.isCategoryShift && (
                          <div className="text-[8px] font-mono text-indigo-400 pt-1 flex justify-between border-t border-slate-850/50">
                            <span>Deviation Shift Increase:</span>
                            <span>+{anomalyInfo.shiftPercent}%</span>
                          </div>
                        )}
                      </div>

                      {/* Weekly Crime Frequency sub-card */}
                      <div className="p-3 bg-slate-950/45 border border-slate-850 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Weekly Crime Frequency</span>
                          <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold uppercase ${
                            anomalyInfo.isFrequencyAnomaly 
                              ? 'bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse-soft' 
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          }`}>{anomalyInfo.isFrequencyAnomaly ? 'Abnormal' : 'Normal'}</span>
                        </div>
                        <div className="grid grid-cols-3 text-center text-4xs font-mono text-slate-400">
                          <div>
                            <span className="block text-slate-500 font-bold uppercase">Historical Avg</span>
                            <span className="text-slate-350">{anomalyInfo.expectedWeekly.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 font-bold uppercase">Current Count</span>
                            <span className={anomalyInfo.isFrequencyAnomaly ? 'text-red-400 font-bold' : 'text-white'}>{anomalyInfo.currentWeekly.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 font-bold uppercase">Deviation</span>
                            <span className={anomalyInfo.isFrequencyAnomaly ? 'text-red-400 font-bold' : 'text-emerald-450'}>+{anomalyInfo.frequencyDeviation.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Nav Button */}
                      <button
                        onClick={handleViewOnMap}
                        className="w-full btn-primary btn-sm h-10 gap-2 cursor-pointer mt-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View on Crime Map</span>
                      </button>
                    </div>
                  )}

                  {/* ────────────────── ANALYTICS TAB (Accordions) ────────────────── */}
                  {activeTab === 'analytics' && anomalyInfo && (
                    <div className="space-y-3.5 animate-fade-in">
                      
                      {/* Accordion 1: Category Distribution */}
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/20">
                        <button
                          onClick={() => setExpandedAccordion(expandedAccordion === 'category' ? '' : 'category')}
                          className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900/80 transition-colors flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer border-b border-slate-850/30"
                        >
                          <div className="flex items-center gap-2">
                            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Dominant Crime Categories</span>
                          </div>
                          {expandedAccordion === 'category' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        {expandedAccordion === 'category' && (
                          <div className="p-4 space-y-3.5 bg-slate-900/20">
                            {chartData.categoriesSorted.map(([cat, count]) => {
                              const pct = kpis.total > 0 ? (count / kpis.total) * 100 : 0;
                              return (
                                <div key={cat} className="space-y-1">
                                  <div className="flex justify-between text-3xs text-slate-300">
                                    <span>{cat}</span>
                                    <span className="font-mono font-bold text-slate-400">{count} ({pct.toFixed(0)}%)</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full" 
                                      style={{ width: `${pct}%` }} 
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Accordion 2: Anomaly & Spike Timeline */}
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/20">
                        <button
                          onClick={() => setExpandedAccordion(expandedAccordion === 'timeline' ? '' : 'timeline')}
                          className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900/80 transition-colors flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer border-b border-slate-850/30"
                        >
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-rose-400 animate-pulse-soft" />
                            <span>Spike Timeline & Trend Chart</span>
                          </div>
                          {expandedAccordion === 'timeline' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        {expandedAccordion === 'timeline' && (
                          <div className="p-4 space-y-3 bg-slate-900/20 text-3xs font-mono">
                            <span className="block text-[8px] font-bold uppercase text-slate-500">Anomaly Trend Sparkline</span>
                            <div className="py-2 flex items-center justify-center bg-slate-950/40 border border-slate-850 rounded-lg p-2">
                              <svg viewBox="0 0 100 30" className="w-full h-12 stroke-indigo-400 stroke-2 fill-none">
                                <path d="M0,25 L15,22 L30,12 L45,18 L60,8 L75,19 L90,3 L100,5" />
                                <circle cx="90" cy="3" r="2" className="fill-rose-500 stroke-none animate-pulse-soft" />
                              </svg>
                            </div>
                            <span className="block text-[8px] font-bold uppercase text-slate-500 mt-2">Spike Timeline Logs</span>
                            <div className="space-y-2.5 border-l border-slate-800 pl-3">
                              <div className="relative">
                                <div className="absolute -left-[16px] top-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span className="text-[7px] text-slate-500 font-bold block uppercase">Today</span>
                                <p className="font-semibold text-slate-200 leading-tight">Critical growth spike detected inside district coordinates.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[16px] top-1 w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                <span className="text-[7px] text-slate-500 font-bold block uppercase">2 Days Ago</span>
                                <p className="font-semibold text-slate-355 leading-tight">Dominant crime category shift triggered from historical baseline.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Accordion 3: Historical vs Current (Category Shift) */}
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/20">
                        <button
                          onClick={() => setExpandedAccordion(expandedAccordion === 'history_vs_current' ? '' : 'history_vs_current')}
                          className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900/80 transition-colors flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer border-b border-slate-850/30"
                        >
                          <div className="flex items-center gap-2">
                            <Columns className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Historical vs Current comparison</span>
                          </div>
                          {expandedAccordion === 'history_vs_current' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        {expandedAccordion === 'history_vs_current' && (
                          <div className="p-4 space-y-3 bg-slate-900/20 text-3xs font-mono">
                            <div className="p-2 bg-slate-950/40 rounded border border-slate-850 space-y-2">
                              <span className="block text-[8px] text-slate-500 font-bold uppercase">Dominant Category Shift Log</span>
                              <div className="flex justify-between text-slate-300">
                                <span>Current category:</span>
                                <span className="text-white font-bold">{selectedHotspot.dominantCrime}</span>
                              </div>
                              <div className="flex justify-between text-slate-300 border-b border-slate-850 pb-1.5">
                                <span>Historical Category:</span>
                                <span className="text-slate-450">{anomalyInfo.historicalCategory}</span>
                              </div>
                              <div className="flex justify-between text-indigo-400 font-bold">
                                <span>Future Risk Forecast:</span>
                                <span>{selectedHotspot.riskLevel === 'Critical' ? 'Immediate Action' : 'Elevated Surveillance'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Accordion 4: District Anomaly Distribution */}
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/20">
                        <button
                          onClick={() => setExpandedAccordion(expandedAccordion === 'district_anomaly' ? '' : 'district_anomaly')}
                          className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900/80 transition-colors flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            <span>District Anomaly & Future Risk</span>
                          </div>
                          {expandedAccordion === 'district_anomaly' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        {expandedAccordion === 'district_anomaly' && (
                          <div className="p-4 space-y-3 bg-slate-900/20 text-3xs font-mono">
                            <span className="block text-[8px] font-bold uppercase text-slate-500">Anomaly Density Index by District</span>
                            {chartData.districtsSorted.map(([dist, count]) => {
                              const maxCount = chartData.districtsSorted[0]?.[1] || 1;
                              const barWidth = (count / maxCount) * 100;
                              return (
                                <div key={dist} className="space-y-1">
                                  <div className="flex justify-between text-slate-300">
                                    <span className="truncate w-24">{dist}</span>
                                    <span>{(count * 15).toFixed(0)} Threat Rating</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-850 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-red-500 to-orange-400"
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* ────────────────── INCIDENT HISTORY TAB ────────────────── */}
                  {activeTab === 'history' && (
                    <div className="space-y-3.5 animate-fade-in text-xs">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-3xs uppercase tracking-widest pb-1 border-b border-slate-800">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Active Incident log</span>
                      </div>
                      <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl leading-relaxed text-slate-350">
                        <p className="font-semibold text-slate-200 mb-1.5 font-mono text-3xs uppercase text-slate-500">Telemetry Feed Summary</p>
                        {selectedHotspot.activitySummary}
                      </div>
                      <div className="p-3 bg-slate-950/20 border border-slate-850/60 rounded-lg text-slate-400 text-3xs font-mono flex flex-col gap-1">
                        <span>Last logged: {selectedHotspot.lastIncidentDate}</span>
                        <span>Latitude: {selectedHotspot.latitude}</span>
                        <span>Longitude: {selectedHotspot.longitude}</span>
                      </div>
                    </div>
                  )}

                  {/* ────────────────── RECOMMENDATIONS TAB ────────────────── */}
                  {activeTab === 'recommendations' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-3xs uppercase tracking-widest pb-1 border-b border-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Tactical Action Guidelines</span>
                      </div>
                      
                      <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                        <span className="text-[9px] font-bold uppercase text-slate-500">Strategy Protocol</span>
                        <h4 className="font-bold text-white">{selectedHotspot.riskLevel === 'Critical' ? 'Immediate Interception Required' : 'Strategic Area Sweeps'}</h4>
                        <p className="text-slate-400 text-3xs leading-relaxed">{selectedHotspot.recommendation}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="block font-mono font-bold text-slate-500 text-4xs uppercase tracking-wider">Operational Beat plan</span>
                        {[
                          'Reinforce patrolling between 22:00 and 04:00',
                          'Audit CCTV link uptime to State Command center',
                          'Coordinate checkposts with border precincts'
                        ].map((step, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-950/20 border border-slate-850 rounded-lg flex gap-3 text-slate-300">
                            <span className="font-mono font-bold text-indigo-400 text-[10px] mt-0.5">{idx + 1}.</span>
                            <span className="text-3xs">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ────────────────── COMPARISON TAB ────────────────── */}
                  {activeTab === 'comparison' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-3xs uppercase tracking-widest pb-1 border-b border-slate-800">
                        <Columns className="w-3.5 h-3.5" />
                        <span>Compare Against Hotspot</span>
                      </div>

                      {/* Dropdown to pick target */}
                      <div>
                        <label className="block text-4xs font-bold text-slate-500 uppercase tracking-widest mb-1" htmlFor="compare-dropdown">Select Target</label>
                        <select
                          id="compare-dropdown"
                          value={comparisonTargetId}
                          onChange={(e) => setComparisonTargetId(e.target.value)}
                          className="select text-3xs h-8.5 bg-slate-950 border-slate-850"
                        >
                          {ANALYST_HOTSPOTS.filter(h => h.hotspotId !== selectedHotspot.hotspotId).map(h => (
                            <option key={h.hotspotId} value={h.hotspotId}>
                              {h.hotspotId} ({h.policeStation})
                            </option>
                          ))}
                        </select>
                      </div>

                      {comparisonTarget ? (
                        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 space-y-3 text-3xs font-mono">
                          <div className="grid grid-cols-3 text-center border-b border-slate-850/40 pb-1.5 uppercase font-bold text-slate-500">
                            <span className="text-left">{selectedHotspot.hotspotId}</span>
                            <span>Metric</span>
                            <span className="text-right">{comparisonTarget.hotspotId}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 text-center">
                            <span className="text-left text-slate-200">{selectedHotspot.crimeCount} cases</span>
                            <span className="text-slate-500">Crime Count</span>
                            <span className="text-right text-slate-200">{comparisonTarget.crimeCount} cases</span>
                          </div>

                          <div className="grid grid-cols-3 text-center">
                            <span className="text-left text-slate-200">{selectedHotspot.densityIndex} /10</span>
                            <span className="text-slate-500">Density</span>
                            <span className="text-right text-slate-200">{comparisonTarget.densityIndex} /10</span>
                          </div>

                          <div className="grid grid-cols-3 text-center">
                            <span className={`text-left ${selectedHotspot.growthPercentage >= 0 ? 'text-rose-450' : 'text-emerald-450'}`}>
                              {selectedHotspot.growthPercentage}%
                            </span>
                            <span className="text-slate-500">Growth %</span>
                            <span className={`text-right ${comparisonTarget.growthPercentage >= 0 ? 'text-rose-450' : 'text-emerald-450'}`}>
                              {comparisonTarget.growthPercentage}%
                            </span>
                          </div>

                          <div className="grid grid-cols-3 text-center">
                            <span className="text-left text-slate-200 truncate">{selectedHotspot.riskLevel}</span>
                            <span className="text-slate-500">Threat Risk</span>
                            <span className="text-right text-slate-200 truncate">{comparisonTarget.riskLevel}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
          
        </div>

      </div>

    </div>
  );
}
