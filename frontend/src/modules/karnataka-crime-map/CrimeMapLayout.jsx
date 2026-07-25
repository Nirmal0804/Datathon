import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, X, Shield, ShieldAlert, BarChart2, Download, Play, RefreshCw, Layers } from 'lucide-react';
import { jsPDF } from 'jspdf';
import GISMap, { getCoordinatesForCase } from './components/GISMap';
import GISSidebar from './components/GISSidebar';
import AnalyticsPanel from './components/AnalyticsPanel';
import TimelineSlider from './components/TimelineSlider';
import { MOCK_CASES, DISTRICTS, POLICE_STATIONS, CATEGORIES, STATUSES } from '../dashboard/components/mockData';
import { useToast } from '../../components/ui/Toast';
import { DISTRICT_PREDICTION_DATA } from '../../mock/districtPredictionData';

// Command Center Loading Skeleton
function SkeletonMapOverlay() {
  return (
    <div className="absolute inset-0 bg-slate-950/80 z-[500] flex flex-col justify-center p-8 space-y-6 backdrop-blur-sm">
      <div className="max-w-md mx-auto w-full space-y-4">
        <div className="h-4 bg-slate-800 rounded w-1/3 animate-pulse" />
        <div className="h-8 bg-slate-800 rounded w-3/4 animate-pulse" />
        <div className="space-y-2 pt-4">
          <div className="h-3 bg-slate-800 rounded w-full animate-pulse" />
          <div className="h-3 bg-slate-800 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-slate-800 rounded w-4/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function CrimeMapLayout({ role = 'analyst' }) {
  const { addToast } = useToast();
  const isAnalyst = role === 'analyst';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(isAnalyst); // open by default for analyst on desktop
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);

  const selectedDistrictRisk = useMemo(() => {
    if (!selectedDistrictId) return null;
    return DISTRICT_PREDICTION_DATA[selectedDistrictId] || null;
  }, [selectedDistrictId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileAnalyticsOpen, setMobileAnalyticsOpen] = useState(false);

  // Time playback slider bounds
  const [timelineCutoff, setTimelineCutoff] = useState(null);

  // Map Overlays Config Toggles
  const [layers, setLayers] = useState({
    showMarkers: true,
    showHeatmap: isAnalyst, // default true for analyst
    showClusters: isAnalyst, // default true for analyst
    showDensity: false,
    showJurisdictions: false,
    showHotspots: isAnalyst,
    showBoundaries: true
  });

  // Sidebar Filter Criteria
  const [filters, setFilters] = useState({
    district: 'All',
    policeStation: 'All',
    category: 'All',
    severity: 'All',
    status: 'All',
    startDate: '',
    endDate: ''
  });

  // Map coordinates controller sync
  const [mapState, setMapState] = useState({
    center: [15.3173, 75.7139],
    zoom: 7,
    resetKey: 0
  });

  // Simulate skeleton load on filter change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [filters]);

  // Read transitions from hotspots detection layout
  useEffect(() => {
    const savedPos = localStorage.getItem('selectedMapPosition');
    if (savedPos) {
      try {
        const { center, zoom } = JSON.parse(savedPos);
        setMapState(prev => ({
          ...prev,
          center,
          zoom,
          resetKey: prev.resetKey + 1
        }));
        localStorage.removeItem('selectedMapPosition'); // consume
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Compute filtered cases locally from state & timeline cutoff
  const filteredCases = useMemo(() => {
    let list = [...MOCK_CASES];

    if (filters.district && filters.district !== 'All') {
      list = list.filter(c => c.district === filters.district);
    }
    if (filters.policeStation && filters.policeStation !== 'All') {
      list = list.filter(c => c.policeStation === filters.policeStation);
    }
    if (filters.category && filters.category !== 'All') {
      list = list.filter(c => c.category === filters.category);
    }
    if (filters.severity && filters.severity !== 'All') {
      list = list.filter(c => c.risk === filters.severity);
    }
    if (isAnalyst && filters.status && filters.status !== 'All') {
      list = list.filter(c => c.status === filters.status);
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      list = list.filter(c => c.rawDate >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      list = list.filter(c => c.rawDate <= end);
    }

    // Apply timeline cutoff date filter if set during playback
    if (isAnalyst && timelineCutoff) {
      list = list.filter(c => c.rawDate <= timelineCutoff);
    }

    return list;
  }, [filters, timelineCutoff, isAnalyst]);

  // Live auto-complete search query matches
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const q = val.toLowerCase();

    // Matches by FIR, Police Station, Crime Category, or District
    const hits = MOCK_CASES.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.policeStation.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q)
    ).slice(0, 6);
    setSearchResults(hits);
  };

  const handleSelectSearchResult = (hit) => {
    setSelectedCase(hit);
    const coords = getCoordinatesForCase(hit);
    setMapState({
      center: coords,
      zoom: 12,
      resetKey: mapState.resetKey + 1
    });
    setSearchResults([]);
    setSearchQuery(hit.id);
  };

  const handleResetAll = () => {
    setFilters({
      district: 'All',
      policeStation: 'All',
      category: 'All',
      severity: 'All',
      status: 'All',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCase(null);
    setTimelineCutoff(null);
    setMapState({
      center: [15.3173, 75.7139],
      zoom: 7,
      resetKey: mapState.resetKey + 1
    });
  };

  const handleExportSnapshot = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const filenameBase = `Crime_Map_Snapshot_${todayStr}`;
    const officerInfo = {
      analyst: { name: 'Inspector Patil', role: 'Intelligence Analyst' },
      officer: { name: 'Insp. R. Kumar', role: 'Field Officer' },
      admin: { name: 'Super Admin S. Kumar', role: 'System Administrator' },
    }[role] || { name: 'Officer in Charge', role: 'Departmental Admin' };

    try {
      // 1. Generate professional PDF report using jsPDF
      const doc = new jsPDF();
      doc.setFont('Courier');
      doc.setFontSize(14);
      
      doc.text('CONFIDENTIAL - INTERNAL USE ONLY', 10, 15);
      doc.text('===================================================', 10, 22);
      doc.text('REPORT TYPE: GEOSPATIAL CRIME MAP SNAPSHOT REPORT', 10, 29);
      
      doc.setFontSize(10);
      doc.text(`REPORT ID:             MAP-SNP-${todayStr}`, 10, 38);
      doc.text(`GENERATION DATE & TIME: ${todayStr} 09:30 AM`, 10, 45);
      doc.text(`REPORTING OFFICER:     ${officerInfo.name}`, 10, 52);
      doc.text(`OFFICER ROLE:          ${officerInfo.role}`, 10, 59);
      doc.text(`DISTRICT JURISDICTION: ${filters.district === 'All' ? 'Statewide (All Karnataka)' : filters.district}`, 10, 66);
      doc.text(`CLASSIFICATION:        CONFIDENTIAL - INTERNAL USE ONLY`, 10, 73);
      doc.text('---------------------------------------------------', 10, 80);
      
      doc.setFontSize(12);
      doc.text('1. VISIBLE GEOSPATIAL LAYERS & FILTERS', 10, 90);
      doc.text('--------------------------------------', 10, 95);
      doc.setFontSize(10);
      doc.text(`• Active Filter District: ${filters.district === 'All' ? 'All Districts' : filters.district}`, 10, 102);
      doc.text(`• Crime Classification Filter: ${filters.category === 'All' ? 'All Categories' : filters.category}`, 10, 109);
      doc.text(`• Current Date Range Filter: ${filters.dateRange}`, 10, 116);
      doc.text(`• Total Layer Intakes: ${filteredCases.length} crime markers active`, 10, 123);
      
      doc.setFontSize(12);
      doc.text('2. GEOGRAPHIC HOTSPOT DISTRIBUTION & RISK RATINGS', 10, 135);
      doc.text('-------------------------------------------------', 10, 140);
      doc.setFontSize(10);
      doc.text(`• Active Markers Rendered: ${filteredCases.length} incidents`, 10, 147);
      doc.text(`• Overlay Layer: District Boundaries GeoJSON Overlay Rendered`, 10, 154);
      doc.text(`• Risk Indicators: Color-coded (Red=Critical, Orange=High, Yellow=Medium, Green=Low)`, 10, 161);
      
      doc.setFontSize(12);
      doc.text('3. ACTIVE PRECINCT INTEL SUMMARY', 10, 175);
      doc.text('--------------------------------', 10, 180);
      doc.setFontSize(10);
      let yPos = 187;
      filteredCases.slice(0, 5).forEach((c, idx) => {
        doc.text(`${idx + 1}. Case ${c.id}: ${c.category} at ${c.policeStation} (Risk: ${c.risk})`, 10, yPos);
        yPos += 7;
      });
      
      doc.text('CONFIDENTIAL MAP SNAPSHOT REPORT END', 10, yPos + 10);
      doc.save(`${filenameBase}.pdf`);

      addToast({
        title: 'Geospatial Report Exported',
        message: 'Karnataka crime map snapshot compiled and saved to downloads.',
        type: 'success'
      });
    } catch (e) {
      console.warn('PDF export failed, falling back to PNG snapshot rendering', e);
      // 2. Fallback: Draw Map Snapshot as high-resolution PNG image on Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, 1200, 800);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('KARNATAKA GEOSPATIAL CRIME MAP SNAPSHOT', 50, 60);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(`Report ID: MAP-SNP-${todayStr}`, 50, 110);
      ctx.fillText(`Classification: CONFIDENTIAL - INTERNAL USE ONLY`, 50, 140);
      ctx.fillText(`Reporting Officer: ${officerInfo.name} (${officerInfo.role})`, 50, 170);
      ctx.fillText(`District Jurisdiction: ${filters.district === 'All' ? 'All Districts' : filters.district}`, 50, 200);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 240, 1100, 480);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(52, 242, 1096, 476);

      ctx.fillStyle = '#ffffff';
      ctx.fillText('Map Boundaries & Legends:', 80, 290);
      ctx.fillStyle = '#f87171';
      ctx.fillText('🔴 Critical Risk Zones (Bengaluru City, Hubballi-Dharwad)', 80, 330);
      ctx.fillStyle = '#fb923c';
      ctx.fillText('🟠 High Risk Zones (Mysuru, Kalaburagi)', 80, 360);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Total Crime Markers Rendered: ${filteredCases.length} incidents`, 80, 410);

      canvas.toBlob((pngBlob) => {
        const url = URL.createObjectURL(pngBlob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filenameBase}.png`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 'image/png');

      addToast({
        title: 'Geospatial Image Exported',
        message: 'Karnataka crime map snapshot compiled as high-res PNG image.',
        type: 'success'
      });
    }
  };

  // Case details contextual analytics metrics (Analyst extensions)
  const caseMetrics = useMemo(() => {
    if (!selectedCase) return null;

    const districtCases = MOCK_CASES.filter(c => c.district === selectedCase.district);
    const totalDistrictCrimes = districtCases.length;
    const highSeverityCount = districtCases.filter(c => c.risk === 'Critical' || c.risk === 'High').length;
    const isHotspot = totalDistrictCrimes > 4;
    const relatedCrimes = districtCases.filter(c => c.category === selectedCase.category && c.id !== selectedCase.id).length;
    const nearby = districtCases.filter(c => c.id !== selectedCase.id).slice(0, 3);

    return {
      totalDistrictCrimes,
      highSeverityCount,
      isHotspot,
      relatedCrimes,
      nearby
    };
  }, [selectedCase]);

  // Available police stations based on selected district
  const availableStations = useMemo(() => {
    if (!filters.district || filters.district === 'All') {
      const list = [];
      Object.keys(POLICE_STATIONS).slice(0, 5).forEach(d => {
        list.push(...POLICE_STATIONS[d] || []);
      });
      return ['All', ...new Set(list)];
    }
    return ['All', ...(POLICE_STATIONS[filters.district] || [])];
  }, [filters.district]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'district') {
        next.policeStation = 'All';
      }
      return next;
    });
  };

  return (
    <div className="w-full p-8 bg-[#F7F8FA] min-h-[calc(100vh-90px)] space-y-6 flex flex-col font-sans">

      {/* Top GIS Floating Command Bar (Relocated Horizontal Filters) */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          
          {/* Search Box */}
          <div className="relative w-64 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search FIR, category, station..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-10 pr-9 text-xs bg-[#F8F9FB] border border-[#D9E2EC] rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] text-[#0F172A] font-medium shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Results Auto-complete List */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 mt-2 bg-white border border-[#E7ECF3] rounded-[16px] shadow-xl overflow-hidden max-h-60 overflow-y-auto z-[500]"
                >
                  {searchResults.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectSearchResult(c)}
                      className="w-full px-4 py-2.5 text-left text-xs text-[#0F172A] hover:bg-[#F8F9FB] border-b border-[#F1F5F9] last:border-b-0 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-police-navy mr-2">{c.id}</span>
                        <span className="text-slate-500 truncate text-[11px]">{c.category} - {c.policeStation}</span>
                      </div>
                      <span className={`badge ${c.risk === 'Critical' || c.risk === 'High' ? 'badge-critical' : c.risk === 'Medium' ? 'badge-high' : 'badge-neutral'} text-[10px] py-0.5 px-2 rounded-full font-bold`}>
                        {c.risk}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* District Dropdown */}
          <select 
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className="h-11 rounded-[16px] bg-[#F8F9FB] border border-[#D9E2EC] px-3.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all"
          >
            <option value="All">All Districts</option>
            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Police Station Dropdown */}
          <select 
            value={filters.policeStation}
            onChange={(e) => handleFilterChange('policeStation', e.target.value)}
            className="h-11 rounded-[16px] bg-[#F8F9FB] border border-[#D9E2EC] px-3.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all"
          >
            {availableStations.map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </select>

          {/* Crime Category Dropdown */}
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="h-11 rounded-[16px] bg-[#F8F9FB] border border-[#D9E2EC] px-3.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Severity Dropdown */}
          <select 
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="h-11 rounded-[16px] bg-[#F8F9FB] border border-[#D9E2EC] px-3.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="h-11 rounded-[16px] bg-[#F8F9FB] border border-[#D9E2EC] px-3 text-xs font-semibold text-[#0F172A]" 
            />
            <span className="text-slate-400 text-xs">to</span>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="h-11 rounded-[16px] bg-[#F8F9FB] border border-[#D9E2EC] px-3 text-xs font-semibold text-[#0F172A]" 
            />
          </div>

        </div>

        {/* Action Buttons: Reset & Export */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetAll}
            className="h-11 px-4 rounded-[999px] bg-white border border-[#E7ECF3] hover:bg-[#F8F9FB] text-[#0F172A] font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleExportSnapshot}
            className="h-11 px-5 rounded-[999px] bg-[#0B1F4D] text-white hover:bg-[#0A192F] font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Workspace: Left Sidebar (15%), Center Map Hero (68%), Right Intelligence Panel (17%) */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch w-full flex-1">

        {/* 1. Left Command Filter panel (15% width) */}
        <div className={`hidden md:block shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-[15%] min-w-[200px] max-w-[240px]' : 'w-0 overflow-hidden'}`}>
          <div className="w-full h-full">
            <GISSidebar
              filters={filters}
              setFilters={setFilters}
              layers={layers}
              setLayers={setLayers}
              onReset={handleResetAll}
              role={role}
            />
          </div>
        </div>

        {/* 2. Center GIS Map Canvas (~68% width - Map as Hero) */}
        <div className="flex-1 w-full md:w-[68%] bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm overflow-hidden relative h-[680px] flex flex-col min-w-0">
          {isLoading && <SkeletonMapOverlay />}

          <GISMap
            filteredCases={filteredCases}
            layers={layers}
            setLayers={setLayers}
            selectedCase={selectedCase}
            setSelectedCase={setSelectedCase}
            mapState={mapState}
            setMapState={setMapState}
            role={role}
            onExportSnapshot={handleExportSnapshot}
            onDistrictClick={setSelectedDistrictId}
          />

          {/* Empty State overlay */}
          {filteredCases.length === 0 && !isLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-white/70 backdrop-blur-[2px]">
              <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 text-center max-w-sm shadow-xl">
                <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#0F172A] mb-1">No crime records found</h3>
                <p className="text-xs text-[#64748B] mb-4">No crime incidents match the selected filter criteria.</p>
                <button
                  onClick={handleResetAll}
                  className="h-10 px-5 rounded-[999px] bg-[#0B1F4D] text-white text-xs font-bold w-full hover:bg-[#0A192F] shadow-sm cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Right Intelligence Panel (~17% width) */}
        <div className="hidden md:block shrink-0 w-[17%] min-w-[220px] max-w-[260px] h-[680px]">
          <AnalyticsPanel
            filteredCases={filteredCases}
            onClose={null}
            allCases={MOCK_CASES}
            role={role}
            onTimeChange={setTimelineCutoff}
            startDate={filters.startDate}
            endDate={filters.endDate}
          />
        </div>

      </div>

      {/* 4. Sliding Context Information Drawer (Shared) */}
      <AnimatePresence>
        {selectedCase && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-[490] md:hidden cursor-pointer"
              onClick={() => setSelectedCase(null)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 z-[500] w-80 sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-2xs font-mono font-bold text-slate-500 uppercase tracking-widest">Case Profile</span>
                    <h3 className="text-sm font-bold text-white font-mono">{selectedCase.id}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 text-xs">

                {/* Severity & Status */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                    <span className="block text-4xs text-slate-500 font-bold uppercase mb-1">Severity Level</span>
                    <span className={`inline-block py-0.5 px-2 rounded text-4xs font-bold text-white uppercase ${selectedCase.risk === 'Critical' || selectedCase.risk === 'High' ? 'bg-red-500' : selectedCase.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}>
                      {selectedCase.risk}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                    <span className="block text-4xs text-slate-500 font-bold uppercase mb-1">Status Code</span>
                    <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedCase.status === 'Closed' ? 'bg-slate-500' : 'bg-success glow-success animate-pulse-soft'
                        }`} />
                      {selectedCase.status}
                    </span>
                  </div>
                </div>

                {/* Case Meta Details */}
                <div className="space-y-2.5 p-3.5 bg-slate-950/40 rounded-lg border border-slate-850">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40">
                    <span className="text-slate-400 font-medium">Crime Category</span>
                    <span className="font-semibold text-slate-200">{selectedCase.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40">
                    <span className="text-slate-400 font-medium">Precinct Station</span>
                    <span className="font-semibold text-slate-200">{selectedCase.policeStation}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40">
                    <span className="text-slate-400 font-medium">Jurisdiction District</span>
                    <span className="font-semibold text-slate-200">{selectedCase.district}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40">
                    <span className="text-slate-400 font-medium">IPC Legal Code</span>
                    <span className="font-mono text-slate-200">{selectedCase.details?.section || 'Section 379 IPC'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-850/40">
                    <span className="text-slate-400 font-medium">Date Logged</span>
                    <span className="font-semibold text-slate-200">{selectedCase.date}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-400 font-medium">Officer Assigned</span>
                    <span className="font-semibold text-slate-250">{selectedCase.details?.officer || 'Inspector Patil'}</span>
                  </div>
                </div>

                {/* Analyst-specific details dashboard extensions */}
                {isAnalyst && caseMetrics && (
                  <div className="space-y-3.5 p-3.5 bg-slate-950/50 rounded-lg border border-slate-800/80">
                    <h4 className="text-slate-400 font-bold uppercase tracking-wider text-4xs">GIS Spatial Indicators</h4>

                    <div className="flex justify-between items-center py-1 border-b border-slate-850/40">
                      <span className="text-slate-400">District Crime Volume</span>
                      <span className="font-semibold text-slate-200 font-mono">{caseMetrics.totalDistrictCrimes} cases</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-850/40">
                      <span className="text-slate-400">High-Severity Ratio</span>
                      <span className="font-semibold text-rose-400 font-mono">{caseMetrics.highSeverityCount} cases</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-850/40">
                      <span className="text-slate-400">Zone Hotspot Status</span>
                      <span className={`font-semibold ${caseMetrics.isHotspot ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                        {caseMetrics.isHotspot ? 'Active Hotspot' : 'Normal Beat'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Related Crimes in District</span>
                      <span className="font-semibold text-indigo-400 font-mono">{caseMetrics.relatedCrimes} identical</span>
                    </div>

                    {caseMetrics.nearby.length > 0 && (
                      <div className="pt-2 border-t border-slate-850/50 space-y-1">
                        <span className="text-slate-500 text-3xs font-bold uppercase">Nearby Incidents:</span>
                        <div className="flex gap-1.5 flex-wrap pt-0.5">
                          {caseMetrics.nearby.map(nb => (
                            <button
                              key={nb.id}
                              onClick={() => setSelectedCase(nb)}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 font-mono hover:text-white transition-colors text-4xs"
                            >
                              {nb.id}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-2">
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-4xs">Incident Narrative Summary</h4>
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 text-slate-350 leading-relaxed">
                    {selectedCase.details?.summary}
                  </div>
                </div>

                {/* Timeline */}
                {selectedCase.details?.timeline && selectedCase.details.timeline.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-slate-400 font-bold uppercase tracking-wider text-4xs">Investigation Milestones</h4>
                    <div className="border-l border-slate-800 pl-3 ml-1.5 space-y-3 pt-1">
                      {selectedCase.details.timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute left-[-16.5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-950 border border-primary flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                          </span>
                          <span className="block text-4xs text-slate-500 font-mono">{item.date}</span>
                          <p className="text-slate-300 font-medium mt-0.5">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. Mobile Collapsible Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-[490] md:hidden cursor-pointer"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[500] bg-slate-900 border-t border-slate-800 rounded-t-2xl max-h-[80vh] overflow-y-auto p-5 pb-8 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-primary" /> Filter Config
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <GISSidebar
                filters={filters}
                setFilters={setFilters}
                layers={layers}
                setLayers={setLayers}
                onReset={handleResetAll}
                role={role}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. Mobile Collapsible Analytics Drawer */}
      <AnimatePresence>
        {isAnalyst && mobileAnalyticsOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-[490] md:hidden cursor-pointer"
              onClick={() => setMobileAnalyticsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[500] bg-slate-900 border-t border-slate-800 rounded-t-2xl max-h-[80vh] overflow-y-auto p-5 pb-8 md:hidden"
            >
              <AnalyticsPanel
                filteredCases={filteredCases}
                onClose={() => setMobileAnalyticsOpen(false)}
                allCases={MOCK_CASES}
                role={role}
                onTimeChange={setTimelineCutoff}
                startDate={filters.startDate}
                endDate={filters.endDate}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. District Risk Intelligence Drawer (Analyst only) */}
      <AnimatePresence>
        {selectedDistrictId && selectedDistrictRisk && isAnalyst && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-[490] md:hidden cursor-pointer"
              onClick={() => setSelectedDistrictId(null)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 z-[500] w-80 sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-indigo-400 animate-pulse-soft" />
                  <div>
                    <span className="text-2xs font-mono font-bold text-slate-500 uppercase tracking-widest">District Risk Intelligence</span>
                    <h3 className="text-sm font-bold text-white font-mono">{selectedDistrictRisk.districtName || selectedDistrictRisk.name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDistrictId(null)}
                  className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 text-xs text-slate-300">

                {/* Prediction Window & Confidence */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/45 border border-slate-850 rounded-lg">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Prediction Window</span>
                    <span className="text-slate-200 font-semibold text-xs">Next 30 Days</span>
                  </div>
                  <div className="p-3 bg-slate-950/45 border border-slate-850 rounded-lg">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">AI Confidence</span>
                    <span className="text-indigo-400 font-bold text-xs">{selectedDistrictRisk.confidence}%</span>
                  </div>
                </div>

                {/* Risk Score */}
                <div className="p-4 bg-slate-950/20 border border-slate-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Overall Risk Score</span>
                    <span className="font-mono text-sm font-bold text-white">{selectedDistrictRisk.riskScore} <span className="text-4xs text-slate-500">/100</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${selectedDistrictRisk.riskLevel === 'Critical' ? 'bg-red-500' :
                        selectedDistrictRisk.riskLevel === 'High' ? 'bg-orange-500' :
                          selectedDistrictRisk.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                      style={{ width: `${selectedDistrictRisk.riskScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-4xs text-slate-500 font-mono">Classification:</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${selectedDistrictRisk.riskLevel === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse-soft' :
                      selectedDistrictRisk.riskLevel === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        selectedDistrictRisk.riskLevel === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                      }`}>
                      {selectedDistrictRisk.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Contributing Factors */}
                <div className="space-y-2">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Risk Contributing Factors</span>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    {Object.entries(selectedDistrictRisk.factors).map(([key, f]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-slate-950/40 border border-slate-850 rounded-lg">
                        <span className="text-slate-350">✓ {f.label}</span>
                        <span className={`font-bold uppercase ${f.value === 'High' ? 'text-red-400' :
                          f.value === 'Medium' ? 'text-orange-400' : 'text-emerald-400'
                          }`}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predicted Crime Increase */}
                <div className="space-y-2">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Predicted Crime Growth</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDistrictRisk.predictedIncrease.map((item, idx) => (
                      <div key={idx} className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg flex justify-between items-center">
                        <span className="text-slate-300 text-[10px] truncate max-w-20">{item.category}</span>
                        <span className="text-red-400 font-bold text-[10px]">▲ {item.change}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Emerging Hotspots */}
                <div className="space-y-2">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Emerging Hotspots</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDistrictRisk.hotspots.map((hs, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                        {hs}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-2 pb-6">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Preventive Policing Recommendations</span>
                  <div className="space-y-1.5">
                    {selectedDistrictRisk.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-2 bg-indigo-500/5 border border-indigo-500/15 rounded-lg leading-relaxed text-[10px] text-indigo-300">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
