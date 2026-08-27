import React from 'react';
import { Search, Bell, Menu, Plus, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';

export default function TopNavbar({ toggleMobileMenu }) {
  const { unreadCount, togglePanel } = useNotification();
  const [avatarUrl, setAvatarUrl] = React.useState(() => {
    try {
      const saved = localStorage.getItem('ksp_user_avatar');
      return saved && saved !== 'undefined' && saved !== 'null' ? saved : null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        const saved = localStorage.getItem('ksp_user_avatar');
        setAvatarUrl(saved && saved !== 'undefined' && saved !== 'null' ? saved : null);
      } catch { }
    };
    window.addEventListener('ksp_avatar_updated', handleAvatarUpdate);
    return () => window.removeEventListener('ksp_avatar_updated', handleAvatarUpdate);
  }, []);

  return (
    <header className="h-[72px] bg-[#E00000] text-white flex items-center justify-between px-6 lg:px-8 shrink-0 border-b border-[#C90000] shadow-md rounded-[20px]">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 text-white border border-white/20 shadow-xs hover:bg-white/20 transition-colors duration-200 ease-in-out cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Relocated Officer Profile Card */}
        <div className="hidden sm:flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-2 rounded-full shadow-xs text-white">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#D49A00] text-[#142B45] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Officer Avatar" className="w-full h-full object-cover" />
              ) : (
                'RK'
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#E00000]" />
          </div>
          <div className="text-left min-w-0 pr-1">
            <p className="text-xs font-bold leading-tight text-white truncate">Rakesh Kumar</p>
            <p className="text-[10px] text-[#F5E7C1] font-medium truncate">Field Officer • Mysuru Rural Police</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Quick action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hidden sm:flex items-center justify-center gap-2 bg-[#D49A00] hover:bg-[#B88600] text-[#142B45] px-5 h-[44px] rounded-[14px] text-[13px] font-extrabold shadow-sm transition-colors duration-200 ease-in-out cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#142B45]" />
          New Report
        </motion.button>

        {/* Notifications */}
        <motion.button
          onClick={togglePanel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-xs transition-all duration-200 ease-in-out cursor-pointer"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <motion.div
            key={unreadCount}
            initial={{ rotate: 0 }}
            animate={unreadCount > 0 ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Bell className="w-5 h-5 text-white" />
          </motion.div>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-[#D49A00] border-2 border-[#E00000] rounded-full text-[9px] font-black text-[#142B45]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* User menu */}
        <motion.div
          whileHover={{ y: -1 }}
          className="flex items-center gap-3 px-3 py-2 bg-white/10 border border-white/20 rounded-[16px] shadow-xs hover:bg-white/20 transition-all duration-200 ease-in-out cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-[12px] bg-[#D49A00] text-[#142B45] flex items-center justify-center font-extrabold text-[11px] shrink-0 select-none">
            JD
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-white leading-tight transition-colors">John Doe</p>
            <p className="text-[10px] font-medium text-[#F5E7C1] mt-0.5 uppercase tracking-wider">Intelligence Analyst</p>
          </div>
          <ChevronDown className="w-4 h-4 text-white/80 hidden sm:block transition-colors" />
        </motion.div>
      </div>
    </header>
  );
}
