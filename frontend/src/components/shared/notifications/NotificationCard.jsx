import React from 'react';
import { ShieldAlert, MapPin, Brain, Briefcase, Settings, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import { useTranslation } from '../../../i18n';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'High':     return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Medium':   return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Low':      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:         return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getIcon = (type) => {
  switch (type) {
    case 'alert':   return <ShieldAlert className="w-5 h-5 text-rose-500" />;
    case 'hotspot': return <MapPin className="w-5 h-5 text-amber-500" />;
    case 'ai':      return <Brain className="w-5 h-5 text-purple-500" />;
    case 'case':    return <Briefcase className="w-5 h-5 text-sky-500" />;
    case 'system':  return <Settings className="w-5 h-5 text-slate-500" />;
    case 'user':    return <User className="w-5 h-5 text-emerald-500" />;
    default:        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  }
};

export default function NotificationCard({ notification }) {
  const { t } = useTranslation();
  const { markAsRead } = useNotification();
  const { id, type, priority, title, desc, time, read, location } = notification;

  const getActionLabel = (type) => {
    switch (type) {
      case 'alert':   return t('feed.viewIntelligence', 'View Intelligence');
      case 'hotspot': return t('feed.openCrimeMap', 'Open Crime Map');
      case 'ai':      return t('feed.viewForecast', 'View Forecast');
      case 'case':    return t('cases.openCase', 'Open Case');
      case 'system':  return t('feed.systemStatus', 'System Status');
      case 'user':    return t('feed.viewActivity', 'View Activity');
      default:        return t('feed.viewDetails', 'View Details');
    }
  };

  const getLocalizedPriority = (p) => {
    switch (p) {
      case 'Critical': return t('feed.critical', 'Critical');
      case 'High':     return t('feed.high', 'High');
      case 'Medium':   return t('feed.medium', 'Medium');
      case 'Low':      return t('feed.low', 'Low');
      default:         return p;
    }
  };

  return (
    <div 
      onClick={() => markAsRead(id)}
      className={`p-4 border-b border-[#E7ECF3] hover:bg-[#F8F9FB] transition-colors cursor-pointer relative group ${read ? 'opacity-70' : 'bg-white'}`}
    >
      {/* Unread indicator */}
      {!read && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0B1F4D] rounded-r-md" />
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 shadow-sm mt-1">
          {getIcon(type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#0B1F4D] transition-colors">{title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getPriorityColor(priority)}`}>
              {getLocalizedPriority(priority)}
            </span>
          </div>
          
          <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
            {desc}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-semibold text-slate-400">
              {time} • {location}
            </span>
            
            <button className="text-[11px] font-bold text-[#0B1F4D] hover:text-[#C79A2B] transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 cursor-pointer">
              {getActionLabel(type)}
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

