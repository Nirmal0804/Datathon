import React, { useState, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/ui/PageTransition';
import { ErrorBoundary } from '../../components/ui/ErrorState';
import { SkeletonDashboard } from '../../components/ui/Skeleton';

import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DashboardHeader from './components/DashboardHeader';
import KPICards from './components/KPICards';
import ChartsPlaceholder from './components/ChartsPlaceholder';
import RecentAlerts from './components/RecentAlerts';
import CrimeTablePlaceholder from './components/CrimeTablePlaceholder';
import CrimeMapLayout from '../karnataka-crime-map/CrimeMapLayout';
import DistrictIntelligenceLayout from '../district-intelligence/DistrictIntelligenceLayout';
import NetworkAnalysisLayout from '../network-analysis/NetworkAnalysisLayout';
import AnalyticsLayout from '../analytics/AnalyticsLayout';
import ReportsLayout from '../reports/ReportsLayout';
import SettingsLayout from '../settings/SettingsLayout';

// Map modules that should be full-height (no scroll container)
const FULL_HEIGHT_MODULES = new Set(['map', 'network']);

export default function DashboardLayout({ onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('overview');

  const handleModuleChange = (mod) => {
    setActiveModule(mod);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (FULL_HEIGHT_MODULES.has(activeModule)) {
      return (
        <div className="h-[calc(100vh-4rem)] w-full p-4 sm:p-6">
          {activeModule === 'map'     && <CrimeMapLayout />}
          {activeModule === 'network' && <NetworkAnalysisLayout />}
        </div>
      );
    }

    const moduleMap = {
      overview:  (
        <div className="max-w-7xl mx-auto">
          <DashboardHeader />
          <KPICards />
          <ChartsPlaceholder />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><CrimeTablePlaceholder /></div>
            <div className="lg:col-span-1"><RecentAlerts /></div>
          </div>
        </div>
      ),
      district:  <DistrictIntelligenceLayout />,
      analytics: <AnalyticsLayout />,
      reports:   <ReportsLayout />,
      settings:  <SettingsLayout />,
    };

    const content = moduleMap[activeModule] || moduleMap.overview;

    return (
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {content}
      </main>
    );
  };

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        onLogout={onLogout}
        activeModule={activeModule}
        setActiveModule={handleModuleChange}
      />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-smooth md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          onLogout={onLogout}
          activeModule={activeModule}
          setActiveModule={handleModuleChange}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-64 w-full min-w-0">
        <TopNavbar toggleMobileMenu={() => setMobileMenuOpen(true)} />

        <ErrorBoundary>
          <Suspense fallback={<div className="p-8"><SkeletonDashboard /></div>}>
            <AnimatePresence mode="wait">
              <PageTransition key={activeModule} className="flex-1 flex flex-col min-h-0">
                {renderContent()}
              </PageTransition>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
