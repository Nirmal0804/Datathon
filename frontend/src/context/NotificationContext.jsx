import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    console.warn("useNotification used outside of NotificationProvider");
    return {
      notifications: [],
      unreadCount: 0,
      isPanelOpen: false,
      togglePanel: () => {},
      closePanel: () => {},
      openPanel: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearRead: () => {},
      addNotification: () => {}
    };
  }
  return context;
};

// Initial mock notifications mapped by role
const MOCK_NOTIFICATIONS = {
  admin: [
    { id: '1', type: 'system', priority: 'High', title: 'Security Alert', desc: 'Multiple failed login attempts detected on IP 192.168.4.55.', time: '5 mins ago', read: false, iconType: 'alert', location: 'System Administration' },
    { id: '2', type: 'system', priority: 'Medium', title: 'System Backup', desc: 'Database backup completed successfully.', time: '1 hour ago', read: false, iconType: 'settings', location: 'System Health' },
    { id: '3', type: 'audit', priority: 'Low', title: 'Audit Configuration', desc: 'User privileges updated by Admin Gowda.', time: '3 hours ago', read: true, iconType: 'user', location: 'Audit Logs' }
  ],
  analyst: [
    { id: '1', type: 'alert', priority: 'Critical', title: 'Intelligence Alert', desc: 'Vehicle theft increased 18% in the past 24 hours.', time: '10 mins ago', read: false, iconType: 'alert', location: 'Analytics Suite' },
    { id: '2', type: 'ai', priority: 'Medium', title: 'AI Prediction', desc: 'AI predicts elevated crime during festival period in Central District.', time: '30 mins ago', read: false, iconType: 'ai', location: 'Analytics Suite' },
    { id: '3', type: 'hotspot', priority: 'High', title: 'Crime Hotspot', desc: 'New emerging hotspot detected in Cubbon Park PS.', time: '1 hour ago', read: true, iconType: 'hotspot', location: 'Crime Map' }
  ],
  officer: [
    { id: '1', type: 'task', priority: 'High', title: 'Case Assignment', desc: 'New FIR assigned: FIR-2026-0198.', time: 'Just now', read: false, iconType: 'case', location: 'Assigned Cases' },
    { id: '2', type: 'hotspot', priority: 'Medium', title: 'Nearby Incident', desc: 'Property theft reported 2km from your current location.', time: '15 mins ago', read: false, iconType: 'hotspot', location: 'Alerts Feed' },
    { id: '3', type: 'system', priority: 'Low', title: 'Shift Update', desc: 'Your patrol route for evening shift has been updated.', time: '2 hours ago', read: true, iconType: 'user', location: 'Assigned Cases' }
  ]
};

export function NotificationProvider({ children, role }) {
  const [notifications, setNotifications] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize notifications based on role
  useEffect(() => {
    const roleData = MOCK_NOTIFICATIONS[role] || MOCK_NOTIFICATIONS.officer;
    setNotifications(roleData);
    setUnreadCount(roleData.filter(n => !n.read).length);
  }, [role]);

  // Recalculate unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Simulate real-time notification
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotif = {
        id: `rt-${Date.now()}`,
        type: 'alert',
        priority: 'High',
        title: 'Real-time Intelligence Update',
        desc: 'New intelligence data has been successfully processed and synced.',
        time: 'Just now',
        read: false,
        iconType: 'alert',
        location: 'Analytics Suite'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }, 15000); // 15 seconds after load
    return () => clearTimeout(timer);
  }, []);

  const togglePanel = () => setIsPanelOpen(prev => !prev);
  const closePanel = () => setIsPanelOpen(false);
  const openPanel = () => setIsPanelOpen(true);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearRead = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  const addNotification = (notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now().toString(), read: false, time: 'Just now' }, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isPanelOpen,
      togglePanel,
      closePanel,
      openPanel,
      markAsRead,
      markAllAsRead,
      clearRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
