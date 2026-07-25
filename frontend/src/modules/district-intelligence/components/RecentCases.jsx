import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Inbox } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { getFieldMapCases } from '../../../api/endpoints';

export default function RecentCases() {
  const toast = useToast();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFieldMapCases()
      .then((res) => {
        const data = res?.data?.cases ?? res?.cases ?? res?.data ?? res ?? [];
        setCases(Array.isArray(data) ? data.slice(0, 10) : []);
      })
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);

  const handleInspect = (caseId) => {
    toast.success('Inspection Mode Active', `Opening database dossier log for Case ${caseId}.`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Case Intake</h3>
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading recent cases...</p>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Inbox className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No recent case data available.</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">API contract pending.</p>
          </div>
        ) : (
          cases.map((c, idx) => (
            <motion.div
              key={c.fir_id ?? c.id ?? idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center p-3 bg-slate-800/30 border border-slate-800 rounded-lg transition-all duration-200"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-slate-200">{c.fir_id ?? c.id ?? '—'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.severity === 'Critical' || c.risk === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    c.severity === 'High' || c.risk === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {c.severity ?? c.risk ?? '—'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{c.category ?? '—'} • {c.time ?? c.created_at ?? '—'}</p>
              </div>
              <button
                onClick={() => handleInspect(c.fir_id ?? c.id)}
                className="text-primary hover:text-primary-hover text-sm cursor-pointer transition-all hover:underline"
              >
                View
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
