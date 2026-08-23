import React, { useState, useEffect } from 'react';
import { Shield, User, Settings, Lock, Eye, EyeOff, Loader2, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import kspLogo from '../../assets/ksp-logo.png';

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

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col lg:flex-row relative overflow-hidden font-sans text-[#0F172A] selection:bg-[#2563EB]/10 selection:text-[#2563EB]">

      {/* Top Right "Back to Home" Navigation */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 right-6 sm:top-8 sm:right-12 z-30 flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#2563EB]" />
          Back to Home
        </button>
      )}

      {/* Left Branding Panel - Reduced Width & Curved Edges */}
      <div className="hidden lg:flex lg:w-[38%] min-h-screen relative flex-col items-center justify-center p-8 sm:p-12 text-center text-white overflow-hidden bg-[#0B2341] border-r-4 border-[#C79A2B] rounded-r-[40px]">

        {/* Background Watermark */}
        <img
          src={kspLogo}
          alt=""
          className="absolute opacity-[0.04] w-[450px] h-[450px] object-contain pointer-events-none select-none z-0 top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2"
        />

        {/* Branding Content */}
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center my-auto relative z-20 lg:-translate-x-8">
          <img
            src={kspLogo}
            alt="Karnataka State Police Emblem"
            className="h-44 sm:h-52 w-auto object-contain mb-4 drop-shadow-lg"
          />

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Welcome!
          </h1>

          <div className="text-[#C79A2B] text-xs tracking-[0.4em] font-bold mb-4">
            ★ ★ ★
          </div>

          <p className="text-slate-200 text-sm max-w-xs leading-relaxed font-normal mb-8 mx-auto">
            Secure access to the KSP Crime Analytics &amp; Intelligence Platform.
          </p>

          <Shield className="w-8 h-8 text-[#C79A2B] stroke-[1.5] mb-4" />

          <p className="text-slate-300 text-xs font-medium tracking-wide mb-1">
            Protection. Service. Integrity.
          </p>
          <p className="text-[#C79A2B] font-bold text-sm tracking-wide">
            Karnataka State Police
          </p>
        </div>
      </div>

      {/* Right Login Card Panel - Moved Right */}
      <div className="flex-1 w-full lg:w-[62%] min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-20 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-[#E2E8F0] w-full max-w-[460px]"
        >
          {/* Card Top Official Logo */}
          <img src={kspLogo} alt="Karnataka State Police Emblem" className="h-14 w-auto object-contain mx-auto mb-3 drop-shadow-sm" />

          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-1 tracking-tight">
            Secure Portal Login
          </h2>
          <p className="text-xs text-slate-500 text-center mb-8 font-medium">
            Select your access level and enter credentials to authenticate.
          </p>

          {/* Role Selection Header */}
          <label className="block text-xs font-bold text-[#1E293B] mb-4">
            Select Access Level <span className="text-red-500">*</span>
          </label>

          {/* 3 Circular Role Option Selectors */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => handleRoleClick(r.id)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-200 ${isSelected
                      ? 'border-2 border-[#2563EB] bg-blue-50/20 text-[#2563EB] shadow-sm'
                      : 'border-[#E2E8F0] bg-white text-[#1E293B] group-hover:border-slate-300 group-hover:bg-slate-50/50'
                    }`}>
                    <r.icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className={`text-[11px] font-bold text-center mt-2.5 leading-tight ${isSelected ? 'text-[#2563EB]' : 'text-[#1E293B]'
                    }`}>
                    {r.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-b border-[#F1F5F9] my-6" />

          {/* Login Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
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
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgot}
                  className="text-xs text-[#2563EB] hover:underline font-semibold transition-colors"
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
                  placeholder="pasword"
                  className="w-full pl-11 pr-11 py-3 rounded-full border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedRole || isLoading}
              className="w-full py-3.5 mt-6 bg-[#0B2341] hover:bg-[#0A192F] disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-full text-sm transition-all duration-200 shadow-md active:scale-[0.99] flex justify-center items-center cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
            </button>
          </form>
        </motion.div>
      </div>

    </div>
  );
}
