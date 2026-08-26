import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, BrainCircuit, Network, BellRing, PieChart, FileText, ShieldCheck } from 'lucide-react';
import featuresBg from '../../assets/features-bg.png';

const features = [
  {
    number: '01',
    name: 'Geospatial Intelligence',
    description: 'Interactive heatmaps and boundary overlays for district-wise crime tracking across Karnataka.',
    icon: MapPin,
    accent: 'red',
  },
  {
    number: '02',
    name: 'Predictive AI Scoring',
    description: 'Machine learning algorithms to predict crime trends and assign risk scores to sensitive regions.',
    icon: BrainCircuit,
    accent: 'gold',
  },
  {
    number: '03',
    name: 'Criminal Network Analysis',
    description: 'Graph-based relationship mapping to identify syndicates and repeat offenders automatically.',
    icon: Network,
    accent: 'red',
  },
  {
    number: '04',
    name: 'Real-time Threat Alerts',
    description: 'Automated push notifications and SMS alerts when anomalous patterns are detected.',
    icon: BellRing,
    accent: 'gold',
  },
  {
    number: '05',
    name: 'Dynamic Dashboards',
    description: 'Customizable KPI cards and drill-down analytics for state-level and station-level reporting.',
    icon: PieChart,
    accent: 'red',
  },
  {
    number: '06',
    name: 'Automated Reporting',
    description: 'Generate compliance-ready PDF and Excel reports with a single click for daily briefings.',
    icon: FileText,
    accent: 'gold',
  },
];

export default function Features() {
  return (
    <section 
      id="features" 
      className="py-20 sm:py-24 md:py-28 relative bg-[#F7F8FA] bg-cover bg-center bg-no-repeat overflow-hidden border-b border-slate-200/60"
      style={{ backgroundImage: `url(${featuresBg})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Features Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-14">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF1F1] border border-[#E00000]/20 text-[#E00000] text-xs font-bold shadow-2xs mb-4">
            <ShieldCheck className="w-4 h-4 text-[#E00000]" />
            <span className="tracking-wider uppercase">STATE INTELLIGENCE NETWORK</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E00000] ml-0.5 animate-pulse" />
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#142B45] tracking-tight mb-3">
            Core Platform Capabilities
          </h2>

          {/* Short Red + Gold Underline */}
          <div className="flex justify-center items-center gap-1.5 mb-4">
            <div className="w-12 h-1 bg-[#E00000] rounded-full" />
            <div className="w-6 h-1 bg-[#D49A00] rounded-full" />
          </div>

          {/* Subtitle */}
          <p className="text-[#142B45]/75 text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
            Operational intelligence built for modern law enforcement.
          </p>
        </div>

        {/* 3-Column x 2-Row Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isRed = feature.accent === 'red';
            const accentLineBg = isRed ? 'bg-[#E00000]' : 'bg-[#D49A00]';
            const iconBg = isRed 
              ? 'bg-[#FFF1F1] border-[#E00000]/15 text-[#E00000]' 
              : 'bg-[#F5E7C1]/50 border-[#D49A00]/25 text-[#D49A00]';
            const underlineBg = isRed ? 'bg-[#E00000]' : 'bg-[#D49A00]';

            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
                className="bg-white border border-[#E8EEF5] rounded-2xl p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-out group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Thin colored vertical accent line on the LEFT edge */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentLineBg}`} />

                {/* Subtle Watermark Icon on Lower-Right */}
                <Icon className="absolute -right-3 -bottom-3 w-28 h-28 text-[#142B45] opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Top Row: Icon Container + Feature Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl ${iconBg} border flex items-center justify-center shadow-2xs transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-400 tracking-wider font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      {feature.number}
                    </span>
                  </div>

                  {/* Feature Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#142B45] mb-2 group-hover:text-[#E00000] transition-colors duration-200">
                    {feature.name}
                  </h3>

                  {/* Short Colored Underline below Title */}
                  <div className={`w-8 h-0.5 ${underlineBg} rounded-full mb-4 opacity-80`} />

                  {/* Feature Description */}
                  <p className="text-[#142B45]/75 text-sm leading-relaxed">
                    {feature.description}
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
