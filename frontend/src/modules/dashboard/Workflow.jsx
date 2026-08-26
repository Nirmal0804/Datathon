import React from 'react';
import { motion } from 'framer-motion';
import workflowBg from '../../assets/workflow-bg.png';

const steps = [
  { id: '01', title: 'Data Ingestion', desc: 'Securely import records from police stations.' },
  { id: '02', title: 'AI Processing', desc: 'Clean, normalize, and run predictive ML models.' },
  { id: '03', title: 'Visualization', desc: 'Render hotspots and networks on interactive maps.' },
  { id: '04', title: 'Action', desc: 'Deploy resources based on actionable intelligence.' },
];

export default function Workflow() {
  return (
    <section 
      id="workflow" 
      className="py-24 md:py-28 lg:py-32 bg-white bg-cover bg-center bg-no-repeat border-y border-[#E8EEF5] relative overflow-hidden"
      style={{ backgroundImage: `url(${workflowBg})` }}
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFF1F1] rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1F1] border border-[#E00000]/20 text-[#E00000] text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D49A00]" />
              Operational Flow
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#142B45] mb-4 tracking-tight">Intelligence Lifecycle</h2>
            <p className="text-[#142B45]/70 text-lg mb-8 font-normal leading-relaxed text-balance">
              From raw FIR data to strategic deployment, the platform streamlines the entire operational workflow securely.
            </p>
            <button className="px-6 py-3.5 text-sm font-semibold text-[#142B45] bg-[#F7F8FA] hover:bg-[#FFF1F1] rounded-xl transition-all duration-200 border border-[#E8EEF5] hover:border-[#E00000]/30 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0">
              Read Architecture Docs
            </button>
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-[#E8EEF5] -z-10 -translate-y-1/2"></div>
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
                className="bg-white border border-[#E8EEF5] rounded-[20px] p-8 md:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(224,0,0,0.06)] hover:border-[#E00000]/30 hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-extrabold text-[#E00000] tracking-tight">{step.id}</span>
                  <div className="w-2 h-2 rounded-full bg-[#D49A00]" />
                </div>
                <h3 className="text-xl font-bold text-[#142B45] mb-2">{step.title}</h3>
                <p className="text-[#142B45]/75 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
