import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import kspLogo from '../../assets/ksp-logo.jpg';

export default function Hero({ onLoginClick }) {
  return (
    <section id="home" className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#153E75]/4 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      
      <div className="text-center max-w-4xl mx-auto z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 flex justify-center"
        >
          <img 
            src={kspLogo} 
            alt="Karnataka State Police Emblem" 
            className="h-16 md:h-20 w-auto object-contain"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#153E75]/8 border border-[#153E75]/15 text-[#153E75] mb-8 shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-[#153E75]" />
          <span className="text-xs font-bold tracking-wider uppercase">State Intelligence Network</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#C79A2B] ml-0.5" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#111827] mb-6 leading-[1.1]"
        >
          Predict. Prevent. <br className="hidden md:block"/>
          <span className="text-[#153E75] relative inline-block">
            Protect Karnataka.
            <span className="absolute bottom-1.5 left-0 w-full h-1.5 bg-[#C79A2B]/25 rounded-full -z-10" />
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}
          className="text-lg md:text-xl text-[#4B5563] mb-10 max-w-2xl mx-auto font-normal leading-relaxed text-balance"
        >
          An AI-driven crime analytics and visualization platform providing real-time intelligence, geospatial mapping, and predictive modeling for law enforcement.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={onLoginClick} 
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-[#153E75] hover:bg-[#0F2D56] rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(21,62,117,0.2)] hover:shadow-[0_6px_20px_rgba(21,62,117,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 active:translate-y-0"
          >
            Access Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-[#111827] bg-white border border-[#E6E8EC] hover:bg-[#F8F9FB] hover:border-[#D1D5DB] rounded-xl transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 flex items-center justify-center gap-2 active:translate-y-0"
          >
            View Documentation
          </button>
        </motion.div>
      </div>
    </section>
  );
}
