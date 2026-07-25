import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Ban } from 'lucide-react';
import { getIntelligenceHotspots } from '../../../api/endpoints';

export default function HotspotSummary() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIntelligenceHotspots()
      .then((res) => {
        const data = res?.data?.hotspots ?? res?.hotspots ?? res?.data ?? res ?? [];
        setHotspots(Array.isArray(data) ? data : []);
      })
      .catch(() => setHotspots([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-red-500 animate-pulse" />
        Emerging Hotspots
      </h3>
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading hotspot data...</p>
        ) : hotspots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Ban className="w-8 h-8 text-amber-500/50 mb-3" />
            <p className="text-sm text-slate-400">
              No hotspot intelligence available
              (<span className="font-mono text-amber-400">BLOCKED_ML</span>).
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Requires ML-based hotspot prediction model artifact.
            </p>
          </div>
        ) : (
          hotspots.map((hs, idx) => (
            <motion.div
              key={hs.id ?? idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -3, scale: 1.01, border: '1px solid #3b82f6/40' }}
              className="flex justify-between items-center p-3 bg-slate-800/30 border border-slate-800 rounded-lg transition-all duration-200 cursor-default"
            >
              <div>
                <p className="text-sm font-semibold text-slate-200">{hs.area ?? hs.location ?? '—'}</p>
                <p className={`text-xs mt-0.5 ${(hs.trend ?? '').startsWith('+') ? 'text-red-400' : 'text-emerald-450'}`}>
                  {hs.trend ?? '—'} this week
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                hs.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                hs.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                'bg-blue-500/10 text-blue-500 border border-blue-500/20'
              }`}>
                {hs.priority ?? '—'}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
