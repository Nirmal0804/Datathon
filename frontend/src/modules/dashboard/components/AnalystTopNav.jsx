import React from 'react';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import kspLogo from '../../../assets/ksp-logo-official.png';

const ANALYST_NAV_ITEMS = [
  { id: 'overview', name: 'Overview' },
  { id: 'map', name: 'Crime Map' },
  { id: 'district', name: 'District Intelligence' },
  { id: 'network', name: 'Network Analysis' },
  { id: 'analytics', name: 'Analytics Suite' },
  { id: 'reports', name: 'Reports' },
  { id: 'hotspots', name: 'Crime Hotspot Detection' },
  { id: 'correlation', name: 'Socio-economic Correlation' },
];

const OFFICER_NAV_ITEMS = [
  { id: 'overview', name: 'Overview' },
  { id: 'assigned_cases', name: 'Assigned Cases' },
  { id: 'fir_management', name: 'FIR Management' },
  { id: 'map', name: 'Crime Map' },
  { id: 'hotspots', name: 'Crime Hotspot Detection' },
  { id: 'alerts', name: 'Alerts Feed' },
];

export default function AnalystTopNav({ activeModule, setActiveModule, role }) {
  const navItems = role === 'officer' ? OFFICER_NAV_ITEMS : ANALYST_NAV_ITEMS;
  const platformSubtitle = role === 'officer' ? 'FIELD OPERATIONS' : 'INTELLIGENCE PLATFORM';

  return (
    <nav className="h-[72px] bg-[#0B1F4D] rounded-[20px] flex items-center justify-between px-6 shrink-0 shadow-sm border border-white/10 w-full mb-3">
      {/* Left Section: Branding */}
      <div className="flex items-center gap-3 pr-6 border-r border-white/10 shrink-0 h-[40px]">
        <img src={kspLogo} alt="Karnataka Police Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
        <div className="hidden lg:block">
          <h2 className="text-white font-bold tracking-wide text-[14px] uppercase leading-tight">KARNATAKA POLICE</h2>
          <p className="text-[11px] text-[#C79A2B] uppercase tracking-widest font-medium mt-0.5">{platformSubtitle}</p>
        </div>
      </div>

      {/* Center Section: Navigation Links */}
      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center justify-evenly px-6 gap-4 h-full">
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`relative h-full flex items-center justify-center text-[13px] font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer px-3 ${
                isActive ? 'text-[#C79A2B]' : 'text-white/80 hover:text-white'
              }`}
            >
              <div className="relative h-full flex items-center">
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="topNavActiveUnderline"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#C79A2B]"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Section: Search & Actions */}
      <div className="flex items-center gap-3 pl-6 border-l border-white/10 shrink-0 ml-auto h-[40px]">
        {/* Search Bar */}
        <div className="relative hidden xl:block w-48">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-police-blue" />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full h-8 pl-8 pr-3 bg-white text-slate-800 text-xs rounded-full placeholder:text-police-blue focus:outline-none focus:ring-1 focus:ring-[#C79A2B] shadow-sm font-medium"
          />
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-[38px] h-[38px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#C79A2B] rounded-full" />
        </motion.button>
      </div>
    </nav>
  );
}
