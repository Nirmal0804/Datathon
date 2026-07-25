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
    <section id="modules" className="py-24 md:py-28 lg:py-32 relative bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#153E75]/8 text-[#153E75] text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C79A2B]" />
              System Architecture
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-4 tracking-tight">Integrated Modules</h2>
            <p className="text-[#6B7280] text-lg max-w-2xl font-normal leading-relaxed text-balance">
              A modular architecture designed for specific operational requirements, from state-level monitoring to station-level execution.
            </p>
          </div>
          <button className="text-[#153E75] hover:text-[#0F2D56] font-bold text-sm mt-4 md:mt-0 flex items-center gap-2 transition-colors duration-200 group">
            View All Modules <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {modules.map((mod, index) => (
            <motion.div
              key={mod.code}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
              className="bg-white border border-[#E6E8EC]/80 rounded-[20px] p-8 md:p-9 group hover:shadow-[0_12px_32px_rgba(21,62,117,0.06)] hover:border-[#153E75]/25 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col sm:flex-row items-start gap-6 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
            >
              <div className="px-3.5 py-1.5 bg-[#153E75]/8 text-[#153E75] border border-[#153E75]/15 rounded-xl font-mono text-xs font-extrabold tracking-wider shrink-0 shadow-sm group-hover:bg-[#153E75]/12 transition-colors duration-300">
                {mod.code}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827] mb-2 group-hover:text-[#153E75] transition-colors duration-300">{mod.name}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{mod.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
