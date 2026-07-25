import React, { useState, useEffect } from 'react';
import CrimeTablePlaceholder from './CrimeTablePlaceholder';
import { getFieldMapCases } from '../../../api/endpoints';
import { Briefcase } from 'lucide-react';

export default function FieldOfficerAssignedCases() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const patilCases = cases.filter(c => c.details?.officer === 'Inspector Patil');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Your Assigned Cases</h2>
          <p className="text-2xs text-slate-400 mt-0.5"> Roster of investigations delegated to Inspector Patil.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card flex items-center justify-center h-[390px] text-slate-500 text-sm">
          Loading cases from API...
        </div>
      ) : (
        <CrimeTablePlaceholder data={patilCases} />
      )}
    </div>
  );
}
