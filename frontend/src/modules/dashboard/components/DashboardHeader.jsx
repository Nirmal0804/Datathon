import React, { useState, useEffect } from 'react';
import { Clock, Wifi, RefreshCw } from 'lucide-react';
import kspBadge from '../../../assets/ksp-badge.png';

export default function DashboardHeader({ compact = false }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm transition-all duration-200 ease-in-out ${compact ? 'p-3 mb-4' : 'p-6 mb-6'}`}>
      
      {/* Left Section */}
      <div className={`flex items-center ${compact ? 'gap-3 md:gap-4' : 'gap-4 md:gap-5'}`}>
        {/* Karnataka Police Official Badge */}
        <img src={kspBadge} alt="Karnataka Police Badge" className={`${compact ? 'h-[48px]' : 'h-[72px]'} w-auto object-contain shrink-0 drop-shadow-md`} />
        <div className="flex flex-col justify-center">
          <h1 className={`${compact ? 'text-[28px]' : 'text-[34px]'} font-bold text-[#0F172A] leading-none tracking-tight`}>
            Crime Intelligence Dashboard
          </h1>
          <p className={`${compact ? 'text-[13px] mt-0.5' : 'text-[15px] mt-2'} font-medium text-[#64748B] leading-none`}>
            State-level crime monitoring and intelligence overview
          </p>
        </div>
      </div>

      {/* Right Section: Compact Status Chips */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
        {/* System Online Chip */}
        <div className={`flex items-center gap-2 bg-white px-3 md:px-4 ${compact ? 'h-8' : 'h-10'} rounded-[14px] border border-[#E5E7EB] shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-default`}>
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#15803D] shadow-[0_0_8px_rgba(21,128,61,0.4)] animate-pulse" />
          <span className={`${compact ? 'text-[11px]' : 'text-[13px]'} font-bold text-[#0F172A]`}>System Online</span>
        </div>

        {/* Updated Chip */}
        <div className={`flex items-center gap-2 bg-white px-3 md:px-4 ${compact ? 'h-8' : 'h-10'} rounded-[14px] border border-[#E5E7EB] shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-default`}>
          <RefreshCw className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[#64748B]`} />
          <span className={`${compact ? 'text-[11px]' : 'text-[13px]'} font-bold text-[#0F172A]`}>Updated just now</span>
        </div>

        {/* Time Chip */}
        <div className={`flex items-center gap-2 bg-white px-3 md:px-4 ${compact ? 'h-8' : 'h-10'} rounded-[14px] border border-[#E5E7EB] shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-default`}>
          <Clock className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[#64748B]`} />
          <span className={`${compact ? 'text-[12px]' : 'text-[14px]'} font-bold text-[#0F172A] font-mono tracking-tight`}>{formattedTime}</span>
        </div>
      </div>

    </div>
  );
}
