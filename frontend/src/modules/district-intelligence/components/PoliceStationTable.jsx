import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const defaultStations = [
  { id: 'PS-101', name: 'Central Station', inspector: 'R. K. Sharma', activeCases: 142, efficiency: '89%', status: 'Optimal' },
  { id: 'PS-102', name: 'West Zone', inspector: 'S. Patil', activeCases: 210, efficiency: '72%', status: 'Overloaded' },
  { id: 'PS-103', name: 'South End', inspector: 'M. Gowda', activeCases: 89, efficiency: '94%', status: 'Optimal' },
  { id: 'PS-104', name: 'Tech Park', inspector: 'K. Reddy', activeCases: 305, efficiency: '61%', status: 'Critical' },
];

export default function PoliceStationTable() {
  const [stationData, setStationData] = useState(null);

  useEffect(() => {
    fetch('/data/station_risk_scores.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch station risk scores');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.slice(0, 10).map((row) => ({
            id: row.Station_ID || `PS-${row.Risk_Rank}`,
            name: row.Station_Name || `${row.District} PS`,
            inspector: `Risk Rank #${row.Risk_Rank} (${row.District})`,
            activeCases: row.FIR_Count,
            efficiency: `${Math.round(row.Risk_Score)}%`,
            status: row.Risk_Tier || 'Optimal'
          }));
          setStationData(formatted);
        }
      })
      .catch(() => {
        // Fallback to default static list
      });
  }, []);

  const stations = stationData || defaultStations;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden mt-6">
      <div className="p-5 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-white">Police Station Performance Metrics</h3>
      </div>
      <div className="overflow-x-auto">
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
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-6 py-4 font-mono font-medium text-slate-200">{row.id}</td>
                <td className="px-6 py-4 font-semibold text-white">{row.name}</td>
                <td className="px-6 py-4">{row.inspector}</td>
                <td className="px-6 py-4">{row.activeCases}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: row.efficiency }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: idx * 0.1 }}
                        className={`h-1.5 rounded-full ${parseInt(row.efficiency) > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                    </div>
                    <span>{row.efficiency}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    row.status === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    row.status === 'Overloaded' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
