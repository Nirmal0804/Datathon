import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { id: '01', title: 'Data Ingestion', desc: 'Securely import records from police stations.' },
  { id: '02', title: 'AI Processing', desc: 'Clean, normalize, and run predictive ML models.' },
  { id: '03', title: 'Visualization', desc: 'Render hotspots and networks on interactive maps.' },
  { id: '04', title: 'Action', desc: 'Deploy resources based on actionable intelligence.' },
];

export default function Workflow() {
  return (
    <section id="workflow" className="py-24 bg-surface/50 border-y border-slate-800 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/3">
            <h2 className="text-3xl font-bold text-white mb-4">Intelligence Lifecycle</h2>
            <p className="text-slate-400 text-lg mb-8">
              From raw FIR data to strategic deployment, the platform streamlines the entire operational workflow securely.
            </p>
            <button className="px-6 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">
              Read Architecture Docs
            </button>
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 -translate-y-1/2"></div>
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <span className="text-4xl font-black text-slate-800 mb-4 block">{step.id}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
