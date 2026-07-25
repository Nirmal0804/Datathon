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
    ? { initials: 'SA', name: 'Super Admin S. Kumar', roleText: 'System Administrator', station: 'State Tech HQ' }
    : { initials: 'JD', name: 'Inspector Patil', roleText: 'Intelligence Analyst', station: 'State Command HQ' };

  return (
    <aside className="w-[270px] flex flex-col h-full bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm overflow-hidden text-[#0F172A]">
      
      {/* Top Header & Branding Section */}
      <div className="p-5 border-b border-[#E7ECF3]">
        <div className="flex items-center gap-3">
          <img src={kspLogo} alt="Karnataka Police Logo" className="h-10 w-auto object-contain shrink-0 drop-shadow-xs" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[#0B1F4D] font-extrabold tracking-tight text-xs uppercase leading-tight truncate">Karnataka Police</h2>
            <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mt-0.5 truncate">Crime Analytics Platform</p>
          </div>
        </div>
        
        {/* Role Badge Chip */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#0B1F4D]/5 text-[#0B1F4D] border border-[#0B1F4D]/10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#C79A2B]" />
          <span>{profile.roleText}</span>
        </div>
      </div>

      {/* Main Vertical Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-5 no-scrollbar" aria-label="Main navigation">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-3 mb-2">
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
                    className={`w-full h-11 flex items-center gap-3 px-3.5 rounded-[14px] text-xs font-bold transition-all duration-200 ease-in-out relative cursor-pointer ${
                      isActive 
                        ? 'bg-[#0B1F4D] text-white shadow-xs' 
                        : 'bg-transparent text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C79A2B] rounded-r-full" />
                    )}
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B]'}`} aria-hidden="true" />
                    <span className="truncate">{item.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Card */}
      <div className="p-3.5 border-t border-[#E7ECF3] bg-[#F8F9FB]/50">
        <div className="p-3.5 bg-white border border-[#E7ECF3] rounded-[18px] shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0B1F4D] flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-xs">
              {profile.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">{profile.name}</p>
              <p className="text-[10px] font-semibold text-[#64748B] truncate">{profile.station}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[#F1F5F9]">
            <button
              onClick={() => setActiveModule('settings')}
              className="flex-1 h-8 rounded-[10px] bg-[#F8F9FB] hover:bg-slate-100 text-[#0F172A] font-bold text-[11px] border border-[#E7ECF3] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Settings</span>
            </button>
            <button
              onClick={onLogout}
              className="h-8 px-3 rounded-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] border border-rose-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

