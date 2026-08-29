import React, { useState, useEffect } from 'react';
import { Clock, Wifi, RefreshCw } from 'lucide-react';
import kspBadge from '../../../assets/ksp-badge.webp';
import LazyImage from '../../../components/ui/LazyImage';

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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-7 md:p-8 bg-white border border-[#E7ECF3] rounded-[20px] sm:rounded-[24px] shadow-sm transition-all duration-200 ease-in-out">
      
      {/* Left Section */}
      <div className="flex items-center gap-3.5 sm:gap-5">
        {/* Karnataka Police Official Badge */}
        <div className="h-11 sm:h-[60px] w-10 sm:w-[50px] shrink-0 overflow-hidden flex items-center justify-center">
          <LazyImage
            src={kspBadge}
            alt="Karnataka Police Badge"
            className="h-full w-auto object-contain drop-shadow-sm"
            containerClassName="w-full h-full"
            loading="eager"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            Crime Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-normal text-[#64748B] mt-0.5 sm:mt-1 leading-normal">
            State-level crime monitoring and intelligence overview
          </p>
        </div>
      </div>

      {/* Right Section: Compact Status Chips */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
        {/* System Online Chip */}
        <div className="flex items-center gap-2 bg-[#F8F9FB] px-3 sm:px-4 h-8 sm:h-10 rounded-[14px] sm:rounded-[16px] border border-[#E7ECF3] shadow-sm cursor-default">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#15803D] shadow-[0_0_8px_rgba(21,128,61,0.4)] animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold text-[#0F172A]">System Online</span>
        </div>

        {/* Updated Chip */}
        <div className="flex items-center gap-2 bg-[#F8F9FB] px-3 sm:px-4 h-8 sm:h-10 rounded-[14px] sm:rounded-[16px] border border-[#E7ECF3] shadow-sm cursor-default">
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C79A2B]" />
          <span className="text-[11px] sm:text-xs font-bold text-[#0F172A]">Live Sync</span>
        </div>

        {/* Time Chip */}
        <div className="flex items-center gap-2 bg-[#F8F9FB] px-3 sm:px-4 h-8 sm:h-10 rounded-[14px] sm:rounded-[16px] border border-[#E7ECF3] shadow-sm cursor-default">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748B]" />
          <span className="text-[11px] sm:text-xs font-bold text-[#0F172A] font-mono tracking-tight">{formattedTime}</span>
        </div>
      </div>

    </div>
  );
}
