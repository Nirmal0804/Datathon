import React, { useState } from 'react';
import { Monitor, Globe, Clock, Palette } from 'lucide-react';

export default function Preferences() {
  const [prefs, setPrefs] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    density: 'comfortable',
    defaultModule: 'overview',
    sessionTimeout: '30',
  });

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const sections = [
    {
      icon: Palette, title: 'Appearance',
      fields: [
        { label: 'Color Theme', key: 'theme', type: 'select', options: ['dark', 'light', 'high-contrast'] },
        { label: 'UI Density', key: 'density', type: 'select', options: ['compact', 'comfortable', 'spacious'] },
      ],
    },
    {
      icon: Globe, title: 'Locale & Time',
      fields: [
        { label: 'Language', key: 'language', type: 'select', options: ['en', 'kn', 'hi'] },
        { label: 'Timezone', key: 'timezone', type: 'select', options: ['Asia/Kolkata', 'UTC'] },
        { label: 'Date Format', key: 'dateFormat', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
      ],
    },
    {
      icon: Monitor, title: 'Dashboard',
      fields: [
        { label: 'Default Module on Login', key: 'defaultModule', type: 'select', options: ['overview', 'map', 'district', 'analytics'] },
      ],
    },
    {
      icon: Clock, title: 'Security',
      fields: [
        { label: 'Session Timeout (minutes)', key: 'sessionTimeout', type: 'select', options: ['15', '30', '60', '120'] },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {sections.map(section => (
        <div key={section.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <section.icon className="w-4 h-4 text-primary" /> {section.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{field.label}</label>
                <select
                  value={prefs[field.key]}
                  onChange={e => set(field.key, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                >
                  {field.options.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <button className="px-5 py-2 bg-primary hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
