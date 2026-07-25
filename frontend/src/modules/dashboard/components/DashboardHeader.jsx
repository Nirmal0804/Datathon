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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 p-4 sm:p-5 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm transition-all duration-200 ease-in-out">
      
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Karnataka Police Official Badge */}
        <img src={kspBadge} alt="Karnataka Police Badge" className="h-[54px] w-auto object-contain shrink-0 drop-shadow-sm" />
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] leading-tight tracking-tight">
            Crime Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] mt-0.5 leading-normal">
            State-level crime monitoring and intelligence overview
          </p>
        </div>
      </div>

      {/* Right Section: Compact Status Chips */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* System Online Chip */}
        <div className="flex items-center gap-2 bg-[#F8F9FB] px-3.5 h-9 rounded-[12px] border border-[#E5E7EB] shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-default">
          <div className="w-2.5 h-2.5 rounded-full bg-[#15803D] shadow-[0_0_8px_rgba(21,128,61,0.4)] animate-pulse" />
          <span className="text-xs font-bold text-[#0F172A]">System Online</span>
        </div>

        {/* Updated Chip */}
        <div className="flex items-center gap-2 bg-[#F8F9FB] px-3.5 h-9 rounded-[12px] border border-[#E5E7EB] shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-default">
          <RefreshCw className="w-4 h-4 text-police-blue" />
          <span className="text-xs font-bold text-[#0F172A]">Updated just now</span>
        </div>

        {/* Time Chip */}
        <div className="flex items-center gap-2 bg-[#F8F9FB] px-3.5 h-9 rounded-[12px] border border-[#E5E7EB] shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-default">
          <Clock className="w-4 h-4 text-police-blue" />
          <span className="text-xs font-bold text-[#0F172A] font-mono tracking-tight">{formattedTime}</span>
        </div>
      </div>

    </div>
  );
}
