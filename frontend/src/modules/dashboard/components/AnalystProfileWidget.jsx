import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalystProfileWidget({ onLogout, onNavigate }) {
  return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:flex">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[18px] p-2 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#E5E7EB] cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all"
      >
        <div className="w-9 h-9 rounded-xl bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-[13px] shrink-0 shadow-sm">
          JD
        </div>
        
        <div className="flex-1 min-w-[90px] pr-1">
          <p className="text-[13px] font-bold text-[#0F172A] leading-tight group-hover:text-[#0B1F4D] transition-colors">John Doe</p>
          <p className="text-[10px] font-bold text-[#64748B] mt-0.5 uppercase tracking-wider">Analyst</p>
        </div>

        <div className="flex items-center gap-0.5 border-l border-[#E5E7EB] pl-2">
          <motion.button
            onClick={() => onNavigate('settings')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0B1F4D] hover:bg-slate-50 transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </motion.button>
          
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#64748B] hover:text-rose-500 hover:bg-rose-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
