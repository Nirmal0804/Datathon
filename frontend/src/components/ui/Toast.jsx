import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/* ──────────────────────────────────────────────
   Toast context
   ────────────────────────────────────────────── */
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return {
    addToast: () => {},
    toast: () => {},
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
    removeToast: () => {}
  };
  return ctx;
}

const TOAST_THEMES = {
  success: {
    Icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    accentBar: 'bg-emerald-500',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-100',
    accentBar: 'bg-amber-500',
  },
  error: {
    Icon: XCircle,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-100',
    accentBar: 'bg-rose-500',
  },
  info: {
    Icon: Info,
    iconColor: 'text-[#0B1F4D]',
    iconBg: 'bg-slate-50 border-slate-200',
    accentBar: 'bg-[#0B1F4D]',
  },
};

/* ──────────────────────────────────────────────
   Single toast
   ────────────────────────────────────────────── */
function Toast({ id, type = 'info', title, message, onDismiss }) {
  const theme = TOAST_THEMES[type] || TOAST_THEMES.info;
  const { Icon, iconColor, iconBg, accentBar } = theme;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4500);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30, y: 15, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
      className="flex items-start gap-3 w-[330px] sm:w-[350px] p-3.5 sm:p-4 rounded-[14px] bg-white/98 border border-[#E2E8F0] shadow-[0_10px_25px_-5px_rgba(15,23,42,0.10),0_8px_10px_-6px_rgba(15,23,42,0.05)] backdrop-blur-md relative overflow-hidden"
      role="alert"
      aria-live="polite"
    >
      {/* Subtle Left Color Indicator Accent */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} />

      {/* Prominent Success / Semantic Icon Container */}
      <div className={`w-8 h-8 rounded-[10px] border flex items-center justify-center shrink-0 mt-0.5 ml-1 ${iconBg}`}>
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h4 className="text-xs sm:text-[13px] font-bold text-[#0B1F4D] tracking-tight leading-snug">
            {title}
          </h4>
        )}
        {message && (
          <p className="text-[11px] font-medium text-[#64748B] mt-0.5 leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 p-1 text-[#94A3B8] hover:text-[#0B1F4D] hover:bg-[#F1F5F9] rounded-[6px] transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Provider + container
   ────────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((type, title, message) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((opts) => {
    if (typeof opts === 'object' && opts !== null) {
      toast(opts.type || 'info', opts.title, opts.message || opts.desc || '');
    } else if (typeof opts === 'string') {
      toast('info', opts, '');
    }
  }, [toast]);

  const api = {
    toast,
    addToast,
    success: (title, msg) => toast('success', title, msg),
    error:   (title, msg) => toast('error',   title, msg),
    warning: (title, msg) => toast('warning', title, msg),
    info:    (title, msg) => toast('info',    title, msg),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
