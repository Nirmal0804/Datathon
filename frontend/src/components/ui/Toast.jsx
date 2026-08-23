import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

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

const ICONS = {
  success: { Icon: CheckCircle, color: 'text-success', bg: 'bg-success/10 border-success/20' },
  warning: { Icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  error:   { Icon: XCircle,      color: 'text-danger',  bg: 'bg-danger/10  border-danger/20'  },
  info:    { Icon: Info,          color: 'text-info',    bg: 'bg-info/10    border-info/20'    },
};

/* ──────────────────────────────────────────────
   Single toast
   ────────────────────────────────────────────── */
function Toast({ id, type = 'info', title, message, onDismiss }) {
  const { Icon, color, bg } = ICONS[type] || ICONS.info;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4500);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: 60, scale: 0.9  }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-start gap-3 w-80 p-4 rounded-xl border shadow-elevation-3 backdrop-blur-sm bg-surface/95 ${bg}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${color}`} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-text-primary">{title}</p>}
        {message && <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{message}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 p-0.5 text-text-muted hover:text-text-primary rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
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
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
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
