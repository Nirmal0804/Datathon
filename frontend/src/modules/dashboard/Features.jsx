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
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Core Platform Capabilities</h2>
          <p className="text-slate-400 text-lg">
            A comprehensive suite of tools engineered for modern law enforcement, combining raw data with actionable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-primary/50 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.name}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
