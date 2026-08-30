import React from 'react';
import { Shield, Plus, MoreHorizontal, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../../../i18n';

export default function RoleManagement() {
  const { t } = useTranslation();

  const roles = [
    { id: 1, name: t('auth.roleAdmin', 'Super Admin'), users: 3, permissions: ['All Modules', 'User Management', 'Audit Logs'], color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    { id: 2, name: t('auth.roleAnalyst', 'Intelligence Analyst'), users: 14, permissions: ['Analytics', 'Crime Map', 'Reports', 'Network Analysis'], color: 'text-primary bg-primary/10 border-primary/20' },
    { id: 3, name: t('auth.roleFieldOfficer', 'Field Officer'), users: 47, permissions: ['Crime Map', 'District Intel', 'Reports (Read)'], color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: 4, name: 'Read-Only Inspector', users: 8, permissions: ['Dashboard (Read)', 'Reports (Read)'], color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  ];

  const allModules = ['Dashboard', 'Crime Map', 'District Intel', 'Network Analysis', 'Analytics Suite', 'Reports', 'Settings', 'Audit Logs', 'User Management'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-white">{t('admin.roleManagement', 'Role-Based Access Control (RBAC)')}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{t('admin.overviewSubtitle', 'Manage roles and module permissions for all users.')}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> {t('admin.createRole', 'New Role')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map(role => (
          <div key={role.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${role.color}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{role.name}</h4>
                  <p className="text-xs text-slate-500">{role.users} {t('admin.activeUsers', 'users assigned')}</p>
                </div>
              </div>
              <button className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('admin.rolePermissions', 'Module Access')}</p>
              <div className="flex flex-wrap gap-2">
                {allModules.map(mod => {
                  const hasAccess = role.permissions.some(p => p.includes(mod.split(' ')[0]) || p === 'All Modules');
                  return (
                    <span key={mod} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                      hasAccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800/50 text-slate-600 border-slate-700/50'
                    }`}>
                      {hasAccess && <CheckCircle className="w-2.5 h-2.5" />}
                      {mod}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
              <button className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors">Edit Permissions</button>
              <button className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors">View Users</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
