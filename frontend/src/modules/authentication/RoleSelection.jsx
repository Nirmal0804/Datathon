import React, { useState } from 'react';
import { Shield, User, ShieldAlert, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  { id: 'officer', name: 'Field Officer', icon: User, desc: 'Access station-level reports and active cases.' },
  { id: 'analyst', name: 'Intelligence Analyst', icon: Shield, desc: 'Access predictive models and network graphs.' },
  { id: 'admin', name: 'System Administrator', icon: ShieldAlert, desc: 'Manage users, roles, and system configurations.' }
];

export default function RoleSelection({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Select Access Level</h1>
          <p className="text-slate-400 text-sm mt-2">Identify your operational role to proceed securely.</p>
        </div>

        <div className="grid gap-4 mb-8">
          {roles.map((role) => (
            <div 
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                selected === role.id 
                  ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(180,83,9,0.2)]' 
                  : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${selected === role.id ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'}`}>
                  <role.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-semibold ${selected === role.id ? 'text-white' : 'text-slate-200'}`}>{role.name}</h3>
                  <p className="text-sm text-slate-400">{role.desc}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${selected === role.id ? 'text-primary' : 'text-slate-600 group-hover:text-slate-400'}`} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => onSelect(selected)}
          disabled={!selected}
          className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all flex justify-center items-center gap-2"
        >
          Continue to Login
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
