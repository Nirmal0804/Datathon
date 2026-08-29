import React, { useState, useEffect, useRef } from 'react';
import { Shield, User, Settings, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import kspLogo from '../../assets/ksp-official-logo.png';
import { useToast } from '../../components/ui/Toast';
import {
  EXPECTED_EMAILS,
  ROLE_DISPLAY_NAMES,
  validateEmailForRole,
  isCatalystSDKAvailable,
  renderCatalystSignIn,
  signOutCatalyst
} from '../../utils/catalystAuth';

const roles = [
  { id: 'officer', name: 'Field Officer', icon: User },
  { id: 'analyst', name: 'Intelligence Analyst', icon: Shield },
  { id: 'admin', name: 'System Administrator', icon: Settings }
];

export default function Login({ role, onRoleSelect, onBack, onLogin, onForgot }) {
  const { addToast } = useToast();
  const [selectedRole, setSelectedRole] = useState(role || null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitializingSDK, setIsInitializingSDK] = useState(false);
  const catalystContainerRef = useRef(null);
  const onLoginRef = useRef(onLogin);
  const addToastRef = useRef(addToast);
  const onForgotRef = useRef(onForgot);

  useEffect(() => {
    onLoginRef.current = onLogin;
  }, [onLogin]);

  useEffect(() => {
    addToastRef.current = addToast;
  }, [addToast]);

  useEffect(() => {
    onForgotRef.current = onForgot;
  }, [onForgot]);

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

  // Mount Zoho Catalyst Native Embedded Authentication widget
  useEffect(() => {
    let isMounted = true;
    let pollInterval = null;

    const initWidget = () => {
      if (!selectedRole || !catalystContainerRef.current) return;

      setIsInitializingSDK(true);

      const success = renderCatalystSignIn('catalyst-auth-container', {
        service_url: '/app/index.html',
        always_render_login: true,
        onSuccess: (user) => {
          if (!isMounted) return;
          setIsInitializingSDK(false);

          // Safely read user email from Catalyst response
          const userEmail = user?.email_id || user?.email || user?.user_name || '';
          const validation = validateEmailForRole(userEmail, selectedRole);

          if (validation.valid) {
            if (onLoginRef.current) {
              onLoginRef.current(selectedRole, {
                email: userEmail,
                raw: user,
                verifiedByCatalyst: true,
                name: user?.first_name
                  ? `${user.first_name} ${user.last_name || ''}`.trim()
                  : ROLE_DISPLAY_NAMES[selectedRole],
              });
            }
          } else {
            setErrorMessage(validation.reason);
            if (addToastRef.current) {
              addToastRef.current({
                title: 'Authentication Denied',
                message: validation.reason,
                type: 'error',
              });
            }
            signOutCatalyst();
          }
        },
        onError: (err) => {
          if (!isMounted) return;
          setIsInitializingSDK(false);
          const msg = err?.message || 'Authentication error from Zoho Catalyst. Please verify credentials.';
          setErrorMessage(msg);
          if (addToastRef.current) {
            addToastRef.current({
              title: 'Authentication Error',
              message: msg,
              type: 'error',
            });
          }
        }
      });

      if (success && isMounted) {
        setIsInitializingSDK(false);

        // Intercept "Forgot Password" inside the IAM iframe to route to Crime-Intel React ForgotPassword view
        setTimeout(() => {
          try {
            const iframe = document.getElementById('iam_iframe');
            if (iframe) {
              const attachFpListener = () => {
                try {
                  const iframeDoc = iframe.contentWindow?.document;
                  if (iframeDoc) {
                    const fpLink = iframeDoc.getElementById('forgotpassword') || iframeDoc.querySelector('.goToForgotPassword');
                    if (fpLink) {
                      fpLink.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onForgotRef.current) {
                          onForgotRef.current();
                        }
                      };
                    }
                  }
                } catch (_) {
                  // cross-origin guard
                }
              };
              attachFpListener();
              iframe.addEventListener('load', attachFpListener);
            }
          } catch (_) {}
        }, 500);
      }
    };

    if (selectedRole) {
      if (isCatalystSDKAvailable()) {
        initWidget();
      } else {
        // Wait briefly for Catalyst SDK scripts if still initializing
        let attempts = 0;
        pollInterval = setInterval(() => {
          attempts += 1;
          if (isCatalystSDKAvailable()) {
            clearInterval(pollInterval);
            initWidget();
          } else if (attempts >= 10) {
            clearInterval(pollInterval);
            if (isMounted) {
              setIsInitializingSDK(false);
              setErrorMessage('Catalyst Authentication SDK is initializing. Please refresh if login does not appear.');
            }
          }
        }, 300);
      }
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [selectedRole]);

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
            Back to Home
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
          className="bg-white rounded-3xl p-7 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-200/80 w-full max-w-[480px] relative z-20 my-auto"
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
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-200 ${isSelected
                    ? 'border-2 border-[#E00000] bg-[#FFF1F1] text-[#E00000] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 group-hover:border-slate-300 group-hover:bg-slate-50/50'
                    }`}>
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className={`text-[11px] font-bold text-center mt-2.5 leading-tight ${isSelected ? 'text-[#E00000]' : 'text-[#142B45]/80'
                    }`}>
                    {r.name}
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

          {/* Role Selected: Zoho Catalyst Native Embedded Authentication */}
          {selectedRole ? (
            <div className="space-y-4">
              {/* Authorized Account Information */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Authorized Official Account
                  </span>
                  <span className="text-xs font-bold text-[#142B45]">
                    {EXPECTED_EMAILS[selectedRole]}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {ROLE_DISPLAY_NAMES[selectedRole]}
                </span>
              </div>

              {/* Native Catalyst IAM Embedded Authentication Frame Container */}
              <div className="relative w-full">
                {isInitializingSDK && (
                  <div className="flex items-center justify-center p-8 text-xs text-slate-500 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E00000]" />
                    <span>Connecting to Zoho Catalyst Security...</span>
                  </div>
                )}
                <div
                  id="catalyst-auth-container"
                  ref={catalystContainerRef}
                  style={{
                    width: '100%',
                    height: '560px',
                    minHeight: '560px'
                  }}
                  className="w-full h-[560px] min-h-[560px] rounded-2xl bg-white border border-slate-100 overflow-visible"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 font-medium">
              Please select an access level above to proceed.
            </div>
          )}

        </motion.div>
      </main>

    </div>
  );
}
