import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import HotspotFilters from './components/HotspotFilters';
import HotspotRankingTable from './components/HotspotRankingTable';
import RiskBadge from './components/RiskBadge';
import TrendBadge from './components/TrendBadge';
import { ANALYST_HOTSPOTS } from '../../mock/hotspotAnalytics';
import { 
  Layers, ShieldAlert, Info, Eye, ClipboardList, Download
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

  const handleExportData = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const doc = new jsPDF();
    doc.setFont('Courier');
    doc.setFontSize(14);
    doc.text('CONFIDENTIAL - INTERNAL USE ONLY', 10, 15);
    doc.text('===================================================', 10, 22);
    doc.text('REPORT TYPE: CRIME HOTSPOT INTELLIGENCE', 10, 29);
    doc.setFontSize(10);
    doc.text(`REPORT ID:             HSP-INT-${todayStr}`, 10, 38);
    doc.text(`GENERATION DATE:       ${todayStr}`, 10, 45);
    doc.text(`TOTAL HOTSPOTS:        ${filteredHotspots.length}`, 10, 52);
    doc.text(`CRITICAL ZONES:        ${kpis.critical}`, 10, 59);
    doc.text(`EMERGING HOTSPOTS:     ${kpis.emerging}`, 10, 66);
    doc.text(`AVG DENSITY INDEX:     ${kpis.avgDensity} /10`, 10, 73);
    doc.text(`HIGHEST RISK DISTRICT: ${kpis.highestRiskDistrict}`, 10, 80);
    doc.text('---------------------------------------------------', 10, 87);
    doc.setFontSize(12);
    doc.text('HOTSPOT RANKINGS (Top 10)', 10, 96);
    doc.setFontSize(9);
    filteredHotspots.slice(0, 10).forEach((h, i) => {
      const y = 104 + i * 12;
      doc.text(`#${h.hotspotRank} ${h.policeStation} (${h.district}) | ${h.dominantCrime} | Risk: ${h.riskLevel} | Growth: +${h.growthPercentage}%`, 10, y);
    });
    doc.setFontSize(8);
    doc.text('CONFIDENTIAL - KARNATAKA POLICE INTELLIGENCE PLATFORM', 10, 285);
    doc.save(`Hotspot_Intelligence_Report_${todayStr}.pdf`);
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-16 px-6 sm:px-8">
      
      {/* Header */}
      <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 bg-[#0B1F4D] rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
            <Layers className="w-6 h-6 text-[#C79A2B]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B1F4D] tracking-tight">Crime Hotspot Intelligence</h1>
              <div className="px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E7ECF3] flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-widest whitespace-nowrap">AI Active</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#64748B]">Tactical command suite for district-level risk rankings and predictive hotspot telemetry.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-[12px] transition-colors shrink-0 cursor-pointer shadow-sm group"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
        {[
          { label: 'Total Hotspots', val: kpis.total, color: 'text-[#0B1F4D]' },
          { label: 'Emerging', val: kpis.emerging, color: 'text-[#B91C1C]' },
          { label: 'Persistent', val: kpis.persistent, color: 'text-[#B45309]' },
          { label: 'Critical Risk Zones', val: kpis.critical, color: 'text-[#B91C1C]' },
          { label: 'Avg Density Index', val: `${kpis.avgDensity} /10`, color: 'text-[#0B1F4D]' },
          { label: 'Highest Risk District', val: kpis.highestRiskDistrict, color: 'text-[#0B1F4D]', textOnly: true }
        ].map((card, i) => (
          <div key={i} className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{card.label}</span>
            {card.textOnly ? (
              <span className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-wide truncate mt-3">{card.val}</span>
            ) : (
              <span className={`text-2xl font-black font-mono mt-2 ${card.color}`}>{card.val}</span>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar Filters */}
      <HotspotFilters 
        filters={filters}
        setFilters={setFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={handleResetFilters}
        onExport={handleExportData}
        role="analyst"
      />

      {/* Main Split Grid - 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (8 cols = 66.6% width) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Active Crime Anomalies Alert Banner */}
          <AnimatePresence>
            {activeAlerts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2 text-[#B91C1C] font-black text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{activeAlerts.length} Active Crime Anomalies Detected</span>
                  </div>
                  <span className="text-[10px] bg-[#B91C1C]/10 text-[#B91C1C] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse-soft">Early Warning Alerts</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeAlerts.slice(0, 4).map((alert, idx) => {
                    const isCritical = alert.priority === 'Critical';
                    const isHigh = alert.priority === 'High';
                    const stripColor = isCritical ? 'border-l-[#B91C1C]' : isHigh ? 'border-l-[#B45309]' : 'border-l-[#C79A2B]';
                    const bgBadge = isCritical ? 'bg-[#B91C1C]/10 text-[#B91C1C]' : isHigh ? 'bg-[#B45309]/10 text-[#B45309]' : 'bg-[#C79A2B]/10 text-[#C79A2B]';
                    
                    return (
                      <div key={idx} className={`flex items-start gap-2.5 p-2.5 bg-[#F8F9FB] rounded-lg border border-[#E7ECF3] border-l-4 ${stripColor}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${bgBadge}`}>{alert.priority}</span>
                            <span className="text-xs font-bold text-[#94A3B8] uppercase">Just Now</span>
                          </div>
                          <p className="text-xs font-bold text-[#0F172A] leading-tight truncate" title={alert.title}>
                            {alert.title.replace(/^[🚨🔥⚠️]\s*/, '')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 h-96 animate-pulse" />
          ) : filteredHotspots.length === 0 ? (
            <div className="p-10 text-center bg-white border border-[#E7ECF3] rounded-[20px] max-w-md mx-auto shadow-sm">
              <ShieldAlert className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
              <h4 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">No hotspots matches filters</h4>
              <p className="text-[10px] font-bold text-[#64748B] mt-2 mb-5 uppercase tracking-wider">Try adjusting your query or resetting all filter tags.</p>
              <button onClick={handleResetFilters} className="h-9 px-4 rounded-lg bg-[#0B1F4D] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#0B1F4D]/90 transition-colors w-full">
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

        {/* Right Column (4 cols = 33.3% width) - Telemetry */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 bg-white border border-[#E7ECF3] rounded-[20px] shadow-sm flex flex-col">
            
            {/* Header */}
            <div className="p-4 bg-[#F8F9FB] border-b border-[#E7ECF3] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0B1F4D]" />
                <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">Hotspot Telemetry</h3>
              </div>
              {selectedHotspot && (
                <span className="text-xs font-mono bg-white border border-[#E7ECF3] text-[#64748B] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                  {selectedHotspot.hotspotId}
                </span>
              )}
            </div>

            <div className="p-4 bg-white">
              {!selectedHotspot ? (
                <div className="flex flex-col items-center justify-center text-center text-[#64748B] h-64 space-y-3">
                  <ClipboardList className="w-10 h-10 text-[#94A3B8] animate-pulse-soft" />
                  <h4 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">No Hotspot Selected</h4>
                  <p className="text-[10px] font-bold uppercase tracking-wider">Identify a precinct hotspot from the rankings table to load statistics.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">

                  {/* AI Summary Card */}
                  <div className="p-3 bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                      <span className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">AI Intelligence Summary</span>
                    </div>
                    <p className="text-xs font-bold text-[#64748B] leading-relaxed">
                      {anomalyInfo?.isGrowthAnomaly ? 'Critical anomaly detected.' : 'Monitoring parameters.'} The hotspot in {selectedHotspot.policeStation} shows {selectedHotspot.growthPercentage >= 0 ? 'a' : 'a reduction in'} growth of {Math.abs(selectedHotspot.growthPercentage)}%. 
                      {anomalyInfo?.isCategoryShift ? ` Shift detected to ${selectedHotspot.dominantCrime}.` : ` Dominant category remains ${selectedHotspot.dominantCrime}.`} 
                      {anomalyInfo?.isFrequencyAnomaly ? ' Immediate intervention recommended.' : ' Standard patrols advised.'}
                    </p>
                  </div>

                  {/* Card 1: Overview */}
                  <div className="p-3 bg-white border border-[#E7ECF3] rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Threat Risk</span>
                        <RiskBadge risk={selectedHotspot.riskLevel} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Trend Status</span>
                        <TrendBadge trend={anomalyInfo?.enhancedTrend || 'Stable'} />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#F1F5F9]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">District</span>
                        <span className="text-xs font-bold text-[#0B1F4D] uppercase">{selectedHotspot.district}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Station</span>
                        <span className="text-xs font-bold text-[#0B1F4D] uppercase">{selectedHotspot.policeStation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Risk Metrics */}
                  <div className="p-3 bg-white border border-[#E7ECF3] rounded-xl space-y-2">
                    <span className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider block mb-2">Key Risk Metrics</span>
                    {[
                      { label: 'Crime Count', val: `${selectedHotspot.crimeCount} cases` },
                      { label: 'Density Index', val: `${selectedHotspot.densityIndex} /10` },
                      { label: 'Historical Avg', val: selectedHotspot.historicalAverage },
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{row.label}</span>
                        <span className="text-xs font-black font-mono text-[#0B1F4D]">{row.val}</span>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#F1F5F9]">
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Growth YoY</span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-3">
                          <svg viewBox="0 0 40 10" className="w-full h-full overflow-visible">
                            <path d="M0,8 L10,6 L20,7 L30,4 L40,2" fill="none" stroke={selectedHotspot.growthPercentage >= 0 ? '#B91C1C' : '#15803D'} strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <span className={`text-xs font-black font-mono ${selectedHotspot.growthPercentage >= 0 ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>
                          {selectedHotspot.growthPercentage >= 0 ? '+' : ''}{selectedHotspot.growthPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Spike Detection */}
                  {anomalyInfo && (
                    <div className="p-3 bg-white border border-[#E7ECF3] rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">Spike Detection</span>
                        {anomalyInfo.isGrowthAnomaly && (
                          <span className="px-1.5 py-0.5 bg-[#B91C1C]/10 text-[#B91C1C] rounded-full text-xs font-bold uppercase tracking-wider animate-pulse-soft">Growth Anomaly</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 text-center gap-2">
                        <div className="bg-[#F8F9FB] p-2 rounded-lg">
                           <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Expected</span>
                           <span className="text-xs font-black font-mono text-[#0B1F4D]">{anomalyInfo.expectedGrowth}%</span>
                        </div>
                        <div className="bg-[#F8F9FB] p-2 rounded-lg">
                           <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Actual</span>
                           <span className={`text-xs font-black font-mono ${anomalyInfo.isGrowthAnomaly ? 'text-[#B91C1C]' : 'text-[#0B1F4D]'}`}>{selectedHotspot.growthPercentage}%</span>
                        </div>
                        <div className="bg-[#F8F9FB] p-2 rounded-lg">
                           <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Deviation</span>
                           <span className={`text-xs font-black font-mono ${anomalyInfo.isGrowthAnomaly ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>
                            {anomalyInfo.growthDeviation >= 0 ? '+' : ''}{anomalyInfo.growthDeviation.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 4: Category Shift */}
                  {anomalyInfo && (
                    <div className="p-3 bg-white border border-[#E7ECF3] rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">Category Shift</span>
                        {anomalyInfo.isCategoryShift && (
                          <span className="px-1.5 py-0.5 bg-[#B45309]/10 text-[#B45309] rounded-full text-[10px] font-bold uppercase tracking-wider">Shift Detected</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Current</span>
                          <span className="text-xs font-bold text-[#0B1F4D] uppercase truncate max-w-[120px]">{selectedHotspot.dominantCrime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Historical</span>
                          <span className="text-xs font-bold text-[#64748B] uppercase truncate max-w-[120px]">{anomalyInfo.historicalCategory}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 5: Weekly Frequency */}
                  {anomalyInfo && (
                    <div className="p-3 bg-white border border-[#E7ECF3] rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">Weekly Frequency</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          anomalyInfo.isFrequencyAnomaly ? 'bg-[#B91C1C]/10 text-[#B91C1C] animate-pulse-soft' : 'bg-[#15803D]/10 text-[#15803D]'
                        }`}>{anomalyInfo.isFrequencyAnomaly ? 'Abnormal' : 'Normal'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-16 h-6">
                          <svg viewBox="0 0 60 20" className="w-full h-full overflow-visible">
                             <path d="M0,15 L10,12 L20,18 L30,8 L40,14 L50,5 L60,10" fill="none" stroke={anomalyInfo.isFrequencyAnomaly ? '#B91C1C' : '#C79A2B'} strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Deviation</span>
                          <span className={`text-xs font-black font-mono ${anomalyInfo.isFrequencyAnomaly ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>
                            +{anomalyInfo.frequencyDeviation.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-[#F1F5F9] pt-2">
                        <div>
                          <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Historical Avg</span>
                          <span className="text-xs font-black font-mono text-[#64748B]">{anomalyInfo.expectedWeekly.toFixed(1)}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Current Count</span>
                          <span className={`text-xs font-black font-mono ${anomalyInfo.isFrequencyAnomaly ? 'text-[#B91C1C]' : 'text-[#0B1F4D]'}`}>{anomalyInfo.currentWeekly.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nav Button */}
                  <button
                    onClick={handleViewOnMap}
                    className="w-full h-9 rounded-lg bg-[#0B1F4D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0B1F4D]/90 transition-colors mt-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View on Crime Map</span>
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
