import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Map } from 'lucide-react';

export default function Hero({ onLoginClick }) {
  return (
    <section id="home" className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      
      <div className="text-center max-w-4xl mx-auto z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-primary/30 text-primary mb-8"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wider uppercase">State Intelligence Network</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
        >
          Predict. Prevent. <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">Protect Karnataka.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
        >
          An AI-driven crime analytics and visualization platform providing real-time intelligence, geospatial mapping, and predictive modeling for law enforcement.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button onClick={onLoginClick} className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-[0_0_20px_rgba(180,83,9,0.3)] flex items-center justify-center gap-2">
            Access Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-300 glass-card hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            View Documentation
          </button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-20 relative rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden aspect-video shadow-2xl flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-slate-950/80 pointer-events-none"></div>
        <div className="text-slate-500 flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-700">
          <Map className="w-16 h-16 opacity-30 text-primary" />
          <p className="font-mono text-sm tracking-widest uppercase opacity-50">Interactive Karnataka Map Visualization Placeholder</p>
        </div>
      </motion.div>
    </section>
  );
}
