import React from 'react';

export default function GlobalFilterInput({ label, icon: Icon, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="flex items-center gap-1.5 text-[12px] uppercase font-medium text-[#64748B] tracking-wider">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#64748B]" />}
          {label}
        </label>
      )}
      <div className="relative w-full">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-[#64748B]" />
          </div>
        )}
        <input 
          {...props}
          className={`w-full h-[44px] rounded-[14px] bg-white border border-[#E5E7EB] ${Icon ? 'pl-9' : 'pl-4'} pr-4 text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B1F4D] transition-colors shadow-sm ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
        />
      </div>
    </div>
  );
}
