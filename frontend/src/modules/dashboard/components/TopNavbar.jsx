import React from 'react';
import { Search, Bell, Menu, Plus, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';
import kspLogo from '../../../assets/ksp-official-logo.webp';
import LazyImage from '../../../components/ui/LazyImage';
import { useTranslation } from '../../../i18n';

export default function TopNavbar({ toggleMobileMenu, role }) {
  const { t } = useTranslation();
  const { unreadCount, togglePanel } = useNotification();

  const defaultProfile = role === 'officer'
    ? { initials: 'RK', name: 'Rakesh Kumar', roleText: t('auth.roleFieldOfficer', 'Inspector'), station: 'Mysuru Rural Police' }
    : role === 'admin'
    ? { initials: 'SA', name: 'Admin S. Kumar', roleText: t('auth.roleAdmin', 'System Administrator'), station: 'State Tech HQ' }
    : { initials: 'AR', name: 'Analyst S. Rao', roleText: t('auth.roleAnalyst', 'Intelligence Analyst'), station: 'State Command HQ' };

  const [customProfile, setCustomProfile] = React.useState(() => {
    try {
      const saved = localStorage.getItem('ksp_user_profile');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        return parsed && typeof parsed === 'object' ? parsed : null;
      }
    } catch {
      return null;
    }
    return null;
  });

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
      try {
        const saved = localStorage.getItem('ksp_user_profile');
        if (saved && saved !== 'undefined' && saved !== 'null') {
          const parsed = JSON.parse(saved);
          setCustomProfile(parsed && typeof parsed === 'object' ? parsed : null);
        }
      } catch { }
    };
    window.addEventListener('ksp_avatar_updated', handleAvatarUpdate);
    window.addEventListener('ksp_profile_updated', handleAvatarUpdate);
    return () => {
      window.removeEventListener('ksp_avatar_updated', handleAvatarUpdate);
      window.removeEventListener('ksp_profile_updated', handleAvatarUpdate);
    };
  }, []);

  const profileName = (customProfile && typeof customProfile.fullName === 'string' && customProfile.fullName.trim())
    ? customProfile.fullName.trim()
    : defaultProfile.name;
  const profileRank = (customProfile && typeof customProfile.rank === 'string' && customProfile.rank.trim())
    ? customProfile.rank.trim()
    : defaultProfile.roleText;
  const profileStation = (customProfile && typeof customProfile.policeStation === 'string' && customProfile.policeStation.trim())
    ? customProfile.policeStation.trim()
    : defaultProfile.station;

  const profileInitials = profileName
    ? profileName.split(' ').filter(Boolean).map((n) => n[0]).join('').substring(0, 2).toUpperCase() || defaultProfile.initials
    : defaultProfile.initials;

  return (
    <header className="h-[68px] sm:h-[72px] bg-[#E00000] text-white flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 border-b border-[#C90000] shadow-md rounded-[18px] sm:rounded-[20px] w-full">
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Mobile hamburger button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white/15 text-white border border-white/20 shadow-xs hover:bg-white/25 transition-colors duration-200 ease-in-out cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Mobile Branding (Visible on < sm) */}
        <div className="flex items-center gap-2.5 sm:hidden min-w-0">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-0.5 shadow-xs shrink-0 overflow-hidden">
            <LazyImage src={kspLogo} alt="Karnataka Police" className="h-full w-auto object-contain" containerClassName="w-full h-full" loading="eager" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-extrabold text-sm leading-tight tracking-tight truncate">KARNATAKA POLICE</span>
            <span className="text-[9.5px] text-[#F5E7C1] font-medium tracking-wide truncate">{t('auth.portalName', 'Crime Analytics Platform')}</span>
          </div>
        </div>

        {/* Desktop / Tablet Officer Profile Card (Visible sm+) */}
        <div className="hidden sm:flex items-center gap-3 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full shadow-xs text-white">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#D49A00] text-[#142B45] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {avatarUrl ? (
                <LazyImage src={avatarUrl} alt="Officer Avatar" className="w-full h-full object-cover" containerClassName="w-full h-full" />
              ) : (
                profileInitials
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#E00000]" />
          </div>
          <div className="text-left min-w-0 pr-1">
            <p className="text-xs font-bold leading-tight text-white truncate">{profileName}</p>
            <p className="text-[10px] text-[#F5E7C1] font-medium truncate">{profileRank} • {profileStation}</p>
          </div>
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        {/* Quick action button (sm+) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const el = document.getElementById('field-officer-fir-mgmt');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#D49A00] hover:bg-[#b88500] text-[#142B45] text-xs font-extrabold rounded-[14px] shadow-xs hover:shadow transition-all duration-200 ease-in-out cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('fir.registerFIR', 'Quick FIR')}</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          onClick={togglePanel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 sm:w-[42px] sm:h-[42px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-xs transition-all duration-200 ease-in-out cursor-pointer"
          aria-label={t('nav.notifications', 'Notifications')}
        >
          <motion.div
            key={unreadCount}
            initial={{ rotate: 0 }}
            animate={unreadCount > 0 ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.div>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center justify-center min-w-[15px] h-[15px] px-1 bg-[#D49A00] border-2 border-[#E00000] rounded-full text-[8.5px] font-black text-[#142B45]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* Mobile Avatar Pill */}
        <div className="flex items-center gap-2 sm:hidden px-1.5 py-1 bg-white/10 border border-white/20 rounded-full">
          <div className="w-7 h-7 rounded-full bg-[#D49A00] text-[#142B45] flex items-center justify-center font-extrabold text-[10.5px] shrink-0 overflow-hidden">
            {avatarUrl ? (
              <LazyImage src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" containerClassName="w-full h-full" />
            ) : (
              profileInitials
            )}
          </div>
        </div>

        {/* Desktop User Menu (sm+) */}
        <motion.div
          whileHover={{ y: -1 }}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-[14px] shadow-xs hover:bg-white/20 transition-all duration-200 ease-in-out cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-[10px] bg-[#D49A00] text-[#142B45] flex items-center justify-center font-extrabold text-[11px] shrink-0 select-none overflow-hidden">
            {avatarUrl ? (
              <LazyImage src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" containerClassName="w-full h-full" />
            ) : (
              profileInitials
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-white leading-tight truncate">{profileName}</p>
            <p className="text-[9.5px] font-medium text-[#F5E7C1] uppercase tracking-wider truncate">{profileRank}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/80 hidden lg:block transition-colors" />
        </motion.div>
      </div>
    </header>
  );
}
