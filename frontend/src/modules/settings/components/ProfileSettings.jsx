import React, { useState } from 'react';
import { User, Camera, Save, Badge } from 'lucide-react';

export default function ProfileSettings() {
  const [form, setForm] = useState({
    name: 'John Doe',
    badge: 'KSP-2019-4821',
    rank: 'Inspector',
    email: 'j.doe@ksp.gov.in',
    phone: '+91 98450 00000',
    district: 'Bengaluru City',
    department: 'Intelligence & Analytics',
  });

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-5">Personal Identity</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-2xl font-bold text-white">
              JD
            </div>
            <button className="absolute inset-0 w-20 h-20 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">{form.name}</h4>
            <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
              <Badge className="w-4 h-4" /> {form.badge} • {form.rank}
            </p>
            <button className="mt-3 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 transition-colors">
              Upload Photo
            </button>
          </div>
        </div>
      </div>

      {/* Details Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-5">Profile Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: 'Full Name', key: 'name' },
            { label: 'Badge Number', key: 'badge' },
            { label: 'Rank / Designation', key: 'rank' },
            { label: 'Official Email', key: 'email' },
            { label: 'Contact Number', key: 'phone' },
            { label: 'Assigned District', key: 'district' },
            { label: 'Department', key: 'department' },
          ].map(field => (
            <div key={field.key} className={field.key === 'department' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{field.label}</label>
              <input
                type="text"
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-slate-800">
          <button className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
