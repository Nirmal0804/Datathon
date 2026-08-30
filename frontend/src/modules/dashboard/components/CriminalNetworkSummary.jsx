import React from 'react';
import { motion } from 'framer-motion';
import { Network, Users, HelpCircle, Activity } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function CriminalNetworkSummary() {
  const { t } = useTranslation();

  // Mock network graph statistics
  const stats = {
    syndicates: 8,
    trackedSuspects: 142,
    mappedConnections: 489,
    keyHubNodes: 6,
  };

  // Simple SVG Node cluster details
  const nodes = [
    { cx: 50, cy: 50, r: 6, fill: '#ef4444', label: 'Hub Node A', id: 1 }, // Critical suspect
    { cx: 120, cy: 30, r: 5, fill: '#3b82f6', label: 'Suspect B', id: 2 },
    { cx: 150, cy: 90, r: 4.5, fill: '#4f46e5', label: 'Suspect C', id: 3 },
    { cx: 80, cy: 110, r: 5, fill: '#4f46e5', label: 'Suspect D', id: 4 },
    { cx: 200, cy: 60, r: 4, fill: '#10b981', label: 'Associate E', id: 5 },
  ];

  const links = [
    { x1: 50, y1: 50, x2: 120, y2: 30 },
    { x1: 50, y1: 50, x2: 80, y2: 110 },
    { x1: 120, y1: 30, x2: 150, y2: 90 },
    { x1: 150, y1: 90, x2: 200, y2: 60 },
    { x1: 80, y1: 110, x2: 150, y2: 90 },
    { x1: 50, y1: 50, x2: 150, y2: 90 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[280px] justify-between relative overflow-hidden group">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary animate-pulse-soft" />
          <h3 className="text-sm font-semibold text-white">
            {t('network.criminalNetworkSummary', 'Criminal Network Summary')}
          </h3>
        </div>
        <span className="text-4xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-widest shrink-0">
          {t('network.syndicates', 'Syndicate Link Map')}
        </span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 z-10 py-1">
        {/* SVG Network Visualizer */}
        <div className="w-32 h-32 shrink-0 bg-slate-950/40 rounded-lg border border-slate-850/80 flex items-center justify-center relative">
          <svg className="w-full h-full" viewBox="0 0 240 140">
            {/* Draw Links */}
            {links.map((link, idx) => (
              <line
                key={idx}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke="#1e293b"
                strokeWidth="1.5"
              />
            ))}
            {/* Draw Nodes */}
            {nodes.map(n => (
              <g key={n.id} className="group/node cursor-pointer">
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r={n.r}
                  fill={n.fill}
                  className="transition-transform group-hover/node:scale-125"
                />
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r={n.r + 4}
                  fill="transparent"
                  stroke={n.fill}
                  strokeWidth="1.5"
                  className="opacity-0 group-hover/node:opacity-30 transition-opacity"
                />
                {/* Node Hover Tooltip */}
                <foreignObject x={n.cx - 35} y={n.cy - 22} width="70" height="20" className="opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900 border border-slate-700 rounded text-center px-1">
                    <span className="text-4xs font-bold text-white font-mono">{n.label}</span>
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>

        {/* Network Metrics grid */}
        <div className="flex-1 grid grid-cols-2 gap-2.5 w-full text-xs">
          <div className="p-2 bg-slate-950/30 border border-slate-850 rounded">
            <span className="block text-4xs text-slate-500 font-bold uppercase">{t('network.syndicates', 'Active Syndicates')}</span>
            <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">{stats.syndicates}</span>
          </div>
          <div className="p-2 bg-slate-950/30 border border-slate-850 rounded">
            <span className="block text-4xs text-slate-500 font-bold uppercase">{t('network.nodes', 'Mapped Nodes')}</span>
            <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">{stats.trackedSuspects}</span>
          </div>
          <div className="p-2 bg-slate-950/30 border border-slate-850 rounded">
            <span className="block text-4xs text-slate-500 font-bold uppercase">{t('network.links', 'Total Links')}</span>
            <span className="text-sm font-bold text-blue-400 font-mono mt-0.5 block">{stats.mappedConnections}</span>
          </div>
          <div className="p-2 bg-slate-950/30 border border-slate-850 rounded">
            <span className="block text-4xs text-slate-500 font-bold uppercase">{t('network.keyHubs', 'Key Hubs')}</span>
            <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">{stats.keyHubNodes}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-4xs text-slate-500 border-t border-slate-850/50 pt-2 shrink-0 z-10">
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse-soft" />
          {t('network.density', 'Graph density')}: 0.14
        </span>
        <button className="text-primary font-semibold hover:underline cursor-pointer">
          {t('network.graphExplorer', 'Graph Explorer')} &rarr;
        </button>
      </div>
    </div>
  );
}
