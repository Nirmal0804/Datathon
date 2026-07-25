import React from 'react';

export default function GlobalFilterSelect({ label, icon: Icon, className, compact = false, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className={`flex items-center gap-1.5 ${compact ? 'text-[11px]' : 'text-[12px]'} uppercase font-medium text-[#64748B] tracking-wider`}>
          {Icon && <Icon className="w-3.5 h-3.5 text-[#64748B]" />}
          {label}
        </label>
      )}
      <div className="relative w-full">
        {Icon ? (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        ) : null}
        <select 
          {...props}
          className={`w-full h-11 text-xs font-semibold rounded-[16px] bg-[#F8F9FB] hover:bg-white border border-[#D9E2EC] ${Icon ? 'pl-9' : 'pl-4'} pr-10 text-[#0F172A] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0B1F4D] focus:border-[#0B1F4D] transition-all duration-200 appearance-none cursor-pointer shadow-sm ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
        >
          {props.children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
