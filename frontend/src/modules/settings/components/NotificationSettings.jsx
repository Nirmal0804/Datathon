import React, { useState } from 'react';
import { Bell, Mail, Smartphone } from 'lucide-react';

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative inline-flex w-10 h-5 rounded-full transition-colors shrink-0 ${value ? 'bg-primary' : 'bg-slate-700'}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    anomaly_email: true, anomaly_sms: false, anomaly_push: true,
    hotspot_email: true, hotspot_sms: true, hotspot_push: false,
    report_email: true, report_sms: false, report_push: false,
    system_email: false, system_sms: false, system_push: true,
  });

  const toggle = key => setSettings(p => ({ ...p, [key]: !p[key] }));

  const categories = [
    { key: 'anomaly', label: 'Anomaly Alerts', desc: 'Statistical spikes or ML-detected outliers.' },
    { key: 'hotspot', label: 'Hotspot Updates', desc: 'Emerging or shifting crime hotspot zones.' },
    { key: 'report', label: 'Report Ready', desc: 'Notify when a generated report is available.' },
    { key: 'system', label: 'System Notices', desc: 'Platform updates, model retraining events.' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800">
        <h3 className="text-base font-semibold text-white">Notification Preferences</h3>
        <p className="text-sm text-slate-400 mt-0.5">Choose how and when you want to be notified.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/2">Alert Category</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1"><Smartphone className="w-3.5 h-3.5" /> SMS</div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1"><Bell className="w-3.5 h-3.5" /> In-App</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {categories.map(cat => (
              <tr key={cat.key} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{cat.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                </td>
                <td className="px-4 py-4 text-center"><Toggle value={settings[`${cat.key}_email`]} onChange={() => toggle(`${cat.key}_email`)} /></td>
                <td className="px-4 py-4 text-center"><Toggle value={settings[`${cat.key}_sms`]} onChange={() => toggle(`${cat.key}_sms`)} /></td>
                <td className="px-4 py-4 text-center"><Toggle value={settings[`${cat.key}_push`]} onChange={() => toggle(`${cat.key}_push`)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t border-slate-800 flex justify-end">
        <button className="px-5 py-2 bg-primary hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
