import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Map, Network, FileText, Settings, LogOut, 
  Shield, Activity, BookOpen, BarChart2, Bell, ShieldAlert, Briefcase,
  Users, Database, X
} from 'lucide-react';
import kspLogo from '../../../assets/ksp-official-logo.webp';
import LazyImage from '../../../components/ui/LazyImage';
import { useTranslation } from '../../../i18n';

const ANALYST_NAV_SECTIONS = [
  {
    label: 'Command',
    items: [
      { id: 'overview',  name: 'Overview',          icon: LayoutDashboard },
      { id: 'map',       name: 'Crime Map',          icon: Map             },
      { id: 'district',  name: 'District Intel',     icon: BarChart2       },
      { id: 'network',   name: 'Network Analysis',   icon: Network         },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'analytics', name: 'Analytics Suite',   icon: Activity  },
      { id: 'reports',   name: 'Reports',            icon: BookOpen  },
      { id: 'hotspots',  name: 'Crime Hotspots',     icon: ShieldAlert },
      { id: 'correlation', name: 'Socio-economic',   icon: Database },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings',  name: 'Settings',           icon: Settings  },
    ],
  },
];

const ADMIN_NAV_SECTIONS = [
  {
    label: 'Administration',
    items: [
      { id: 'overview',      name: 'Overview',           icon: LayoutDashboard },
      { id: 'users',         name: 'Users Control',      icon: Users           },
      { id: 'roles',         name: 'Roles & Privileges', icon: Shield          },
      { id: 'audit_logs',    name: 'System Audit Logs',  icon: FileText        },
    ],
  },
  {
    label: 'Diagnostics',
    items: [
      { id: 'system_health', name: 'System Health',      icon: Activity        },
      { id: 'config',        name: 'Configuration',      icon: Settings        },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings',      name: 'Settings',           icon: Settings        },
    ],
  },
];

const OFFICER_NAV_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { id: 'overview',       name: 'Overview',          icon: LayoutDashboard },
      { id: 'assigned_cases', name: 'Assigned Cases',    icon: Briefcase       },
      { id: 'fir_management', name: 'FIR Management',    icon: FileText        },
      { id: 'map',            name: 'Crime Map',          icon: Map             },
      { id: 'hotspots',       name: 'Crime Hotspots',     icon: ShieldAlert     },
    ],
  },
  {
    label: 'Notifications',
    items: [
      { id: 'alerts',         name: 'Alerts Feed',       icon: Bell            },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings',       name: 'Settings',          icon: Settings        },
    ],
  },
];

export default function Sidebar({ onLogout, activeModule, setActiveModule, role, onClose }) {
  const { t } = useTranslation();
  const navSections = role === 'officer' 
    ? OFFICER_NAV_SECTIONS 
    : role === 'admin'
    ? ADMIN_NAV_SECTIONS
    : ANALYST_NAV_SECTIONS;

  const platformSubtitle = role === 'officer'
    ? 'FIELD OPERATIONS'
    : role === 'admin'
    ? 'SYSTEM ADMINISTRATION'
    : 'INTELLIGENCE PLATFORM';

  const defaultProfile = role === 'officer'
    ? { initials: 'RK', name: 'Rakesh Kumar', roleText: 'Inspector', station: 'Mysuru Rural Police' }
    : role === 'admin'
    ? { initials: 'SA', name: 'Admin S. Kumar', roleText: 'System Administrator', station: 'State Tech HQ' }
    : { initials: 'JD', name: 'John Doe', roleText: 'Intelligence Analyst', station: 'State Command HQ' };

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
    <aside className="w-[280px] max-w-[85vw] flex flex-col h-full bg-[#0B1F4D] text-white rounded-r-[24px] md:rounded-[24px] overflow-hidden shadow-2xl border-r border-[#0A192F]">
      {/* Header / Logo */}
      <div className="p-5 flex items-center justify-between gap-3 border-b border-white/10 shrink-0 bg-[#0A192F]/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-sm shrink-0 overflow-hidden">
            <LazyImage src={kspLogo} alt="Karnataka Police Logo" className="h-full w-auto object-contain" containerClassName="w-full h-full" loading="eager" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-extrabold tracking-tight text-[13px] sm:text-sm flex items-center gap-1.5 leading-none">
              KARNATAKA POLICE
              <span className="text-[9.5px] bg-[#C79A2B] text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">KSP</span>
            </h2>
            <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wider mt-0.5 truncate">
              {platformSubtitle}
            </p>
          </div>
        </div>

        {/* Close Drawer Button on Mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-5 no-scrollbar" aria-label="Main navigation">
        {navSections.map(section => {
          const sectionLabelMap = {
            'Command': t('nav.sectionCommand', 'Command'),
            'Intelligence': t('nav.sectionIntelligence', 'Intelligence'),
            'System': t('nav.sectionSystem', 'System'),
            'Operations': t('nav.sectionOperations', 'Operations'),
            'Notifications': t('nav.sectionNotifications', 'Notifications'),
            'Diagnostics': t('nav.sectionDiagnostics', 'Diagnostics'),
            'Administration': t('nav.sectionAdministration', 'Administration'),
          };
          const translatedSectionLabel = sectionLabelMap[section.label] || section.label;
          return (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest px-3 mb-2">
              {translatedSectionLabel}
            </p>
            <div className="space-y-1">
              {section.items.map(item => {
                const isActive = activeModule === item.id;
                const labelMap = {
                  overview: t('nav.overview', item.name),
                  map: t('nav.crimeMap', item.name),
                  district: t('nav.district', item.name),
                  network: t('nav.network', item.name),
                  analytics: t('nav.analytics', item.name),
                  reports: t('nav.reports', item.name),
                  hotspots: t('nav.hotspots', item.name),
                  correlation: t('nav.correlation', item.name),
                  assigned_cases: t('nav.assignedCases', item.name),
                  fir_management: t('nav.firManagement', item.name),
                  alerts: t('nav.alerts', item.name),
                  users: t('nav.users', item.name),
                  roles: t('nav.roles', item.name),
                  audit_logs: t('nav.auditLogs', item.name),
                  system_health: t('nav.systemHealth', item.name),
                  config: t('nav.config', item.name),
                  settings: t('nav.settings', item.name),
                };
                const translatedName = labelMap[item.id] || item.name;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id);
                      if (onClose) onClose();
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full h-11 flex items-center gap-3 px-3.5 rounded-[14px] text-[13px] font-bold transition-all duration-200 ease-in-out cursor-pointer ${
                      isActive 
                        ? 'bg-white text-[#0B1F4D] shadow-md' 
                        : 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#0B1F4D]' : 'text-white'}`} aria-hidden="true" />
                    <span className="truncate">{translatedName}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#C79A2B] shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      {/* Bottom User & Action Panel */}
      <div className="p-3.5 border-t border-white/10 space-y-2.5 bg-[#0A192F]/40 shrink-0">
        {/* User Card */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-2 rounded-[14px] text-white">
          <div className="w-8 h-8 rounded-full bg-[#C79A2B] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            {avatarUrl ? (
              <LazyImage src={avatarUrl} alt={profileName} className="w-full h-full object-cover" containerClassName="w-full h-full" />
            ) : (
              profileInitials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">{profileName}</p>
            <p className="text-[10px] font-medium text-white/60 truncate">{profileRank} • {profileStation}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => {
              setActiveModule('settings');
              if (onClose) onClose();
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-9 px-3 rounded-[12px] text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-[#C79A2B] shrink-0" />
            <span>{t('nav.settings', 'Settings')}</span>
          </motion.button>

          <motion.button
            onClick={onLogout}
            whileTap={{ scale: 0.98 }}
            className="w-full h-9 px-3 rounded-[12px] text-xs font-bold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            aria-label="Secure logout"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300 shrink-0" />
            <span>{t('nav.logout', 'Logout')}</span>
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
