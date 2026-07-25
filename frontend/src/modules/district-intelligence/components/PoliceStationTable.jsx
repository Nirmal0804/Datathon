import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStations } from '../../../api/endpoints';

export default function PoliceStationTable() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStations()
      .then((res) => {
        const data = res?.data?.stations ?? res?.stations ?? res?.data ?? res ?? [];
        setStations(Array.isArray(data) ? data : []);
      })
      .catch(() => setStations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden mt-6">
      <div className="p-5 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-white">Police Station Performance Metrics</h3>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading station data...</div>
        ) : stations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No station data available — API contract pending.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 font-semibold">Station ID</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Inspector-In-Charge</th>
                <th className="px-6 py-3 font-semibold">Active Cases</th>
                <th className="px-6 py-3 font-semibold">Clearance Rate</th>
                <th className="px-6 py-3 font-semibold">Workload Status</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((row, idx) => (
                <motion.tr
                  key={row.id ?? idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-medium text-slate-200">{row.id ?? row.station_id ?? '—'}</td>
                  <td className="px-6 py-4 font-semibold text-white">{row.name ?? row.station_name ?? '—'}</td>
                  <td className="px-6 py-4">{row.inspector ?? row.inspector_name ?? '—'}</td>
                  <td className="px-6 py-4">{row.activeCases ?? row.active_cases ?? '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: row.efficiency ?? '0%' }}
                          transition={{ duration: 1.0, ease: 'easeOut', delay: idx * 0.1 }}
                          className={`h-1.5 rounded-full ${parseInt(row.efficiency) > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        />
                      </div>
                      <span>{row.efficiency ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      row.status === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      row.status === 'Overloaded' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {row.status ?? '—'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
