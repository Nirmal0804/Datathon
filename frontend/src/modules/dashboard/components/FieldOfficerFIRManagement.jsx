import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Search, ShieldAlert } from 'lucide-react';
import { getFieldMapCases } from '../../../api/endpoints';

export default function FieldOfficerFIRManagement() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await getFieldMapCases({ page: 1, page_size: 50 });
        const mapped = (res?.items || []).map(c => ({
          id: c.fir_number || c.fir_id,
          category: c.crime_head,
          district: c.district,
          policeStation: c.station_name || c.station_id,
          date: c.incident_date ? new Date(c.incident_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          rawDate: c.incident_date ? new Date(c.incident_date) : new Date(),
          risk: 'Medium',
          status: c.status || 'Active',
          arrests: 0,
          details: {
            officer: c.investigating_officer || 'Unassigned',
            section: (c.bns_sections || []).join(', ') || '—',
            summary: `${c.crime_head} case at ${c.station_name || c.station_id}, ${c.district}.`,
            timeline: [{ date: 'FIR Registered', desc: 'Case logged in CCTNS' }],
          },
        }));
        if (!cancelled) setCases(mapped);
      } catch (err) {
        if (!cancelled) setCases([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return cases;
    const q = searchQuery.toLowerCase();
    return cases.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.policeStation.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }, [cases, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">FIR Management</h2>
              <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                READ ONLY
              </span>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">View precinct intake logs. FIR write operations are not supported.</p>
          </div>
        </div>
      </div>

      {/* Grid search and lists */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Precinct FIR Records</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter precinct records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs h-8 w-60"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh] text-slate-500 text-sm">
            Loading FIR records from API...
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
            {filteredCases.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-slate-500 text-xs">
                No FIR records found.
              </div>
            ) : (
              filteredCases.map(c => (
                <div key={c.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-primary">{c.id}</span>
                    <div>
                      <p className="text-slate-200 font-semibold">{c.category}</p>
                      <p className="text-slate-500 text-3xs">{c.date} • {c.policeStation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${c.risk === 'Critical' ? 'badge-critical' : c.risk === 'High' ? 'badge-high' : 'badge-medium'} py-0 px-1 text-3xs`}>
                      {c.risk}
                    </span>
                    <span className="text-slate-300 font-medium">{c.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
