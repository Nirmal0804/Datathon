import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'ksp_cookie_consent';

export default function CookieBanner() {
  const [hasDecided, setHasDecided] = useState(true); // Default true to avoid SSR/hydration flash
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Category preferences
  const [preferences, setPreferences] = useState({
    essential: true, // Always true and locked
    preferences: true,
    analytics: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setHasDecided(false);
      } else {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setPreferences({
            essential: true,
            preferences: !!parsed.preferences,
            analytics: !!parsed.analytics,
          });
        }
      }
    } catch {
      setHasDecided(false);
    }
  }, []);

  const saveConsent = (choice) => {
    try {
      const consentData = {
        ...choice,
        essential: true,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
      setPreferences(consentData);
      setHasDecided(true);
      setShowSettingsModal(false);
    } catch (e) {
      console.error('Failed to save cookie consent', e);
      setHasDecided(true);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({ preferences: true, analytics: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ preferences: false, analytics: false });
  };

  const handleSaveCustom = () => {
    saveConsent({ preferences: preferences.preferences, analytics: preferences.analytics });
  };

  if (hasDecided && !showSettingsModal) {
    return null;
  }

  return (
    <>
      {/* ── 1. Compact Floating Cookie Consent Banner ──────────────────── */}
      <AnimatePresence>
        {!hasDecided && !showSettingsModal && (
          <motion.div
            role="region"
            aria-label="Cookie consent banner"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 max-w-5xl mx-auto z-40 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-[22px] p-4 sm:p-5 shadow-[0_12px_40px_rgba(11,31,77,0.12)] text-[#0F172A]"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Message & Icon */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 text-[#0B1F4D] flex items-center justify-center shrink-0 mt-0.5">
                  <Cookie className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5 leading-snug">
                    Cookie & Storage Notice
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Secure</span>
                  </h3>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed mt-1 max-w-2xl">
                    Karnataka Police Intelligence Platform uses essential local storage to maintain your operational session and security authentication. Optional preference storage saves station filters and GIS map positions. No commercial ad trackers are deployed.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#0B1F4D] hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F4D]"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Cookie Settings
                </button>

                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0B1F4D] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F4D]"
                >
                  Reject Non-Essential
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#153E75] shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C79A2B]"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. Professional Cookie Settings Modal ──────────────────────── */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Container */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-settings-title"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-white border border-[#E2E8F0] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#0F172A] z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-[#F8F9FB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0B1F4D] text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 id="cookie-settings-title" className="text-base font-bold text-[#0F172A]">
                      Cookie & Storage Preferences
                    </h2>
                    <p className="text-xs text-slate-500">Karnataka Police Intelligence Platform</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Categories Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-left">
                {/* 1. Essential */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F172A]">Essential Cookies & Storage</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Always Active
                      </span>
                    </div>
                    {/* Locked Toggle */}
                    <div className="w-10 h-5 bg-[#0B1F4D] rounded-full p-0.5 flex items-center justify-end cursor-not-allowed opacity-90">
                      <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Required for basic platform security, maintaining active analyst authentication tokens, and user role navigation state across session lifecycles. These cannot be disabled.
                  </p>
                </div>

                {/* 2. Preferences */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F172A]">Preference & Layout Storage</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Optional
                      </span>
                    </div>
                    {/* Interactive Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.preferences}
                      onClick={() => setPreferences((p) => ({ ...p, preferences: !p.preferences }))}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        preferences.preferences ? 'bg-[#0B1F4D] justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Stores custom officer profile avatars, station/district filter selections, and GIS crime map coordinates so you do not lose your viewport context when switching tabs.
                  </p>
                </div>

                {/* 3. Analytics / Telemetry */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F172A]">Internal Diagnostics & Performance</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Optional
                      </span>
                    </div>
                    {/* Interactive Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences.analytics}
                      onClick={() => setPreferences((p) => ({ ...p, analytics: !p.analytics }))}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        preferences.analytics ? 'bg-[#0B1F4D] justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-xs" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Collects anonymous, aggregated internal system latency and query duration statistics to optimize machine learning workload response times. No commercial analytics or third-party trackers are utilized.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Info className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Preferences can be adjusted at any time in system settings.</span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Reject Non-Essential
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B1F4D] bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Accept All
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1F4D] hover:bg-[#153E75] transition-colors cursor-pointer shadow-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
