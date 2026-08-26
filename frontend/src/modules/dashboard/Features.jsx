import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, BrainCircuit, Network, BellRing, PieChart, FileText } from 'lucide-react';

const features = [
  {
    name: 'Geospatial Intelligence',
    description: 'Interactive heatmaps and boundary overlays for district-wise crime tracking across Karnataka.',
    icon: MapPin,
  },
  {
    name: 'Predictive AI Scoring',
    description: 'Machine learning algorithms to predict crime trends and assign risk scores to sensitive regions.',
    icon: BrainCircuit,
  },
  {
    name: 'Criminal Network Analysis',
    description: 'Graph-based relationship mapping to identify syndicates and repeat offenders automatically.',
    icon: Network,
  },
  {
    name: 'Real-time Threat Alerts',
    description: 'Automated push notifications and SMS alerts when anomalous patterns are detected.',
    icon: BellRing,
  },
  {
    name: 'Dynamic Dashboards',
    description: 'Customizable KPI cards and drill-down analytics for state-level and station-level reporting.',
    icon: PieChart,
  },
  {
    name: 'Automated Reporting',
    description: 'Generate compliance-ready PDF and Excel reports with a single click for daily briefings.',
    icon: FileText,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-28 lg:py-32 relative bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#142B45] mb-4 tracking-tight">Core Platform Capabilities</h2>
          <p className="text-[#142B45]/70 text-lg font-normal leading-relaxed text-balance">
            A comprehensive suite of tools engineered for modern law enforcement, combining raw data with actionable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
              className="bg-white border border-[#E8EEF5] rounded-[20px] p-8 md:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(224,0,0,0.06)] hover:border-[#E00000]/30 hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-[#FFF1F1] rounded-2xl flex items-center justify-center mb-6 border border-[#E00000]/15 group-hover:bg-[#E00000]/10 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-[#E00000]" />
                </div>
                <h3 className="text-xl font-bold text-[#142B45] mb-3 group-hover:text-[#E00000] transition-colors duration-300">{feature.name}</h3>
                <p className="text-[#142B45]/75 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
