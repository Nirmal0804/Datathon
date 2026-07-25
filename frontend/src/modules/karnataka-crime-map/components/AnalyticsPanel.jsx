import React, { useState, useMemo } from 'react';
import { BarChart2, X, RefreshCw, Layers, Calendar, HelpCircle, Activity } from 'lucide-react';
import { DISTRICTS } from '../../dashboard/components/mockData';
import TimelineSlider from './TimelineSlider';
import GlobalKPICard from '../../../components/shared/ui/GlobalKPICard';

export default function AnalyticsPanel({ 
  filteredCases, 
  onClose,
  allCases,
  role,
  onTimeChange,
  startDate,
  endDate
}) {
  const isAnalyst = role === 'analyst';
  const [activeTab, setActiveTab] = useState('analytics');
  const [districtA, setDistrictA] = useState('Bengaluru City');
  const [districtB, setDistrictB] = useState('Mysuru');

  // Compute stats on filteredCases
  const stats = useMemo(() => {
    const total = filteredCases.length;
    const active = filteredCases.filter(c => c.status === 'Active' || c.status === 'Investigating').length;
    const highSeverity = filteredCases.filter(c => c.risk === 'Critical' || c.risk === 'High').length;
    
    // Most common category
    const catCounts = {};
    filteredCases.forEach(c => {
      catCounts[c.category] = (catCounts[c.category] || 0) + 1;
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
    allCases.forEach(c => {
      distCounts[c.district] = (distCounts[c.district] || 0) + 1;
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
    <div className="h-full bg-slate-900 border-l border-slate-800 flex flex-col justify-between overflow-hidden text-xs">
      
      {/* Header & Tabs */}
      <div className="shrink-0 bg-slate-950/40 p-4 pb-0 border-b border-slate-800">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary animate-pulse-soft" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Spatial Intelligence</h2>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white md:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 text-2xs font-semibold text-slate-400 pb-3">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'comparison', label: 'Comparison' },
            { id: 'timeline', label: 'Timeline' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-1.5 text-center rounded transition-colors cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-primary/20 text-primary border border-primary/30 font-bold' 
                  : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Independent Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        
        {/* Tab Content 1: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-2xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" /> Key Performance Indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <GlobalKPICard
                  title="Total Crimes"
                  value={stats.total}
                  type="info"
                />
                <GlobalKPICard
                  title="Active Cases"
                  value={stats.active}
                  type="warning"
                />
                <GlobalKPICard
                  title="High Severity"
                  value={stats.highSeverity}
                  type="critical"
                />
                <GlobalKPICard
                  title="Density Index"
                  value={stats.densityScore}
                  description="/ 10"
                  type="warning"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-lg space-y-3">
              <div className="flex justify-between items-center text-3xs">
                <span className="text-slate-500 font-bold uppercase">Detected Hotspots</span>
                <span className="font-semibold text-rose-400 font-mono">{stats.hotspotsCount} zones</span>
              </div>
              <div className="flex justify-between items-center text-3xs pt-2 border-t border-slate-850/50">
                <span className="text-slate-500 font-bold uppercase">Dominant Crime Type</span>
                <span className="font-semibold text-slate-200 truncate max-w-[150px]">{stats.commonCat}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: District Comparison */}
        {activeTab === 'comparison' && (
          <div className="space-y-4">
            <h3 className="text-2xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" /> District Comparison Tool
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-slate-500 mb-1" htmlFor="compare-dist-a">District A</label>
                <select 
                  id="compare-dist-a"
                  value={districtA} 
                  onChange={(e) => setDistrictA(e.target.value)}
                  className="select text-3xs h-8 bg-slate-800 border-slate-700 p-1"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 mb-1" htmlFor="compare-dist-b">District B</label>
                <select 
                  id="compare-dist-b"
                  value={districtB} 
                  onChange={(e) => setDistrictB(e.target.value)}
                  className="select text-3xs h-8 bg-slate-800 border-slate-700 p-1"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-850 space-y-3.5">
              <div className="grid grid-cols-3 text-center font-semibold text-slate-500 text-4xs uppercase tracking-wider pb-1.5 border-b border-slate-850/40">
                <span className="text-left truncate">{districtA.split(' ')[0]}</span>
                <span>Indicator</span>
                <span className="text-right truncate">{districtB.split(' ')[0]}</span>
              </div>

              {[
                { label: 'Total Crimes', valA: comparison.a.total, valB: comparison.b.total, isMono: true },
                { label: 'YoY Growth', valA: `${comparison.a.growth >= 0 ? '+' : ''}${comparison.a.growth}%`, valB: `${comparison.b.growth >= 0 ? '+' : ''}${comparison.b.growth}%`, isMono: true, highlight: true },
                { label: 'Active cases', valA: comparison.a.active, valB: comparison.b.active, isMono: true },
                { label: 'High Severity', valA: comparison.a.high, valB: comparison.b.high, isMono: true },
                { label: 'Hotspot Area', valA: comparison.a.hotspot ? 'Yes' : 'No', valB: comparison.b.hotspot ? 'Yes' : 'No' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 text-center text-xs">
                  <span className={`text-left font-semibold ${row.isMono ? 'font-mono text-slate-200' : 'text-slate-350'}`}>{row.valA}</span>
                  <span className="text-[10px] text-slate-500">{row.label}</span>
                  <span className={`text-right font-semibold ${row.isMono ? 'font-mono text-slate-200' : 'text-slate-350'} ${row.highlight ? (parseFloat(row.valB) > parseFloat(row.valA) ? 'text-rose-400' : 'text-emerald-400') : ''}`}>{row.valB}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Timeline Slider Playback */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-2xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Time Series Playback
            </h3>
            
            {onTimeChange ? (
              <TimelineSlider 
                onTimeChange={onTimeChange}
                startDate={startDate}
                endDate={endDate}
              />
            ) : (
              <div className="text-center p-6 bg-slate-950/40 rounded border border-slate-850 text-slate-500">
                Time playback controls unavailable.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
