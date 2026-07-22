import React, { useState } from 'react';
import ProfileSettings from './components/ProfileSettings';
import RoleManagement from './components/RoleManagement';
import NotificationSettings from './components/NotificationSettings';
import Preferences from './components/Preferences';
import AuditLogs from './components/AuditLogs';
import { User, Shield, Bell, SlidersHorizontal, ScrollText } from 'lucide-react';

const tabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'roles', name: 'Role Management', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'preferences', name: 'Preferences', icon: SlidersHorizontal },
  { id: 'audit', name: 'Audit Logs', icon: ScrollText },
];

export default function SettingsLayout() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTab = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'roles': return <RoleManagement />;
      case 'notifications': return <NotificationSettings />;
      case 'preferences': return <Preferences />;
      case 'audit': return <AuditLogs />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your profile, access control, and system preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Sidebar Nav */}
        <nav className="lg:w-56 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full text-left ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
