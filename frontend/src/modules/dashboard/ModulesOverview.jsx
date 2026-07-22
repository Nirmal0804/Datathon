import React from 'react';
import { motion } from 'framer-motion';

const modules = [
  { name: 'Karnataka Crime Map', code: 'MOD-01', desc: 'Geospatial visualization of crime incidents across 31 districts.' },
  { name: 'District Intelligence', code: 'MOD-02', desc: 'Drill-down analytics for specific police jurisdictions and stations.' },
  { name: 'Network Analysis', code: 'MOD-03', desc: 'Graph-based relationship mapping of syndicates.' },
  { name: 'Predictive Analytics', code: 'MOD-04', desc: 'Future trend forecasting using historical case data.' },
];

export default function ModulesOverview() {
  return (
    <section id="modules" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Integrated Modules</h2>
            <p className="text-slate-400 max-w-2xl">
              A modular architecture designed for specific operational requirements, from state-level monitoring to station-level execution.
            </p>
          </div>
          <button className="text-primary hover:text-primary-hover font-semibold mt-4 md:mt-0 flex items-center gap-2">
            View All Modules &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, index) => (
            <motion.div
              key={mod.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 group hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row items-start gap-6 cursor-pointer"
            >
              <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded font-mono text-sm tracking-widest shrink-0">
                {mod.code}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">{mod.name}</h3>
                <p className="text-slate-400">{mod.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
