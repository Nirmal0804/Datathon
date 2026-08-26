import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, BrainCircuit, Network, BellRing, PieChart, FileText, ShieldCheck } from 'lucide-react';
import featuresBg from '../../assets/features-bg.png';

// Exact side illustration icons extracted from reference design
const GlobeSideIcon = ({ color }) => (
  <svg className="w-11 h-11 shrink-0" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.5">
    <circle cx="24" cy="24" r="18" opacity="0.6" strokeDasharray="3 3" />
    <ellipse cx="24" cy="24" rx="18" ry="8" opacity="0.8" />
    <ellipse cx="24" cy="24" rx="8" ry="18" opacity="0.8" />
    <line x1="6" y1="24" x2="42" y2="24" strokeWidth="1.2" opacity="0.5" />
    <line x1="24" y1="6" x2="24" y2="42" strokeWidth="1.2" opacity="0.5" />
  </svg>
);

const TrendSideIcon = ({ color }) => (
  <svg className="w-11 h-11 shrink-0" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="28" width="6" height="14" rx="1.5" opacity="0.7" />
    <rect x="18" y="22" width="6" height="20" rx="1.5" opacity="0.8" />
    <rect x="28" y="16" width="6" height="26" rx="1.5" opacity="0.9" />
    <path d="M6 32 L16 22 L26 24 L42 8" strokeWidth="2" />
    <circle cx="42" cy="8" r="3" fill={color} />
    <circle cx="26" cy="24" r="2" fill={color} />
    <circle cx="16" cy="22" r="2" fill={color} />
  </svg>
);

const NetworkSideIcon = ({ color }) => (
  <svg className="w-11 h-11 shrink-0" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="24" cy="12" r="4" strokeWidth="2" />
    <circle cx="10" cy="34" r="3.5" strokeWidth="1.8" />
    <circle cx="24" cy="38" r="3" strokeWidth="1.8" />
    <circle cx="38" cy="32" r="3.5" strokeWidth="1.8" />
    <line x1="24" y1="16" x2="10" y2="34" opacity="0.7" />
    <line x1="24" y1="16" x2="24" y2="38" opacity="0.7" />
    <line x1="24" y1="16" x2="38" y2="32" opacity="0.7" />
    <line x1="10" y1="34" x2="24" y2="38" opacity="0.5" strokeDasharray="2 2" />
    <line x1="24" y1="38" x2="38" y2="32" opacity="0.5" strokeDasharray="2 2" />
  </svg>
);

const SirenSideIcon = ({ color }) => (
  <svg className="w-11 h-11 shrink-0" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
    <path d="M16 38 C16 24 32 24 32 38 Z" strokeWidth="2" />
    <rect x="12" y="38" width="24" height="4" rx="1.5" fill={color} fillOpacity="0.15" />
    <line x1="24" y1="8" x2="24" y2="14" strokeWidth="2" />
    <line x1="10" y1="14" x2="15" y2="18" strokeWidth="1.8" />
    <line x1="38" y1="14" x2="33" y2="18" strokeWidth="1.8" />
    <line x1="6" y1="26" x2="12" y2="26" strokeWidth="1.8" />
    <line x1="42" y1="26" x2="36" y2="26" strokeWidth="1.8" />
  </svg>
);

const DashboardSideIcon = ({ color }) => (
  <svg className="w-11 h-11 shrink-0" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <rect x="6" y="10" width="36" height="28" rx="4" strokeWidth="1.8" />
    <line x1="6" y1="18" x2="42" y2="18" opacity="0.6" />
    <circle cx="11" cy="14" r="1" fill={color} />
    <circle cx="15" cy="14" r="1" fill={color} />
    <circle cx="19" cy="14" r="1" fill={color} />
    <rect x="10" y="23" width="10" height="10" rx="1.5" opacity="0.7" />
    <line x1="24" y1="23" x2="38" y2="23" strokeWidth="2" opacity="0.8" />
    <line x1="24" y1="28" x2="34" y2="28" opacity="0.6" />
    <line x1="24" y1="33" x2="38" y2="33" strokeWidth="1.5" opacity="0.7" />
  </svg>
);

const ReportSideIcon = ({ color }) => (
  <svg className="w-11 h-11 shrink-0" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8 H30 L38 16 V40 C38 41.1 37.1 42 36 42 H12 C10.9 42 10 41.1 10 40 V10 C10 8.9 10.9 8 12 8 Z" strokeWidth="1.8" />
    <path d="M30 8 V16 H38" opacity="0.8" />
    <line x1="16" y1="22" x2="32" y2="22" strokeWidth="2" opacity="0.8" />
    <line x1="16" y1="27" x2="28" y2="27" opacity="0.7" />
    <line x1="16" y1="32" x2="32" y2="32" opacity="0.7" />
    <line x1="16" y1="37" x2="24" y2="37" opacity="0.6" />
  </svg>
);

const features = [
  {
    number: '01',
    name: 'Geospatial Intelligence',
    description: 'Interactive heatmaps and boundary overlays for district-wise crime tracking across Karnataka.',
    icon: MapPin,
    sideIcon: GlobeSideIcon,
    accent: 'red',
  },
  {
    number: '02',
    name: 'Predictive AI Scoring',
    description: 'Machine learning algorithms to predict crime trends and assign risk scores to sensitive regions.',
    icon: BrainCircuit,
    sideIcon: TrendSideIcon,
    accent: 'gold',
  },
  {
    number: '03',
    name: 'Criminal Network Analysis',
    description: 'Graph-based relationship mapping to identify syndicates and repeat offenders automatically.',
    icon: Network,
    sideIcon: NetworkSideIcon,
    accent: 'red',
  },
  {
    number: '04',
    name: 'Real-time Threat Alerts',
    description: 'Automated push notifications and SMS alerts when anomalous patterns are detected.',
    icon: BellRing,
    sideIcon: SirenSideIcon,
    accent: 'red',
  },
  {
    number: '05',
    name: 'Dynamic Dashboards',
    description: 'Customizable KPI cards and drill-down analytics for state-level and station-level reporting.',
    icon: PieChart,
    sideIcon: DashboardSideIcon,
    accent: 'gold',
  },
  {
    number: '06',
    name: 'Automated Reporting',
    description: 'Generate compliance-ready PDF and Excel reports with a single click for daily briefings.',
    icon: FileText,
    sideIcon: ReportSideIcon,
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
            const SideIcon = feature.sideIcon;
            const isRed = feature.accent === 'red';
            const accentColor = isRed ? '#E00000' : '#D49A00';
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
                className="bg-white border border-[#E8EEF5] rounded-2xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-out group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Thin colored vertical accent line on the LEFT edge */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentLineBg}`} />

                <div>
                  {/* Top Row: Icon Container + Feature Number */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${iconBg} border flex items-center justify-center shadow-2xs transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-400 tracking-wider font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      {feature.number}
                    </span>
                  </div>

                  {/* Feature Title */}
                  <h3 className="text-lg font-bold text-[#142B45] mb-2 group-hover:text-[#E00000] transition-colors duration-200">
                    {feature.name}
                  </h3>

                  {/* Short Colored Underline below Title */}
                  <div className={`w-8 h-0.5 ${underlineBg} rounded-full mb-4 opacity-80`} />

                  {/* Feature Description + Vertical Dashed Separator Line + Side Icon */}
                  <div className="flex items-start justify-between gap-4 mt-2">
                    <p className="text-[#142B45]/75 text-xs sm:text-sm leading-relaxed flex-1">
                      {feature.description}
                    </p>

                    {/* Vertical dashed line + Side Icon extracted from reference mockup */}
                    <div className="border-l border-dashed border-slate-200 pl-3 sm:pl-4 py-1 flex items-center justify-center shrink-0">
                      <SideIcon color={accentColor} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
