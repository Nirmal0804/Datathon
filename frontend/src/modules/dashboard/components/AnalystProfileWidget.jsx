import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalystProfileWidget({ onLogout, onNavigate, role }) {
  const profile = role === 'officer'
    ? { initials: 'PP', name: 'Inspector Patil', roleText: 'Field Officer' }
    : role === 'admin'
      ? { initials: 'SA', name: 'Admin Gowda', roleText: 'Administrator' }
      : { initials: 'JD', name: 'Inspector Patil', roleText: 'Analyst' };

  return (
    <div className="fixed bottom-6 left-6 z-50 hidden md:flex">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[20px] p-2 flex flex-col items-center gap-2 shadow-md border border-[#E7ECF3] transition-all"
      >
        {/* Settings Button */}
        <motion.button
          onClick={() => onNavigate('settings')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[#64748B] hover:text-[#0B1F4D] hover:bg-[#F8F9FB] transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </motion.button>

        {/* Logout Button */}
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-[12px] flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
