import React from 'react';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';

export default function CategoryDistribution() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01, border: '1px solid #4f46e5', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.1)' }}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-80 flex flex-col transition-all duration-300"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
      <div className="flex-1 border border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 bg-slate-950/20">
        <motion.div
          initial={{ rotate: -45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 0.6 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <PieChart className="w-10 h-10 mb-3" />
        </motion.div>
        <p className="text-sm font-medium text-slate-350">Donut Chart Visualization</p>
        <p className="text-xs mt-1 text-slate-500 font-mono">Property vs Violent vs Cyber vs Narcotics</p>
      </div>
    </motion.div>
  );
}
