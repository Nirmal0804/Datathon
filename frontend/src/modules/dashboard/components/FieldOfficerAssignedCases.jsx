import React from 'react';
import CrimeTablePlaceholder from './CrimeTablePlaceholder';
import { MOCK_CASES } from './mockData';
import { Briefcase } from 'lucide-react';

export default function FieldOfficerAssignedCases() {
  // Filter cases assigned to Inspector Patil
  const patilCases = MOCK_CASES.filter(c => c.details?.officer === 'Inspector Patil');

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
      
      {/* Table grid displaying only Patil's cases */}
      <CrimeTablePlaceholder data={patilCases} />
    </div>
  );
}
