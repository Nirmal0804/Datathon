import React, { useState, useEffect } from 'react';
import { Shield, User, Settings, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import kspLogo from '../../assets/ksp-official-logo.png';

const roles = [
  { id: 'officer', name: 'Field Officer', icon: User },
  { id: 'analyst', name: 'Intelligence Analyst', icon: Shield },
  { id: 'admin', name: 'System Administrator', icon: Settings }
];

const ROLE_CREDENTIALS = {
  officer: { email: 'officer.ksp@karnataka.gov.in', password: 'Officer@Pass2026' },
  analyst: { email: 'analyst.ksp@karnataka.gov.in', password: 'Analyst@Pass2026' },
  admin:   { email: 'admin.ksp@karnataka.gov.in',   password: 'Admin@Pass2026'   }
};

export default function Login({ role, onRoleSelect, onBack, onForgot, onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role || null);
  
  const initialCreds = ROLE_CREDENTIALS[role] || (role === null ? { email: '', password: '' } : ROLE_CREDENTIALS.analyst);
  const [email, setEmail] = useState(initialCreds.email);
  const [password, setPassword] = useState(initialCreds.password);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (role) {
      setSelectedRole(role);
      const creds = ROLE_CREDENTIALS[role];
      if (creds) {
        setEmail(creds.email);
        setPassword(creds.password);
      }
    }
  }, [role]);

  const handleRoleClick = (roleId) => {
    setSelectedRole(roleId);
    const creds = ROLE_CREDENTIALS[roleId] || ROLE_CREDENTIALS.analyst;
    setEmail(creds.email);
    setPassword(creds.password);
    if (onRoleSelect) {
      onRoleSelect(roleId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  const hexagonStyle = {
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col relative overflow-hidden font-sans text-[#0F172A] selection:bg-[#E00000]/10 selection:text-[#E00000]">
      
      {/* 1. TOP NAVBAR: Karnataka Police Red */}
      <header className="w-full bg-[#E00000] text-white px-4 sm:px-8 py-3.5 border-b border-[#C90000] shadow-sm relative z-30 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-xs shrink-0">
            <img 
              src={kspLogo} 
              alt="Karnataka State Police Emblem" 
              className="h-full w-auto object-contain" 
            />
          </div>
          <div>
            <span className="text-white font-extrabold tracking-tight text-base sm:text-lg flex items-center gap-1.5 leading-none">
              KARNATAKA POLICE
              <span className="text-[10px] bg-[#D49A00] text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">KSP</span>
            </span>
            <p className="text-xs text-[#F5E7C1] font-medium tracking-wide mt-0.5">
              Crime Analytics Platform
            </p>
          </div>
        </div>

        {/* Right Navigation */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#F5E7C1] transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        )}
      </header>

      {/* 2. MAIN WORKSPACE WITH FLOATING IMAGE PLACEHOLDERS */}
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 md:p-8 relative min-h-[calc(100vh-64px)]">
        
        {/* FLOATING PHOTOGRAPHIC FRAME PLACEHOLDERS (Asymmetric, organic photo-frame composition around login portal) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          
          {/* TOP LEFT: Small Circular Photo Frame (-rotate-6) */}
          <div className="hidden md:block absolute top-10 left-8 lg:left-20 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.07)] border border-slate-200/70 -rotate-6 transition-transform duration-500">
            <div className="w-full h-full rounded-full bg-[#E2E8F0] border border-slate-300/40" />
          </div>

          {/* UPPER LEFT: Medium Hexagonal Photo Frame (rotate-3) */}
          <div 
            style={hexagonStyle}
            className="hidden md:block absolute top-28 left-3 lg:left-10 w-32 h-32 bg-white p-2 shadow-[0_18px_38px_rgba(0,0,0,0.08)] border border-slate-200/70 rotate-3 transition-transform duration-500"
          >
            <div style={hexagonStyle} className="w-full h-full bg-[#E2E8F0] border border-slate-300/40" />
          </div>

          {/* MID LEFT: Small Circular Photo Frame (-rotate-3) */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-6 lg:left-24 w-22 h-22 rounded-full bg-white p-2 shadow-[0_12px_28px_rgba(0,0,0,0.06)] border border-slate-200/70 -rotate-3 transition-transform duration-500">
            <div className="w-full h-full rounded-full bg-[#E2E8F0] border border-slate-300/40" />
          </div>

          {/* LOWER LEFT: Large Rounded Rectangular Photo Frame (rotate-4) */}
          <div className="hidden md:block absolute bottom-16 left-4 lg:left-14 w-44 h-44 rounded-[28px] bg-white p-3 shadow-[0_22px_48px_rgba(0,0,0,0.09)] border border-slate-200/80 rotate-4 transition-transform duration-500">
            <div className="w-full h-full rounded-[20px] bg-[#E2E8F0] border border-slate-300/40" />
          </div>

          {/* BOTTOM LEFT: Small Accent Photo Frame (-rotate-2) */}
          <div className="hidden xl:block absolute bottom-6 left-36 lg:left-48 w-14 h-14 rounded-2xl bg-white p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.05)] border border-slate-200/70 -rotate-2">
            <div className="w-full h-full rounded-xl bg-[#CBD5E1]/60" />
          </div>

          {/* TOP RIGHT: Large Circular Photo Frame (rotate-3) */}
          <div className="hidden md:block absolute top-10 right-8 lg:right-20 w-44 h-44 rounded-full bg-white p-3 shadow-[0_22px_48px_rgba(0,0,0,0.09)] border border-slate-200/80 rotate-3 transition-transform duration-500">
            <div className="w-full h-full rounded-full bg-[#E2E8F0] border border-slate-300/40" />
          </div>

          {/* UPPER RIGHT: Small Hexagonal Photo Frame (-rotate-4) */}
          <div 
            style={hexagonStyle}
            className="hidden md:block absolute top-48 right-3 lg:right-8 w-24 h-24 bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.07)] border border-slate-200/70 -rotate-4 transition-transform duration-500"
          >
            <div style={hexagonStyle} className="w-full h-full bg-[#E2E8F0] border border-slate-300/40" />
          </div>

          {/* MID RIGHT: Medium Rounded-Rectangle Photo Frame (rotate-2) */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-6 lg:right-24 w-36 h-36 rounded-[26px] bg-white p-2.5 shadow-[0_16px_38px_rgba(0,0,0,0.08)] border border-slate-200/80 rotate-2 transition-transform duration-500">
            <div className="w-full h-full rounded-[18px] bg-[#E2E8F0] border border-slate-300/40" />
          </div>

          {/* LOWER RIGHT: Small Circular Photo Frame (-rotate-5) */}
          <div className="hidden md:block absolute bottom-28 right-8 lg:right-16 w-22 h-22 rounded-full bg-white p-2 shadow-[0_12px_28px_rgba(0,0,0,0.06)] border border-slate-200/70 -rotate-5">
            <div className="w-full h-full rounded-full bg-[#E2E8F0] border border-slate-300/40" />
          </div>

          {/* BOTTOM RIGHT: Medium Hexagonal Photo Frame (rotate-4) */}
          <div 
            style={hexagonStyle}
            className="hidden md:block absolute bottom-8 right-24 lg:right-36 w-32 h-32 bg-white p-2 shadow-[0_16px_36px_rgba(0,0,0,0.08)] border border-slate-200/70 rotate-4 transition-transform duration-500"
          >
            <div style={hexagonStyle} className="w-full h-full bg-[#E2E8F0] border border-slate-300/40" />
          </div>

        </div>

        {/* 3. CENTER LOGIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-3xl p-7 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-200/80 w-full max-w-[460px] relative z-20 my-auto"
        >
          {/* Card Official Logo */}
          <img 
            src={kspLogo} 
            alt="Karnataka State Police Emblem" 
            className="h-16 w-auto object-contain mx-auto mb-3 drop-shadow-xs" 
          />

          {/* Card Header */}
          <h2 className="text-2xl font-extrabold text-[#142B45] text-center mb-1 tracking-tight">
            Secure Portal Login
          </h2>
          <p className="text-xs text-slate-500 text-center mb-7 font-medium">
            Select your access level and enter credentials to authenticate.
          </p>

          {/* Access Level Selector Label */}
          <label className="block text-xs font-bold text-[#142B45] mb-3">
            Select Access Level <span className="text-[#E00000]">*</span>
          </label>

          {/* 3 Circular Access Level Selectors */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              const Icon = r.icon;
              return (
                <div
                  key={r.id}
                  onClick={() => handleRoleClick(r.id)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-[#E00000] bg-[#FFF1F1] text-[#E00000] shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 group-hover:border-slate-300 group-hover:bg-slate-50/50'
                  }`}>
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className={`text-[11px] font-bold text-center mt-2.5 leading-tight ${
                    isSelected ? 'text-[#E00000]' : 'text-[#142B45]/80'
                  }`}>
                    {r.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-b border-slate-100 my-6" />

          {/* Login Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#142B45] mb-1.5">
                Official ID / Email
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Select access level to autofill"
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 text-sm text-[#142B45] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#142B45]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgot}
                  className="text-xs text-[#E00000] hover:underline font-bold transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-11 py-3 rounded-full border border-slate-200 text-sm text-[#142B45] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Primary Login Button */}
            <button
              type="submit"
              disabled={!selectedRole || isLoading}
              className="w-full py-3.5 mt-6 bg-[#E00000] hover:bg-[#C90000] disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-full text-sm transition-all duration-200 shadow-md active:scale-[0.99] flex justify-center items-center cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
            </button>
          </form>

        </motion.div>
      </main>

    </div>
  );
}
