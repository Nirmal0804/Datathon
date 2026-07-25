import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { get } from '../../../api/client';

const endpoints = [
  { label: '/health', path: '/health' },
  { label: '/health/live', path: '/health/live' },
  { label: '/health/ready', path: '/health/ready' },
];

export default function AdminSystemHealth() {
  const [results, setResults] = useState(
    endpoints.map(ep => ({ ...ep, status: 'loading', data: null }))
  );

  useEffect(() => {
    endpoints.forEach((ep, idx) => {
      get(ep.path)
        .then(data => {
          setResults(prev => prev.map((r, i) => i === idx ? { ...r, status: 'ok', data } : r));
        })
        .catch(() => {
          setResults(prev => prev.map((r, i) => i === idx ? { ...r, status: 'error', data: null } : r));
        });
    });
  }, []);

  const statusIcon = (status) => {
    if (status === 'loading') return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
    if (status === 'ok') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    return <AlertTriangle className="w-4 h-4 text-rose-400" />;
  };

  const statusLabel = (status) => {
    if (status === 'loading') return 'Connecting...';
    if (status === 'ok') return 'Connected';
    return 'Unreachable';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Platform Diagnostic Suite</h2>
          <p className="text-2xs text-slate-400 mt-0.5 font-sans">Real-time health check against backend endpoints.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.map((ep, idx) => (
          <div key={idx} className="card p-5 flex flex-col justify-between h-48">
            <div className="flex items-start justify-between border-b border-slate-800/60 pb-3 mb-2 shrink-0">
              <div className="flex items-center gap-3">
                {statusIcon(ep.status)}
                <div>
                  <h3 className="text-sm font-semibold text-white">{ep.label}</h3>
                  <p className="text-4xs text-slate-500 mt-0.5">{statusLabel(ep.status)}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {ep.status === 'ok' && ep.data ? (
                <pre className="text-4xs font-mono text-slate-400 bg-slate-950/40 border border-slate-850 rounded p-3 overflow-auto max-h-24">
                  {JSON.stringify(ep.data, null, 2)}
                </pre>
              ) : ep.status === 'error' ? (
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-xs">Health endpoint unreachable</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
