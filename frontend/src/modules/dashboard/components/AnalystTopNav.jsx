import React from 'react';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';
import kspLogo from '../../../assets/ksp-official-logo.png';

const ANALYST_NAV_ITEMS = [
  { id: 'overview', name: 'Overview' },
  { id: 'map', name: 'Crime Map' },
  { id: 'district', name: 'District Intel' },
  { id: 'network', name: 'Network Analysis' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'reports', name: 'Reports' },
  { id: 'hotspots', name: 'Crime Hotspots' },
  { id: 'correlation', name: 'Socio-economic' },
];

const OFFICER_NAV_ITEMS = [
  { id: 'overview', name: 'Overview' },
  { id: 'assigned_cases', name: 'Assigned Cases' },
  { id: 'fir_management', name: 'FIR Management' },
  { id: 'map', name: 'Crime Map' },
  { id: 'hotspots', name: 'Crime Hotspots' },
  { id: 'alerts', name: 'Alerts Feed' },
];

const ADMIN_NAV_ITEMS = [
  { id: 'overview', name: 'Overview' },
  { id: 'users', name: 'Users Control' },
  { id: 'roles', name: 'Roles & Privileges' },
  { id: 'audit_logs', name: 'System Audit Logs' },
  { id: 'system_health', name: 'System Health' },
  { id: 'config', name: 'Configuration' },
];

export default function AnalystTopNav({ activeModule, setActiveModule, role }) {
  const { unreadCount, togglePanel } = useNotification();
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
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('ksp_user_profile');
        if (saved && saved !== 'undefined' && saved !== 'null') {
          const parsed = JSON.parse(saved);
          setCustomProfile(parsed && typeof parsed === 'object' ? parsed : null);
        }
      } catch { }
      try {
        const savedAvatar = localStorage.getItem('ksp_user_avatar');
        setAvatarUrl(savedAvatar && savedAvatar !== 'undefined' && savedAvatar !== 'null' ? savedAvatar : null);
      } catch { }
    };

    window.addEventListener('ksp_profile_updated', handleSync);
    window.addEventListener('ksp_avatar_updated', handleSync);
    return () => {
      window.removeEventListener('ksp_profile_updated', handleSync);
      window.removeEventListener('ksp_avatar_updated', handleSync);
    };
  }, []);

  const navItems = role === 'officer'
    ? OFFICER_NAV_ITEMS
    : role === 'admin'
      ? ADMIN_NAV_ITEMS
      : ANALYST_NAV_ITEMS;

  const platformSubtitle = role === 'officer'
    ? 'FIELD OPERATIONS'
    : role === 'admin'
      ? 'SYSTEM ADMINISTRATION PLATFORM'
      : 'INTELLIGENCE PLATFORM';

  const defaultProfile = role === 'officer'
    ? { initials: 'RK', name: 'Rakesh Kumar', roleText: 'Inspector', station: 'Mysuru Rural Police' }
    : role === 'admin'
      ? { initials: 'SA', name: 'Super Admin S. Kumar', roleText: 'System Administrator', station: 'State Tech HQ' }
      : { initials: 'AR', name: 'Analyst S. Rao', roleText: 'Intelligence Analyst', station: 'State Command HQ' };

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
    <nav className="h-[72px] bg-[#E00000] rounded-[20px] flex items-center justify-between px-5 shrink-0 shadow-md border border-[#C90000] w-full mb-3 text-white">
      {/* Left Section: Branding */}
      <div className="flex items-center gap-3 pr-4 border-r border-white/20 shrink-0 h-[42px]">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-xs shrink-0">
          <img src={kspLogo} alt="Karnataka Police Logo" className="h-full w-auto object-contain" />
        </div>
        <div className="hidden xl:block">
          <h2 className="text-white font-extrabold tracking-tight text-xs lg:text-sm flex items-center gap-1.5 leading-none">
            KARNATAKA POLICE
            <span className="text-[9px] bg-[#D49A00] text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">KSP</span>
          </h2>
          <p className="text-[10px] text-[#F5E7C1] font-medium tracking-wide mt-0.5">{platformSubtitle}</p>
        </div>
      </div>

      {/* Center Section: Navigation Links */}
      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center justify-start lg:justify-center px-2 sm:px-3 gap-1 sm:gap-1.5 h-full">
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`relative h-full flex items-center justify-center text-[12px] xl:text-[13px] transition-colors duration-200 whitespace-nowrap cursor-pointer px-2 xl:px-2.5 ${isActive ? 'font-bold text-white' : 'font-semibold text-white/80 hover:text-white'
                }`}
            >
              <div className="relative h-full flex items-center">
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="topNavActiveUnderline"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#D49A00]"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Section: Relocated Officer Profile Card */}
      <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-white/20 shrink-0 ml-auto h-[42px]">
        <div className="hidden sm:flex items-center gap-2.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full shadow-xs text-white">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-[#D49A00] text-[#142B45] font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
              ) : (
                profileInitials
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#E00000]" />
          </div>
          <div className="text-left min-w-0 pr-1">
            <p className="text-xs font-bold leading-tight text-white truncate">{profileName}</p>
            <p className="text-[10px] text-[#F5E7C1] font-medium truncate">{profileRank} • {profileStation}</p>
          </div>
        </div>

        {/* Notifications */}
        <motion.button
          onClick={togglePanel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-[38px] h-[38px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20 cursor-pointer"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <motion.div
            key={unreadCount}
            initial={{ rotate: 0 }}
            animate={unreadCount > 0 ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Bell className="w-4 h-4 text-white" />
          </motion.div>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-[#D49A00] border-2 border-[#E00000] rounded-full text-[9px] font-black text-[#142B45]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </nav>
  );
}
