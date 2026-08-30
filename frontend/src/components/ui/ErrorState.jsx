import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, WifiOff, Lock, ServerCrash } from 'lucide-react';
import { useTranslation } from '../../i18n';

const CONFIGS = {
  '404': {
    Icon: AlertTriangle,
    code: '404',
    titleKey: 'common.pageNotFound',
    titleDefault: 'Page Not Found',
    msgKey: 'common.pageNotFoundDesc',
    msgDefault: 'The resource you are looking for does not exist or has been moved.',
    actionKey: 'public.dashboard',
    actionDefault: 'Return to Dashboard',
  },
  '500': {
    Icon: ServerCrash,
    code: '500',
    titleKey: 'common.serverError',
    titleDefault: 'Internal Server Error',
    msgKey: 'common.serverErrorDesc',
    msgDefault: 'An unexpected error occurred on our servers. Please try again or contact support.',
    actionKey: 'common.retry',
    actionDefault: 'Retry',
  },
  'network': {
    Icon: WifiOff,
    code: null,
    titleKey: 'common.networkError',
    titleDefault: 'No Network Connection',
    msgKey: 'common.networkErrorDesc',
    msgDefault: 'Unable to reach the server. Please check your network connection and try again.',
    actionKey: 'common.retry',
    actionDefault: 'Retry',
  },
  'unauthorized': {
    Icon: Lock,
    code: '401',
    titleKey: 'common.unauthorized',
    titleDefault: 'Unauthorized Access',
    msgKey: 'common.unauthorizedDesc',
    msgDefault: 'Your session may have expired or you lack permissions. Please log in again.',
    actionKey: 'auth.signIn',
    actionDefault: 'Log In Again',
  },
  'api': {
    Icon: ServerCrash,
    code: null,
    titleKey: 'common.error',
    titleDefault: 'Data Unavailable',
    msgKey: 'common.serverErrorDesc',
    msgDefault: 'Failed to load data from the server. The service may be temporarily unavailable.',
    actionKey: 'common.retry',
    actionDefault: 'Retry',
  },
};

export function ErrorState({ type = '500', onAction, className = '' }) {
  const { t } = useTranslation();
  const config = CONFIGS[type] || CONFIGS['500'];
  const { Icon, code } = config;
  const title = t(config.titleKey, config.titleDefault);
  const message = t(config.msgKey, config.msgDefault);
  const action = t(config.actionKey, config.actionDefault);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-20 px-6 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-6">
        <Icon className="w-9 h-9 text-danger" />
      </div>
      {code && (
        <p className="text-6xl font-black text-surface-2 mb-2 select-none">{code}</p>
      )}
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-8">{message}</p>
      {onAction && (
        <button onClick={onAction} className="btn-primary gap-2">
          <RefreshCw className="w-4 h-4" />
          {action}
        </button>
      )}
    </motion.div>
  );
}

/* React Error Boundary */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <ErrorState
            type="500"
            onAction={() => {
              try {
                localStorage.clear();
              } catch {}
              this.setState({ hasError: false, error: null });
            }}
          />
          {this.state.error && (
            <div className="max-w-xl mx-auto p-4 bg-slate-900 border border-slate-800 rounded-xl text-left font-mono text-xs text-rose-400 overflow-x-auto shadow-md">
              <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-2 uppercase tracking-wider text-[11px]">System Exception Details:</p>
              <p className="whitespace-pre-wrap">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
