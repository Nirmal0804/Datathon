import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalystProfileWidget({ onLogout, onNavigate, role }) {
  const profile = role === 'officer' 
    ? { initials: 'PP', name: 'Inspector Patil', roleText: 'Field Officer' }
    : role === 'admin'
    ? { initials: 'SA', name: 'Admin Gowda', roleText: 'Administrator' }
    : { initials: 'JD', name: 'John Doe', roleText: 'Analyst' };

  return (
    <div className="fixed bottom-6 left-10 z-40 hidden md:flex">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[20px] p-2.5 flex items-center gap-3 shadow-sm border border-[#E5E7EB] cursor-pointer hover:shadow-md transition-all"
      >
        <div className="w-10 h-10 rounded-[14px] bg-[#0B1F4D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          {profile.initials}
        </div>
        
        <div className="flex-1 min-w-[90px] pr-1">
          <p className="text-[13px] font-bold text-[#0F172A] leading-tight group-hover:text-[#0B1F4D] transition-colors">{profile.name}</p>
          <p className="text-[10px] font-bold text-[#64748B] mt-0.5 uppercase tracking-wider">{profile.roleText}</p>
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
