import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Map, Network, FileText, Settings, LogOut, 
  Shield, Activity, BookOpen, BarChart2, Bell, ShieldAlert, Briefcase,
  Users, Database
} from 'lucide-react';
import kspLogo from '../../../assets/ksp-logo-official.png';

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
      { id: 'hotspots',  name: 'Crime Hotspot Detection', icon: ShieldAlert },
      { id: 'correlation', name: 'Socio-economic Crime Correlation', icon: Database },
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
      { id: 'hotspots',       name: 'Crime Hotspot Detection', icon: ShieldAlert     },
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

export default function Sidebar({ onLogout, activeModule, setActiveModule, role }) {
  const navSections = role === 'officer' 
    ? OFFICER_NAV_SECTIONS 
    : role === 'admin'
    ? ADMIN_NAV_SECTIONS
    : ANALYST_NAV_SECTIONS;

  const profile = role === 'officer' 
    ? { initials: 'PP', name: 'Inspector Patil', roleText: 'Field Officer', station: 'Cubbon Park PS' }
    : role === 'admin'
    ? { initials: 'SA', name: 'Admin Gowda', roleText: 'System Administrator', station: 'State Tech HQ' }
    : { initials: 'JD', name: 'John Doe', roleText: 'Intelligence Analyst', station: 'State Command' };

  return (
    <aside className="w-[260px] flex flex-col h-full bg-[#0B1F4D] rounded-[24px] overflow-hidden">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <img src={kspLogo} alt="Karnataka Police Logo" className="h-10 w-auto object-contain shrink-0 drop-shadow-sm" />
        <div>
          <h2 className="text-white font-extrabold tracking-wide text-[13px] uppercase leading-tight">Karnataka Police</h2>
          <p className="text-[10px] text-white/60 uppercase tracking-widest font-semibold mt-1">Intelligence Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 no-scrollbar" aria-label="Main navigation">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(item => {
                const isActive = activeModule === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full h-12 flex items-center gap-3 px-3 rounded-[16px] text-[13px] font-semibold transition-all duration-200 ease-in-out ${
                      isActive 
                        ? 'bg-white text-[#C79A2B]' 
                        : 'bg-transparent text-white hover:bg-white/10'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#C79A2B]' : 'text-white'}`} aria-hidden="true" />
                    <span>{item.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Vertical Action Panel */}
      <div className="p-3.5 border-t border-white/10 space-y-2">
        <motion.button
          onClick={() => setActiveModule('settings')}
          whileTap={{ scale: 0.98 }}
          className="w-full h-10 px-3.5 rounded-[14px] text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-2.5 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#C79A2B] shrink-0" />
          <span>Settings</span>
        </motion.button>

        <motion.button
          onClick={onLogout}
          whileTap={{ scale: 0.98 }}
          className="w-full h-10 px-3.5 rounded-[14px] text-xs font-bold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 transition-all flex items-center gap-2.5 cursor-pointer"
          aria-label="Secure logout"
        >
          <LogOut className="w-4 h-4 text-rose-300 shrink-0" />
          <span>Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}

