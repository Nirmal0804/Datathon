import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorState';
import { PageTransition } from './components/ui/PageTransition';
import { NotificationProvider } from './context/NotificationContext';
import GlobalNotificationCenter from './components/shared/notifications/GlobalNotificationCenter';
import BackToTop from './components/ui/BackToTop';
import CookieBanner from './components/shared/CookieBanner';

import Navbar from './components/shared/navigation/Navbar';
import Hero from './modules/dashboard/Hero';
import Stats from './modules/dashboard/Stats';
import Features from './modules/dashboard/Features';
import Workflow from './modules/dashboard/Workflow';
import ModulesOverview from './modules/dashboard/ModulesOverview';
import About from './modules/dashboard/About';
import Footer from './components/shared/navigation/Footer';

// Auth
import Login from './modules/authentication/Login';
import ForgotPassword from './modules/authentication/ForgotPassword';

// Dashboard
import DashboardLayout from './modules/dashboard/DashboardLayout';

function AppContent() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('ksp_current_view') || 'landing';
  });
  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem('ksp_selected_role') || null;
  });

  useEffect(() => {
    if (currentView) {
      localStorage.setItem('ksp_current_view', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    if (selectedRole) {
      localStorage.setItem('ksp_selected_role', selectedRole);
    }
  }, [selectedRole]);

  const navigateToAuth    = () => setCurrentView('auth-login');
  const navigateToLanding = () => {
    setCurrentView('landing');
    setSelectedRole(null);
    localStorage.removeItem('ksp_current_view');
    localStorage.removeItem('ksp_selected_role');
    localStorage.removeItem('ksp_active_module');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = (role) => {
    if (role) {
      setSelectedRole(role);
    }
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <PageTransition key="dashboard">
            <DashboardLayout onLogout={navigateToLanding} role={selectedRole || 'analyst'} />
          </PageTransition>
        );
      case 'auth-role':
      case 'auth-login':
        return (
          <PageTransition key="auth-login">
            <Login
              role={selectedRole}
              onRoleSelect={handleRoleSelect}
              onBack={navigateToLanding}
              onForgot={() => setCurrentView('auth-forgot')}
              onLogin={handleLogin}
            />
          </PageTransition>
        );
      case 'auth-forgot':
        return (
          <PageTransition key="auth-forgot">
            <ForgotPassword onBack={() => setCurrentView('auth-login')} />
          </PageTransition>
        );
      default:
        return (
          <PageTransition key="landing">
            <div className="min-h-screen bg-[#F8F9FB] font-sans text-[#111827] selection:bg-[#153E75]/10 selection:text-[#153E75]">
              <Navbar onLoginClick={navigateToAuth} />
              <main>
                <Hero onLoginClick={navigateToAuth} />
                <Stats />
                <Features />
                <Workflow />
                <ModulesOverview />
                <About />
              </main>
              <Footer onLoginClick={navigateToAuth} />
            </div>
          </PageTransition>
        );
    }
  };

  return (
    <NotificationProvider role={selectedRole}>
      <GlobalNotificationCenter />
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
      <BackToTop />
      <CookieBanner />
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
