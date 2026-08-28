import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorState';
import { PageTransition } from './components/ui/PageTransition';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import GlobalNotificationCenter from './components/shared/notifications/GlobalNotificationCenter';

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
  const { isAuthenticated, role, loginWithCatalystUser, logout, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [selectedRole, setSelectedRole] = useState(null);

  // Sync authentication state to view
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && role) {
        setCurrentView('dashboard');
        setSelectedRole(role);
      } else if (currentView === 'dashboard') {
        setCurrentView('landing');
        setSelectedRole(null);
      }
    }
  }, [isAuthenticated, role, isLoading]);

  const navigateToAuth    = () => setCurrentView('auth-login');
  const navigateToLanding = () => {
    setCurrentView('landing');
    setSelectedRole(null);
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleLoginSuccess = (authenticatedRole, userDetails) => {
    try {
      loginWithCatalystUser(authenticatedRole, userDetails);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('[App] Login verification error:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigateToLanding();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0B1F4D] border-t-[#E00000] rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#0B1F4D] uppercase tracking-wider">
            Verifying Karnataka Police Security Credentials...
          </span>
        </div>
      </div>
    );
  }

  const renderView = () => {
    // Protected Route enforcement: dashboard is strictly accessible when authenticated
    if (currentView === 'dashboard' && isAuthenticated && role) {
      return (
        <PageTransition key="dashboard">
          <DashboardLayout onLogout={handleLogout} role={role} />
        </PageTransition>
      );
    }

    switch (currentView) {
      case 'auth-login':
        return (
          <PageTransition key="auth-login">
            <Login
              role={selectedRole}
              onRoleSelect={handleRoleSelect}
              onBack={navigateToLanding}
              onForgot={() => setCurrentView('auth-forgot')}
              onLogin={handleLoginSuccess}
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
    <NotificationProvider role={role || selectedRole}>
      <GlobalNotificationCenter />
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
