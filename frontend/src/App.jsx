import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorState';
import { PageTransition } from './components/ui/PageTransition';
import { NotificationProvider } from './context/NotificationContext';
import GlobalNotificationCenter from './components/shared/notifications/GlobalNotificationCenter';
import BackToTop from './components/ui/BackToTop';
import CookieBanner from './components/shared/CookieBanner';
import DesktopRecommendationModal from './components/ui/DesktopRecommendationModal';

import Navbar from './components/shared/navigation/Navbar';
import Hero from './modules/dashboard/Hero';
import Stats from './modules/dashboard/Stats';
import Features from './modules/dashboard/Features';
import Workflow from './modules/dashboard/Workflow';
import ModulesOverview from './modules/dashboard/ModulesOverview';
import About from './modules/dashboard/About';
import Footer from './components/shared/navigation/Footer';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './modules/authentication/Login';
import ForgotPassword from './modules/authentication/ForgotPassword';

// Dashboard
import DashboardLayout from './modules/dashboard/DashboardLayout';

// Public Informational Pages
import PrivacyPolicy from './modules/public-pages/PrivacyPolicy';
import TermsOfService from './modules/public-pages/TermsOfService';
import SecurityAudit from './modules/public-pages/SecurityAudit';
import SupportLanding from './modules/public-pages/SupportLanding';
import Documentation from './modules/public-pages/Documentation';
import ApiAccess from './modules/public-pages/ApiAccess';
import HelpCenter from './modules/public-pages/HelpCenter';
import SecurityGuidelines from './modules/public-pages/SecurityGuidelines';
import Faqs from './modules/public-pages/Faqs';
import ContactSupport from './modules/public-pages/ContactSupport';

const ROUTE_PATH_MAP = {
  '/privacy': 'public-privacy',
  '/terms': 'public-terms',
  '/security-audit': 'public-security-audit',
  '/support': 'public-support',
  '/documentation': 'public-documentation',
  '/api-access': 'public-api-access',
  '/help': 'public-help',
  '/security-guidelines': 'public-security-guidelines',
  '/faqs': 'public-faqs',
  '/contact-support': 'public-contact-support',
  '/dashboard': 'dashboard',
  '/login': 'auth-login',
  '/forgot-password': 'auth-forgot',
  '/': 'landing',
  'public-privacy': 'public-privacy',
  'public-terms': 'public-terms',
  'public-security-audit': 'public-security-audit',
  'public-support': 'public-support',
  'public-documentation': 'public-documentation',
  'public-api-access': 'public-api-access',
  'public-help': 'public-help',
  'public-security-guidelines': 'public-security-guidelines',
  'public-faqs': 'public-faqs',
  'public-contact-support': 'public-contact-support',
};

const VIEW_PATH_MAP = {
  'public-privacy': '/privacy',
  'public-terms': '/terms',
  'public-security-audit': '/security-audit',
  'public-support': '/support',
  'public-documentation': '/documentation',
  'public-api-access': '/api-access',
  'public-help': '/help',
  'public-security-guidelines': '/security-guidelines',
  'public-faqs': '/faqs',
  'public-contact-support': '/contact-support',
  'landing': '/',
  'auth-login': '/login',
  'auth-forgot': '/forgot-password',
  'dashboard': '/dashboard',
};

function resolveInitialView() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const hash = window.location.hash.replace(/^#\/?/, '/').replace(/\/+$/, '');

  if (ROUTE_PATH_MAP[pathname]) {
    return ROUTE_PATH_MAP[pathname];
  }
  if (ROUTE_PATH_MAP[hash]) {
    return ROUTE_PATH_MAP[hash];
  }

  return localStorage.getItem('ksp_current_view') || 'landing';
}

function AppContent() {
  const [currentView, setCurrentView] = useState(resolveInitialView);
  const { session, role: authRole, logout } = useAuth();
  const [selectedRoleIntent, setSelectedRoleIntent] = useState(null);

  // Authoritative role from verified Supabase session
  const effectiveRole = authRole || selectedRoleIntent;

  const navigateTo = useCallback((viewOrPath) => {
    const resolvedView = ROUTE_PATH_MAP[viewOrPath] || viewOrPath;
    setCurrentView(resolvedView);
    const targetPath = VIEW_PATH_MAP[resolvedView] || (resolvedView === 'landing' ? '/' : null);
    if (targetPath && window.location.pathname !== targetPath) {
      try {
        window.history.pushState({ view: resolvedView }, '', targetPath);
      } catch {
        // Fallback for isolated webview contexts
      }
    }
  }, []);

  // Initialize and listen for theme updates
  useEffect(() => {
    const applySavedTheme = () => {
      try {
        let themeVal = 'light';
        const saved = localStorage.getItem('ksp_user_preferences');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.theme) themeVal = parsed.theme;
        } else {
          const legacy = localStorage.getItem('ksp_theme') || localStorage.getItem('theme');
          if (legacy) themeVal = legacy;
        }
        if (themeVal === 'dark-navy') themeVal = 'dark';
        else if (themeVal === 'system' || (themeVal !== 'light' && themeVal !== 'dark')) themeVal = 'light';

        document.documentElement.setAttribute('data-theme', themeVal);
        if (themeVal === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      } catch {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    applySavedTheme();
    window.addEventListener('ksp_preferences_updated', applySavedTheme);
    return () => window.removeEventListener('ksp_preferences_updated', applySavedTheme);
  }, []);

  // Listen to browser forward/backward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      if (ROUTE_PATH_MAP[pathname]) {
        setCurrentView(ROUTE_PATH_MAP[pathname]);
      } else if (e.state?.view) {
        setCurrentView(e.state.view);
      } else if (pathname === '/dashboard') {
        setCurrentView('dashboard');
      } else if (pathname === '/' || pathname === '') {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentView) {
      localStorage.setItem('ksp_current_view', currentView);
    }
  }, [currentView]);

  // Protect dashboard view — require active Supabase session
  useEffect(() => {
    if (currentView === 'dashboard' && !session) {
      navigateTo('auth-login');
    }
  }, [currentView, session, navigateTo]);

  const navigateToAuth = () => navigateTo('auth-login');

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Safe fallback
    }
    setSelectedRoleIntent(null);
    navigateTo('landing');
  };

  const navigateToLanding = () => {
    navigateTo('landing');
  };

  const handleRoleSelect = (role) => {
    setSelectedRoleIntent(role);
  };

  const handleLogin = (role) => {
    if (role) {
      setSelectedRoleIntent(role);
    }
    navigateTo('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'public-privacy':
        return (
          <PageTransition key="public-privacy">
            <PrivacyPolicy
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-terms':
        return (
          <PageTransition key="public-terms">
            <TermsOfService
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-security-audit':
        return (
          <PageTransition key="public-security-audit">
            <SecurityAudit
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-support':
        return (
          <PageTransition key="public-support">
            <SupportLanding
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-documentation':
        return (
          <PageTransition key="public-documentation">
            <Documentation
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-api-access':
        return (
          <PageTransition key="public-api-access">
            <ApiAccess
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-help':
        return (
          <PageTransition key="public-help">
            <HelpCenter
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-security-guidelines':
        return (
          <PageTransition key="public-security-guidelines">
            <SecurityGuidelines
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-faqs':
        return (
          <PageTransition key="public-faqs">
            <Faqs
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'public-contact-support':
        return (
          <PageTransition key="public-contact-support">
            <ContactSupport
              onNavigate={navigateTo}
              onLoginClick={navigateToAuth}
              role={effectiveRole}
            />
          </PageTransition>
        );

      case 'dashboard':
        return (
          <PageTransition key="dashboard">
            <DashboardLayout
              onLogout={handleLogout}
              onNavigate={navigateTo}
              role={effectiveRole || 'analyst'}
            />
          </PageTransition>
        );

      case 'auth-role':
      case 'auth-login':
        return (
          <PageTransition key="auth-login">
            <Login
              role={effectiveRole}
              onRoleSelect={handleRoleSelect}
              onBack={navigateToLanding}
              onForgot={() => navigateTo('auth-forgot')}
              onLogin={handleLogin}
            />
          </PageTransition>
        );

      case 'auth-forgot':
        return (
          <PageTransition key="auth-forgot">
            <ForgotPassword onBack={() => navigateTo('auth-login')} />
          </PageTransition>
        );

      default:
        return (
          <PageTransition key="landing">
            <div className="min-h-screen bg-[#F8F9FB] font-sans text-[#111827] selection:bg-[#153E75]/10 selection:text-[#153E75]">
              <Navbar
                onLoginClick={session && effectiveRole ? () => navigateTo('dashboard') : navigateToAuth}
                onHomeClick={navigateToLanding}
                role={effectiveRole}
              />
              <main>
                <Hero 
                  onLoginClick={session && effectiveRole ? () => navigateTo('dashboard') : navigateToAuth} 
                  onNavigate={navigateTo}
                />
                <Stats />
                <Features onNavigate={navigateTo} />
                <Workflow onNavigate={navigateTo} />
                <ModulesOverview />
                <About />
              </main>
              <Footer
                onLoginClick={session && effectiveRole ? () => navigateTo('dashboard') : navigateToAuth}
                onNavigate={navigateTo}
                role={effectiveRole}
              />
            </div>
          </PageTransition>
        );
    }
  };

  return (
    <NotificationProvider role={effectiveRole}>
      <GlobalNotificationCenter />
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
      {currentView === 'landing' && <DesktopRecommendationModal />}
      <BackToTop />
      <CookieBanner />
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
