import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

const cases = [
  { id: 'FIR-2023-0892', category: 'Cybercrime', time: '2 hours ago', risk: 'High' },
  { id: 'FIR-2023-0891', category: 'Property', time: '5 hours ago', risk: 'Medium' },
  { id: 'FIR-2023-0890', category: 'Violent', time: '1 day ago', risk: 'Critical' },
];

export default function RecentCases() {
  const toast = useToast();

  const handleInspect = (caseId) => {
    toast.success('Inspection Mode Active', `Opening database dossier log for Case ${caseId}.`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Case Intake</h3>
      <div className="space-y-3">
        {cases.map((c, idx) => (
          <motion.div 
            key={c.id} 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="flex justify-between items-center p-3 bg-slate-800/30 border border-slate-800 rounded-lg transition-all duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-slate-200">{c.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.risk === 'Critical' ? 'bg-red-500/20 text-red-400' :
                  c.risk === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {c.risk}
                </span>
              </div>
              <p className="text-xs text-slate-400">{c.category} • {c.time}</p>
            </div>
            <button 
              onClick={() => handleInspect(c.id)}
              className="text-primary hover:text-primary-hover text-sm cursor-pointer transition-all hover:underline"
            >
              View
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
