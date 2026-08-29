import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Landmark, Network, TrendingUp, MoreHorizontal, ArrowRight } from 'lucide-react';
import workflowBg from '../../assets/workflow-bg.webp';

const modules = [
  { 
    name: 'Karnataka Crime Map', 
    code: 'MOD-01', 
    desc: 'Geospatial visualization of crime incidents across 31 districts.',
    icon: MapPin,
    accent: 'red',
  },
  { 
    name: 'District Intelligence', 
    code: 'MOD-02', 
    desc: 'Drill-down analytics for specific police jurisdictions and stations.',
    icon: Landmark,
    accent: 'gold',
  },
  { 
    name: 'Network Analysis', 
    code: 'MOD-03', 
    desc: 'Graph-based relationship mapping of syndicates.',
    icon: Network,
    accent: 'gold',
  },
  { 
    name: 'Predictive Analytics', 
    code: 'MOD-04', 
    desc: 'Future trend forecasting using historical case data.',
    icon: TrendingUp,
    accent: 'red',
  },
];

export default function ModulesOverview() {
  return (
    <section 
      id="modules" 
      className="py-20 sm:py-24 md:py-28 relative bg-[#F7F8FA] bg-cover bg-center bg-no-repeat overflow-hidden border-b border-slate-200/60"
      style={{ backgroundImage: `url(${workflowBg})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-14">
          <div>
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1F1] border border-[#E00000]/20 text-[#E00000] text-xs font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#E00000] animate-pulse" />
              System Architecture
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#142B45] mb-3 tracking-tight">
              Integrated Modules
            </h2>

            {/* Description */}
            <p className="text-[#142B45]/75 text-base sm:text-lg max-w-2xl font-normal leading-relaxed text-balance">
              A modular architecture designed for specific operational requirements, from state-level monitoring to station-level execution.
            </p>
          </div>

          {/* Action Link */}
          <button className="text-[#E00000] hover:text-[#C90000] font-bold text-sm mt-4 md:mt-0 flex items-center gap-1.5 transition-colors duration-200 group cursor-pointer shrink-0">
            View All Modules <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* 2x2 Modules Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {modules.map((mod, index) => {
            const Icon = mod.icon;
            const isRed = mod.accent === 'red';
            const accentLineBg = isRed ? 'bg-[#E00000]' : 'bg-[#D49A00]';
            const iconBg = isRed 
              ? 'bg-[#FFF1F1] border-[#E00000]/15 text-[#E00000]' 
              : 'bg-[#F5E7C1]/50 border-[#D49A00]/25 text-[#D49A00]';
            const badgeBg = isRed
              ? 'bg-[#FFF1F1] border-[#E00000]/20 text-[#E00000]'
              : 'bg-[#F5E7C1]/60 border-[#D49A00]/30 text-[#D49A00]';
            const underlineBg = isRed ? 'bg-[#E00000]' : 'bg-[#D49A00]';

            return (
              <motion.div
                key={mod.code}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
                className="bg-white border border-[#E8EEF5] rounded-2xl p-7 sm:p-8 group shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-out flex items-center gap-6 cursor-pointer relative overflow-hidden"
              >
                {/* Thin colored vertical accent line on left edge */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentLineBg}`} />

                {/* Top Right 3 dots indicator */}
                <MoreHorizontal className="w-5 h-5 text-slate-300 absolute right-6 top-6" />

                {/* Left Icon Container */}
                <div className={`w-14 h-14 rounded-2xl ${iconBg} border flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Right Module Details */}
                <div className="flex-1 pr-4">
                  {/* Module Badge */}
                  <div className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold tracking-wider font-mono mb-1.5 ${badgeBg}`}>
                    {mod.code}
                  </div>

                  {/* Module Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#142B45] mb-1 leading-snug group-hover:text-[#E00000] transition-colors duration-200">
                    {mod.name}
                  </h3>

                  {/* Accent Line under Title */}
                  <div className={`w-7 h-0.5 ${underlineBg} rounded-full mb-2 opacity-80`} />

                  {/* Module Description */}
                  <p className="text-[#142B45]/75 text-xs sm:text-sm leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
