import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Map, Network, FileText, Settings, LogOut, 
  Shield, Activity, BookOpen, BarChart2, Bell, ShieldAlert, Briefcase,
  Users, Database
} from 'lucide-react';

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
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen fixed left-0 top-0 hidden md:flex z-20">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-white font-bold tracking-widest text-xs uppercase leading-tight">Karnataka Police</h2>
          <p className="text-2xs text-text-muted uppercase tracking-widest font-mono mt-0.5">Intelligence Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 no-scrollbar" aria-label="Main navigation">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="text-2xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = activeModule === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    whileTap={{ scale: 0.97 }}
                    className={isActive ? 'nav-item-active' : 'nav-item-inactive'}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-surface-2/50">
          <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
            {profile.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{profile.name}</p>
            <p className="text-2xs text-text-muted truncate">{profile.roleText}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-success glow-success shrink-0" title="Online" />
        </div>

        <motion.button
          onClick={onLogout}
          whileTap={{ scale: 0.97 }}
          className="nav-item-inactive w-full text-danger/80 hover:text-danger hover:bg-danger/10"
          aria-label="Secure logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Secure Logout
        </motion.button>
      </div>
    </aside>
  );
}
