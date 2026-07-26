import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Map, TrendingUp, TrendingDown } from 'lucide-react';

const hotspots = [
  { area: 'Koramangala Block 5', trend: '+15%', priority: 'High', sparkline: [10, 15, 12, 18, 24, 30, 35], color: '#EF4444' },
  { area: 'Indiranagar 100ft Rd', trend: '+8%', priority: 'Medium', sparkline: [5, 8, 7, 10, 12, 11, 14], color: '#F59E0B' },
  { area: 'Majestic Bus Stand', trend: '-2%', priority: 'Low', sparkline: [20, 18, 15, 16, 12, 10, 8], color: '#3B82F6' },
];

const MiniSparkline = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  const width = 40;
  const height = 12;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function HotspotSummary({ onNavigate }) {
  const handleViewMap = (areaName) => {
    // Generate realistic coordinates for the mock hotspots
    const coords = areaName === 'Koramangala Block 5' ? [12.9279, 77.6271] :
                   areaName === 'Indiranagar 100ft Rd' ? [12.9784, 77.6408] :
                   areaName === 'Majestic Bus Stand' ? [12.9766, 77.5713] : 
                   [15.3173, 75.7139]; // Default Karnataka center
    
    // Write context for CrimeMapLayout
    localStorage.setItem('selectedMapPosition', JSON.stringify({ center: coords, zoom: 15 }));
    
    if (onNavigate) {
      onNavigate('map');
    }
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm h-full flex flex-col justify-between">
      <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4 mb-5 shrink-0">
        <div className="w-10 h-10 rounded-[14px] bg-rose-50 flex items-center justify-center">
          <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider mb-1">Emerging Hotspots</h3>
          <p className="text-xs font-semibold text-[#64748B]">High-activity zones needing attention</p>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 gap-4">
        {hotspots.map((hs, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="group p-4 bg-white border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top row: Priority & Sparkline */}
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                hs.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                hs.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {hs.priority}
              </span>
              <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                <MiniSparkline data={hs.sparkline} color={hs.color} />
              </div>
            </div>

            {/* Middle: Location & Trend */}
            <div className="mb-4">
              <p className="text-sm font-bold text-[#0F172A] mb-1 line-clamp-1">{hs.area}</p>
              <div className={`flex items-center gap-1 text-xs font-bold ${hs.trend.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'}`}>
                {hs.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {hs.trend} <span className="text-[#64748B] font-semibold text-[10px] uppercase tracking-wider ml-1">This Wk</span>
              </div>
            </div>

            {/* Bottom: Action */}
            <button 
              onClick={() => handleViewMap(hs.area)}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#F8F9FB] hover:bg-[#F1F5F9] rounded-xl text-xs font-bold text-[#0B1F4D] transition-colors border border-[#E7ECF3]"
            >
              <Map className="w-3.5 h-3.5" />
              View Map
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
