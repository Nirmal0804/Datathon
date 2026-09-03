import React, { useState, useEffect } from 'react';
import { Shield, User, Settings, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import kspLogo from '../../assets/ksp-official-logo.webp';
import LazyImage from '../../components/ui/LazyImage';
import { useToast } from '../../components/ui/Toast';
import { useTranslation } from '../../i18n';

import { useAuth } from '../../context/AuthContext';

const roles = [
  { id: 'officer', nameKey: 'auth.roleFieldOfficer', name: 'Field Officer', icon: User },
  { id: 'analyst', nameKey: 'auth.roleAnalyst', name: 'Intelligence Analyst', icon: Shield },
  { id: 'admin', nameKey: 'auth.roleAdmin', name: 'System Administrator', icon: Settings }
];

export default function Login({ role, onRoleSelect, onBack, onForgot, onLogin }) {
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role || null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (role) {
      setSelectedRole(role);
      setErrorMessage('');
    }
  }, [role]);

  const handleRoleClick = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    if (onRoleSelect) {
      onRoleSelect(roleId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      addToast({
        title: t('auth.accessLevelRequired', 'Access Level Required'),
        message: t('auth.accessLevelRequiredMsg', 'Please select an access level before logging in.'),
        type: 'warning',
      });
      return;
    }

    if (!email || email.trim() === '') {
      const msg = t('auth.emailRequiredMsg', 'Please enter your official email address.');
      setErrorMessage(msg);
      addToast({
        title: t('auth.emailRequired', 'Email Required'),
        message: msg,
        type: 'warning',
      });
      return;
    }

    if (!password || password.trim() === '') {
      const msg = t('auth.passwordRequiredMsg', 'Please enter your password.');
      setErrorMessage(msg);
      addToast({
        title: t('auth.passwordRequired', 'Password Required'),
        message: msg,
        type: 'warning',
      });
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const authData = await login(email, password);
      const userObj = authData?.user;

      // Extract verified role strictly from server-trusted app_metadata
      const rawRole = userObj?.app_metadata?.role || 'FIELD_OFFICER';

      const upperRole = String(rawRole).trim().toUpperCase();
      const normalizedRole =
        upperRole.includes('ADMIN') ? 'admin' :
        upperRole.includes('ANALYST') ? 'analyst' : 'officer';

      // Security verification: compare selected UI access level with verified profile role
      if (selectedRole && selectedRole !== normalizedRole) {
        setIsLoading(false);
        const roleMismatchMsg = `Access Denied: Your official credentials are authorized for ${normalizedRole.toUpperCase()} level, not ${selectedRole.toUpperCase()}.`;
        setErrorMessage(roleMismatchMsg);
        addToast({
          title: t('auth.authDenied', 'Access Level Mismatch'),
          message: roleMismatchMsg,
          type: 'error',
        });
        return;
      }

      setIsLoading(false);
      const userName = userObj?.user_metadata?.full_name || userObj?.user_metadata?.name || email.split('@')[0];
      const userBadge = userObj?.user_metadata?.badge_number || 'KSP-AUTH';

      addToast({
        title: t('auth.authSuccess', 'Authentication Successful'),
        message: `Welcome back, ${userName} (${userBadge}).`,
        type: 'success',
      });

      if (onLogin) {
        onLogin(normalizedRole, {
          email: userObj?.email,
          name: userName,
          role: normalizedRole,
          badge: userBadge,
        });
      }
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err?.message || t('auth.authDeniedMsg', 'Invalid credentials. Please verify your official email and password.');
      setErrorMessage(errorMsg);
      addToast({
        title: t('auth.authDenied', 'Authentication Denied'),
        message: errorMsg,
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col relative overflow-hidden font-sans text-[#0F172A] selection:bg-[#0B1F4D]/10 selection:text-[#0B1F4D]">

      {/* 1. TOP NAVBAR: Karnataka Police Red */}
      <header className="w-full bg-[#E00000] text-white px-4 sm:px-8 py-3.5 border-b border-[#C90000] shadow-sm relative z-30 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-1 shadow-xs shrink-0 overflow-hidden">
            <LazyImage
              src={kspLogo}
              alt="Karnataka State Police Emblem"
              className="h-full w-auto object-contain"
              containerClassName="w-full h-full"
              loading="eager"
            />
          </div>
          <div>
            <span className="text-white font-extrabold tracking-tight text-base sm:text-lg flex items-center gap-1.5 leading-none">
              {t('auth.kspTitle', 'KARNATAKA POLICE')}
              <span className="text-[10px] bg-[#D49A00] text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">KSP</span>
            </span>
            <p className="text-xs text-[#F5E7C1] font-medium tracking-wide mt-0.5">
              {t('auth.portalName', 'Crime Analytics Platform')}
            </p>
          </div>
        </div>

        {/* Right Navigation */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#F5E7C1] transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            {t('auth.backToHome', 'Back to Home')}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 md:p-8 relative min-h-[calc(100vh-64px)]">

        {/* 3. CENTER LOGIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-3xl p-7 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-200/80 w-full max-w-[460px] relative z-20 my-auto"
        >
          {/* Card Official Logo */}
          <div className="h-16 w-16 mx-auto mb-3 overflow-hidden flex items-center justify-center">
            <LazyImage
              src={kspLogo}
              alt="Karnataka State Police Emblem"
              className="h-16 w-auto object-contain drop-shadow-xs"
              containerClassName="w-full h-full"
              loading="eager"
            />
          </div>

          {/* Card Header */}
          <h2 className="text-2xl font-extrabold text-[#142B45] text-center mb-1 tracking-tight">
            {t('auth.signIn', 'Secure Portal Login')}
          </h2>
          <p className="text-xs text-slate-500 text-center mb-7 font-medium">
            {t('auth.portalSubtitle', 'Select your access level and enter credentials to authenticate.')}
          </p>

          {/* Access Level Selector Label */}
          <label className="block text-xs font-bold text-[#142B45] mb-3">
            {t('auth.selectAccessLevel', 'Select Access Level')} <span className="text-[#E00000]">*</span>
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
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-200 ${isSelected
                    ? 'border-2 border-[#E00000] bg-[#FFF1F1] text-[#E00000] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 group-hover:border-slate-300 group-hover:bg-slate-50/50'
                    }`}>
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className={`text-[11px] font-bold text-center mt-2.5 leading-tight ${isSelected ? 'text-[#E00000]' : 'text-[#142B45]/80'
                    }`}>
                    {t(r.nameKey, r.name)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-b border-slate-100 my-6" />

          {/* Error Message Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#142B45] mb-1.5">
                {t('auth.email', 'Official ID / Email')}
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'Enter official email')}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 text-sm text-[#142B45] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent transition-all shadow-2xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#142B45]">
                  {t('auth.password', 'Password')}
                </label>
                <button
                  type="button"
                  onClick={onForgot}
                  className="text-xs text-[#E00000] hover:underline font-bold transition-colors cursor-pointer"
                >
                  {t('auth.forgotPassword', 'Forgot?')}
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder', 'Enter password')}
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
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.loginButton', 'Login')}
            </button>
          </form>

        </motion.div>
      </main>

    </div>
  );
}
