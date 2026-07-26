import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_DATA = [
  { label: 'Property Crime', value: 45, color: '#0B1F4D', percentage: '45%' },
  { label: 'Violent Crime', value: 25, color: '#C79A2B', percentage: '25%' },
  { label: 'Cyber Crime', value: 15, color: '#10B981', percentage: '15%' },
  { label: 'Narcotics', value: 15, color: '#EF4444', percentage: '15%' },
];

export default function CategoryDistribution() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // SVG Donut Chart Calculation
  const total = MOCK_DATA.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const segments = MOCK_DATA.map(slice => {
    const startPercent = cumulativePercent;
    const slicePercent = slice.value / total;
    cumulativePercent += slicePercent;
    const endPercent = cumulativePercent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);

    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`
    ].join(' ');

    return { ...slice, pathData, startPercent, endPercent };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm h-full flex flex-col hover:border-[#1A2F63]/30 transition-all duration-300"
    >
      <div className="mb-6">
        <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider mb-1">Category Breakdown</h3>
        <p className="text-xs font-semibold text-[#64748B]">Distribution of registered cases</p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
        
        {/* SVG Donut Chart */}
        <div className="relative w-48 h-48 shrink-0">
          <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
            {segments.map((segment, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <motion.path
                  key={index}
                  d={segment.pathData}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={isHovered ? 0.45 : 0.4}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: index * 0.2 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    filter: isHovered ? `drop-shadow(0px 0px 4px ${segment.color}80)` : 'none'
                  }}
                />
              );
            })}
          </svg>
          
          {/* Center Hover Details */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {hoveredIndex !== null ? (
                <motion.div
                  key="hover"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center"
                >
                  <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">{MOCK_DATA[hoveredIndex].percentage}</div>
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest max-w-[80px] leading-tight mt-1">{MOCK_DATA[hoveredIndex].label}</div>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="text-2xl font-black text-[#0B1F4D] tracking-tight">100%</div>
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Total</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col justify-center gap-3 w-full sm:w-auto">
          {MOCK_DATA.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between gap-4 p-2 rounded-xl transition-colors cursor-pointer ${hoveredIndex === idx ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                <span className={`text-xs font-bold transition-colors ${hoveredIndex === idx ? 'text-[#0B1F4D]' : 'text-[#64748B]'}`}>{item.label}</span>
              </div>
              <span className={`text-xs font-black transition-colors ${hoveredIndex === idx ? 'text-[#0B1F4D]' : 'text-[#94A3B8]'}`}>{item.percentage}</span>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
