import React, { useState } from 'react';
import { Settings, Save, Lock, Sliders, Database, ShieldAlert } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export default function AdminConfiguration() {
  const { addToast } = useToast();

  const [config, setConfig] = useState({
    timeout: 30, // mins
    rateLimit: 100, // req/min
    enforceMfa: true,
    maintenanceMode: false,
    backupCron: '0 0 * * *', // Daily
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      title: 'Configuration Saved',
      message: 'System parameters have been committed and synced across precinct hubs.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">System Configuration</h2>
          <p className="text-2xs text-slate-400 mt-0.5 font-sans font-medium">Fine-tune system constants, API throttling indices, and automatic database schedules.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              Security Access Control
            </h3>
            
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-850">
              <div>
                <label className="text-xs font-semibold text-slate-200 block" htmlFor="enforceMfa">Enforce MFA Authentication</label>
                <span className="text-4xs text-slate-500">Require multi-factor validation for officers.</span>
              </div>
              <input 
                id="enforceMfa"
                type="checkbox" 
                className="w-4 h-4 accent-primary cursor-pointer"
                checked={config.enforceMfa}
                onChange={(e) => setConfig(prev => ({ ...prev, enforceMfa: e.target.checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-850">
              <div>
                <label className="text-xs font-semibold text-slate-200 block" htmlFor="maintenanceMode">Active Maintenance Mode</label>
                <span className="text-4xs text-slate-500">Locks non-administrative terminal access.</span>
              </div>
              <input 
                id="maintenanceMode"
                type="checkbox" 
                className="w-4 h-4 accent-amber-500 cursor-pointer"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
              />
            </div>
          </div>

          {/* Platform Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Platform Throttling & Sessioning
            </h3>

            <div>
              <label className="label text-3xs" htmlFor="sessionTimeout">Automatic Session Timeout (Minutes)</label>
              <select 
                id="sessionTimeout"
                value={config.timeout}
                onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                className="select text-xs h-9"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={120}>120 Minutes</option>
              </select>
            </div>

            <div>
              <label className="label text-3xs" htmlFor="rateLimit">API Throttling Limits (Requests / Min)</label>
              <input 
                id="rateLimit"
                type="number"
                value={config.rateLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                className="input text-xs h-9"
                min="10"
                max="1000"
              />
            </div>
          </div>
        </div>

        {/* Database backup parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Automatic Database Backups
          </h3>
          <div>
            <label className="label text-3xs" htmlFor="backupCron">Backup Synchronization Schedule (Cron syntax)</label>
            <input 
              id="backupCron"
              type="text"
              value={config.backupCron}
              onChange={(e) => setConfig(prev => ({ ...prev, backupCron: e.target.value }))}
              className="input text-xs h-9 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary btn-sm px-6 gap-2">
            <Save className="w-4 h-4" />
            <span>Save Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
}
