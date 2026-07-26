import React, { useState } from 'react';
import { Shield, Check, X, ShieldAlert } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export default function AdminRoles() {
  const { addToast } = useToast();

  const initialPermissions = {
    admin: {
      gisMap: { read: true, write: true, delete: true },
      firLog: { read: true, write: true, delete: true },
      networkGraph: { read: true, write: true, delete: true },
      reportsExport: { read: true, write: true, delete: true },
      backups: { read: true, write: true, delete: true },
    },
    analyst: {
      gisMap: { read: true, write: true, delete: false },
      firLog: { read: true, write: false, delete: false },
      networkGraph: { read: true, write: true, delete: false },
      reportsExport: { read: true, write: true, delete: false },
      backups: { read: false, write: false, delete: false },
    },
    officer: {
      gisMap: { read: true, write: false, delete: false },
      firLog: { read: true, write: true, delete: false },
      networkGraph: { read: false, write: false, delete: false },
      reportsExport: { read: true, write: false, delete: false },
      backups: { read: false, write: false, delete: false },
    }
  };

  const [perms, setPerms] = useState(initialPermissions);

  const featureLabels = {
    gisMap: 'GIS Mapping Overlays',
    firLog: 'Incident Logging (FIR)',
    networkGraph: 'Network Graph Database',
    reportsExport: 'Reports PDF/CSV Generation',
    backups: 'Platform Database Backups'
  };

  const roleLabels = {
    admin: 'System Administrator',
    analyst: 'Intelligence Analyst',
    officer: 'Field Patrol Officer'
  };

  const togglePerm = (role, feature, action) => {
    // Admin permissions cannot be turned off (safety check)
    if (role === 'admin' && feature === 'backups' && action === 'delete') {
      addToast({ title: 'Safety Restrict', message: 'Root backup privileges cannot be disabled.', type: 'danger' });
      return;
    }

    setPerms(prev => {
      const nextRolePerms = { ...prev[role] };
      const nextFeaturePerms = { ...nextRolePerms[feature] };
      nextFeaturePerms[action] = !nextFeaturePerms[action];
      nextRolePerms[feature] = nextFeaturePerms;
      
      addToast({
        title: 'Permissions Saved',
        message: `Updated privileges for ${roleLabels[role]}.`,
        type: 'success'
      });

      return {
        ...prev,
        [role]: nextRolePerms
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Privileges & Role Management</h2>
          <p className="text-2xs text-slate-400 mt-0.5">Configure access-control lists (ACL) for system operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(roleLabels).map(([roleKey, roleName]) => (
          <div key={roleKey} className="card p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                {roleName} Roster Permissions
              </h3>
              <span className="text-4xs font-mono font-bold text-slate-500 uppercase">
                {roleKey} Group ACL
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left" aria-label={`${roleName} ACL table`}>
                <thead>
                  <tr className="border-b border-slate-800/80 text-3xs font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">System Resource</th>
                    <th className="py-2.5 px-3 text-center">Read / View</th>
                    <th className="py-2.5 px-3 text-center">Write / Modify</th>
                    <th className="py-2.5 px-3 text-center">Delete / Purge</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(featureLabels).map(([featKey, featLabel]) => {
                    const activeFeat = perms[roleKey][featKey];
                    return (
                      <tr key={featKey} className="border-b border-slate-850 text-xs text-slate-350">
                        <td className="py-3 px-3 font-medium text-slate-200">{featLabel}</td>
                        {['read', 'write', 'delete'].map(action => (
                          <td key={action} className="py-3 px-3 text-center">
                            <button
                              onClick={() => togglePerm(roleKey, featKey, action)}
                              className={`p-1.5 rounded border transition-colors inline-flex items-center justify-center ${
                                activeFeat[action]
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                                  : 'bg-slate-950/40 text-slate-600 border-slate-850 hover:bg-slate-800'
                              }`}
                            >
                              {activeFeat[action] ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
