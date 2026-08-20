import React from 'react';
import { Loader2, Shield } from 'lucide-react';

export default function SessionRestoreScreen() {
  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col items-center justify-center gap-5 font-sans text-[#0F172A]">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-white border border-[#E2E8F0] shadow-sm w-16 h-16 flex items-center justify-center">
          <Shield className="w-7 h-7 text-[#2563EB] stroke-[1.8]" />
        </div>
        <Loader2 className="w-7 h-7 text-[#2563EB] animate-spin" />
        <p className="text-sm font-semibold text-slate-600 tracking-wide">
          Restoring secure session…
        </p>
      </div>
    </div>
  );
}