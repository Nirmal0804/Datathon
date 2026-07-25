import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorState';
import { PageTransition } from './components/ui/PageTransition';

import Navbar from './components/shared/navigation/Navbar';
import Hero from './modules/dashboard/Hero';
import Stats from './modules/dashboard/Stats';
import Features from './modules/dashboard/Features';
import Workflow from './modules/dashboard/Workflow';
import ModulesOverview from './modules/dashboard/ModulesOverview';
import About from './modules/dashboard/About';
import Footer from './components/shared/navigation/Footer';

// Auth
import RoleSelection from './modules/authentication/RoleSelection';
import Login from './modules/authentication/Login';
import ForgotPassword from './modules/authentication/ForgotPassword';

// Dashboard
import DashboardLayout from './modules/dashboard/DashboardLayout';

function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedRole, setSelectedRole] = useState(null);

  const navigateToAuth    = () => setCurrentView('auth-login');
  const navigateToLanding = () => setCurrentView('landing');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <PageTransition key="dashboard">
            <DashboardLayout onLogout={navigateToLanding} role={selectedRole} />
          </PageTransition>
        );
      case 'auth-role':
      case 'auth-login':
        return (
          <PageTransition key="auth-login">
            <Login
              role={selectedRole}
              onRoleSelect={(role) => setSelectedRole(role)}
              onBack={navigateToLanding}
              onForgot={() => setCurrentView('auth-forgot')}
              onLogin={() => setCurrentView('dashboard')}
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
              <Footer />
            </div>
          </PageTransition>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderView()}
    </AnimatePresence>
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
