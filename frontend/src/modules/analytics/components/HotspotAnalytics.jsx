import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HOTSPOTS_DATA as MOCK_HOTSPOTS } from '../../../mock/analyticsData';
import { Flame, Compass, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function HotspotAnalytics({ timeFilter }) {
  const [timeTab, setTimeTab] = useState('Monthly'); // 'Daily' | 'Monthly' | 'Yearly'
  const [mlHotspots, setMlHotspots] = useState(null);

  useEffect(() => {
    fetch('/data/hotspot_summaries.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load hotspot summaries');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.slice(0, 10).map((hs) => ({
            area: `${hs.Primary_District} Cluster #${hs.Cluster_ID}`,
            rate: Math.round((hs.Avg_Severity_Per_Crime || 2.5) * 10),
            count: hs.Total_Crimes,
            station: `${hs.Primary_Crime_Head} Zone`
          }));

          setMlHotspots({
            Daily: formatted.slice(0, 3),
            Monthly: formatted.slice(0, 6),
            Yearly: formatted.slice(0, 10)
          });
        }
      })
      .catch(() => {
        // Fallback to mock hotspots
      });
  }, []);

  const hotspotsDataStore = mlHotspots || MOCK_HOTSPOTS;

  const activeHotspots = useMemo(() => {
    return hotspotsDataStore[timeTab] || hotspotsDataStore.Monthly;
  }, [timeTab, hotspotsDataStore]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-full justify-between">
      
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse-soft" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Emerging Crime Hotspots</h3>
              <p className="text-4xs text-slate-400 mt-0.5 font-sans">Spatial clusters reporting the highest surge in weekly cases.</p>
            </div>
          </div>

          {/* Time tab toggle */}
          <div className="flex bg-slate-950/45 p-0.5 rounded-md border border-slate-850 shrink-0">
            {['Daily', 'Monthly', 'Yearly'].map(tab => (
              <button
                key={tab}
                onClick={() => setTimeTab(tab)}
                className={`px-2.5 py-0.5 text-4xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all ${
                  timeTab === tab
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Hotspots list with hover details */}
        <div className="space-y-3 min-h-[260px]">
          {activeHotspots.map((hs, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition-colors group relative cursor-help"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <Flame className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-xs">{hs.area}</h4>
                  <p className="text-4xs text-slate-500 font-mono mt-0.5">{hs.station}</p>
                </div>
              </div>

              {/* Surge Percentage */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-0.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3 text-red-500" />
                  +{hs.rate}%
                </span>
              </div>

              {/* Hover Tooltip Overlay (Detailed statistics) */}
              <div className="absolute top-1/2 left-44 -translate-y-1/2 bg-slate-900 border border-slate-750 p-3 rounded-lg shadow-elevation-3 z-30 w-52 pointer-events-none opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800 mb-1.5 text-3xs font-bold text-slate-400 uppercase tracking-widest">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" /> Hotspot telemetry
                </div>
                <div className="space-y-1 text-4xs font-mono">
                  <div className="flex justify-between"><span>Precinct Station</span> <span className="text-slate-200 font-bold">{hs.station}</span></div>
                  <div className="flex justify-between"><span>Incident Index</span> <span className="text-slate-250 font-bold">{hs.count} cases</span></div>
                  <div className="flex justify-between"><span>Weekly shift</span> <span className="text-red-400 font-bold">+{hs.rate}% surge</span></div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
