import React from 'react';
import { Search, Bell, Menu, Plus, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopNavbar({ toggleMobileMenu }) {
  return (
    <header className="h-[72px] bg-transparent flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm hover:bg-slate-50 transition-colors duration-200 ease-in-out"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block w-80 lg:w-[420px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search cases, FIRs, districts..."
            className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] text-[13px] font-medium rounded-full h-[48px] pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] focus:border-transparent transition-all duration-200 ease-in-out shadow-sm placeholder:text-slate-400"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Quick action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hidden sm:flex items-center justify-center gap-2 bg-[#0B1F4D] hover:bg-[#143275] text-white px-5 h-[44px] rounded-[14px] text-[13px] font-bold shadow-sm transition-colors duration-200 ease-in-out"
        >
          <Plus className="w-4 h-4" />
          New Report
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white text-slate-500 hover:bg-gray-50 shadow-sm transition-all duration-200 ease-in-out"
          aria-label="Notifications (3 unread)"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-[#C79A2B] border-2 border-white rounded-full" />
        </motion.button>

        {/* User menu */}
        <motion.div 
          whileHover={{ y: -1 }}
          className="flex items-center gap-3 px-3 py-2 bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-[12px] bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-[11px] shrink-0 select-none">
            JD
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-[#0F172A] leading-tight group-hover:text-[#0B1F4D] transition-colors">John Doe</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Intelligence Analyst</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block group-hover:text-[#0F172A] transition-colors" />
        </motion.div>
      </div>
    </header>
  );
}
