import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, BellOff, Settings, CheckCheck, Trash2, Bell, ShieldAlert, Activity } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import NotificationCard from './NotificationCard';

export default function GlobalNotificationCenter() {
  const { 
    notifications, 
    isPanelOpen, 
    closePanel, 
    markAllAsRead, 
    clearRead,
    unreadCount
  } = useNotification();
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const tabs = ['All', 'Unread', 'Alerts', 'Tasks', 'System'];

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    // 1. Tab filtering
    if (activeTab === 'Unread' && n.read) return false;
    if (activeTab === 'Alerts' && !['alert', 'hotspot', 'ai'].includes(n.type)) return false;
    if (activeTab === 'Tasks' && n.type !== 'task') return false;
    if (activeTab === 'System' && !['system', 'audit'].includes(n.type)) return false;

    // 2. Search filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) || 
        n.desc.toLowerCase().includes(q) || 
        n.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop (No Blur - Background remains crisp and sharp) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="fixed inset-0 bg-slate-900/10 z-[99990]"
          />

          {/* Slide-out Panel (Full-height right panel fixed top-0 right-0 bottom-0 with KSP Red navbar theme & rounded-l-[20px]) */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-[100000] flex flex-col rounded-l-[20px] border-l border-[#E7ECF3] overflow-hidden"
          >
            {/* Header (Matching exact #E00000 red theme & border of global top navbar) */}
            <div className="bg-[#E00000] border-b border-[#C90000] px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3 text-white">
                <div className="relative">
                  <Bell className="w-5 h-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-1 bg-[#D49A00] border-2 border-[#E00000] rounded-full text-[8px] font-black text-[#142B45]">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-black tracking-wide text-white">
                  {showSettings ? 'Notification Preferences' : 'Intelligence Feed'}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                {!showSettings && (
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    aria-label="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
                {showSettings && (
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-colors"
                  >
                    Done
                  </button>
                )}
                <button 
                  onClick={closePanel}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            {!showSettings ? (
              <>
                {/* Search & Bulk Actions */}
                <div className="p-4 border-b border-[#E7ECF3] bg-[#F8F9FB] space-y-3 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E7ECF3] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] shadow-sm font-medium placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                      {tabs.map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                            activeTab === tab 
                            ? 'bg-[#E00000] text-white shadow-sm' 
                            : 'bg-white border border-[#E7ECF3] text-slate-500 hover:text-[#E00000]'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bulk Action Strip */}
                {notifications.length > 0 && (
                  <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-[#E7ECF3] text-xs font-bold shrink-0">
                    <button 
                      onClick={markAllAsRead}
                      className="flex items-center gap-1.5 text-[#E00000] hover:text-[#C90000] transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                    </button>
                    <button 
                      onClick={clearRead}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Read
                    </button>
                  </div>
                )}

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto bg-white relative">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                      <NotificationCard key={notif.id} notification={notif} />
                    ))
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#F8F9FB]">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-200">
                        {searchQuery ? <Search className="w-6 h-6 text-slate-400" /> : <BellOff className="w-6 h-6 text-slate-400" />}
                      </div>
                      <h3 className="text-sm font-black text-[#0F172A] mb-1">
                        {searchQuery ? 'No Results Found' : 'You\'re All Caught Up'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {searchQuery 
                          ? 'Try adjusting your search terms or filters.' 
                          : 'There are no new notifications in this category.'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Settings View */
              <div className="flex-1 overflow-y-auto bg-[#F8F9FB] p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#C79A2B]" /> Alert Categories
                  </h3>
                  <div className="space-y-3 bg-white p-4 rounded-[16px] border border-[#E7ECF3] shadow-sm">
                    {['Crime Hotspot Alerts', 'AI Predictions', 'Task Assignments', 'System Health'].map((item, i) => (
                      <label key={i} className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#0B1F4D] transition-colors">{item}</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-[#0B1F4D] focus:ring-[#0B1F4D]" />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#C79A2B]" /> Delivery Channels
                  </h3>
                  <div className="space-y-3 bg-white p-4 rounded-[16px] border border-[#E7ECF3] shadow-sm">
                    {['Push Notifications', 'Email Digest', 'SMS Alerts (Critical Only)'].map((item, i) => (
                      <label key={i} className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#0B1F4D] transition-colors">{item}</span>
                        <input type="checkbox" defaultChecked={i !== 2} className="w-4 h-4 rounded border-slate-300 text-[#0B1F4D] focus:ring-[#0B1F4D]" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
