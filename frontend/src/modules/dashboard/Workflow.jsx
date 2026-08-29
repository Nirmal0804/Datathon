import React from 'react';
import { motion } from 'framer-motion';
import { Database, BrainCircuit, TrendingUp, Target, FileText, ArrowRight } from 'lucide-react';
import workflowBg from '../../assets/workflow-bg.webp';

const steps = [
  { 
    id: '01', 
    title: 'Data Ingestion', 
    desc: 'Securely import records from police stations.',
    icon: Database,
    accent: 'red',
  },
  { 
    id: '02', 
    title: 'AI Processing', 
    desc: 'Clean, normalize, and run predictive ML models.',
    icon: BrainCircuit,
    accent: 'gold',
  },
  { 
    id: '03', 
    title: 'Visualization', 
    desc: 'Render hotspots and networks on interactive maps.',
    icon: TrendingUp,
    accent: 'gold',
  },
  { 
    id: '04', 
    title: 'Action', 
    desc: 'Deploy resources based on actionable intelligence.',
    icon: Target,
    accent: 'red',
  },
];

export default function Workflow() {
  return (
    <section 
      id="workflow" 
      className="py-20 sm:py-24 md:py-28 bg-white bg-cover bg-center bg-no-repeat border-y border-[#E8EEF5] relative overflow-hidden"
      style={{ backgroundImage: `url(${workflowBg})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE: Introduction */}
          <div className="lg:w-5/12 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1F1] border border-[#E00000]/20 text-[#E00000] text-xs font-extrabold uppercase tracking-wider mb-5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#E00000] animate-pulse" />
              Operational Flow
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142B45] mb-3 tracking-tight leading-[1.15]">
              Intelligence Lifecycle
            </h2>

            {/* Red + Gold Accent Underline */}
            <div className="flex items-center gap-1.5 mb-5">
              <div className="w-12 h-1 bg-[#E00000] rounded-full" />
              <div className="w-6 h-1 bg-[#D49A00] rounded-full" />
            </div>

            {/* Description */}
            <p className="text-[#142B45]/75 text-base sm:text-lg mb-8 font-normal leading-relaxed text-balance">
              From raw FIR data to strategic deployment, the platform streamlines the entire operational workflow securely.
            </p>

            {/* Read Architecture Docs Button */}
            <a 
              href="./ksp-architecture-documentation.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-[#142B45] bg-white hover:bg-[#FFF1F1] rounded-xl transition-all duration-200 border border-[#E8EEF5] hover:border-[#E00000]/30 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#E00000]" />
              Read Architecture Docs
              <ArrowRight className="w-4 h-4 text-[#142B45]/60" />
            </a>
          </div>
          
          {/* RIGHT SIDE: 2x2 Connected Card Grid */}
          <div className="lg:w-7/12 relative w-full">

            {/* Desktop Connector Lines SVG Overlay */}
            <div className="hidden sm:block absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="none" fill="none">
                {/* 01 -> 02 Connector (Top Row Horizontal) */}
                <line x1="270" y1="95" x2="330" y2="95" stroke="#CBD5E1" strokeWidth="1.8" strokeDasharray="4 4" />
                <circle cx="300" cy="95" r="5" fill="#D49A00" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M 324 90 L 330 95 L 324 100" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

                {/* 02 -> 03 Connector (Step path from Col 2 Row 1 down to Col 1 Row 2) */}
                <path d="M 435 180 V 205 H 165 V 225" stroke="#CBD5E1" strokeWidth="1.8" strokeDasharray="4 4" />
                <circle cx="435" cy="205" r="5" fill="#D49A00" stroke="#FFFFFF" strokeWidth="2" />

                {/* 03 -> 04 Connector (Bottom Row Horizontal) */}
                <line x1="270" y1="310" x2="330" y2="310" stroke="#CBD5E1" strokeWidth="1.8" strokeDasharray="4 4" />
                <circle cx="300" cy="310" r="5" fill="#D49A00" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M 324 305 L 330 310 L 324 315" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* 2x2 Grid of Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isRed = step.accent === 'red';
                const accentLineBg = isRed ? 'bg-[#E00000]' : 'bg-[#D49A00]';
                const numColor = isRed ? 'text-[#E00000]' : 'text-[#D49A00]';
                const iconBg = isRed 
                  ? 'bg-[#FFF1F1] border-[#E00000]/15 text-[#E00000]' 
                  : 'bg-[#F5E7C1]/50 border-[#D49A00]/25 text-[#D49A00]';
                const underlineBg = isRed ? 'bg-[#E00000]' : 'bg-[#D49A00]';

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
                    className="bg-white border border-[#E8EEF5] rounded-2xl p-7 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Thin colored vertical accent line on the LEFT edge */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentLineBg}`} />

                    <div>
                      {/* Top Row: Icon Container + Step Number */}
                      <div className="flex items-center justify-between mb-5">
                        <div className={`w-12 h-12 rounded-xl ${iconBg} border flex items-center justify-center shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-2xl font-extrabold tracking-tight font-mono ${numColor}`}>
                            {step.id}
                          </span>
                          <div className={`w-6 h-0.5 ${underlineBg} rounded-full mt-0.5 opacity-80`} />
                        </div>
                      </div>

                      {/* Step Title */}
                      <h3 className="text-xl font-bold text-[#142B45] mb-1.5">
                        {step.title}
                      </h3>

                      {/* Short Accent Line under Title */}
                      <div className={`w-7 h-0.5 ${underlineBg} rounded-full mb-3.5 opacity-80`} />

                      {/* Step Description */}
                      <p className="text-[#142B45]/75 text-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
