import React, { useState, Suspense, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/ui/PageTransition';
import { ErrorBoundary } from '../../components/ui/ErrorState';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import AnalystTopNav from './components/AnalystTopNav';
import AnalystProfileWidget from './components/AnalystProfileWidget';
import DashboardHeader from './components/DashboardHeader';
import FilterBar from './components/FilterBar';
import KPICards from './components/KPICards';
import ChartsPlaceholder from './components/ChartsPlaceholder';
import DistrictRanking from './components/DistrictRanking';
import RecentAlerts from './components/RecentAlerts';
import CrimeTablePlaceholder from './components/CrimeTablePlaceholder';
import CrimeMapLayout from '../karnataka-crime-map/CrimeMapLayout';
import DistrictIntelligenceLayout from '../district-intelligence/DistrictIntelligenceLayout';
import NetworkAnalysisLayout from '../network-analysis/NetworkAnalysisLayout';
import AnalyticsLayout from '../analytics/AnalyticsLayout';
import ReportsLayout from '../reports/ReportsLayout';
import SocioEconomicCorrelation from '../socio-economic/SocioEconomicCorrelation';
import SettingsLayout from '../settings/SettingsLayout';

// Field Officer specific modules
import FieldOfficerOverview from './components/FieldOfficerOverview';
import FieldOfficerAssignedCases from './components/FieldOfficerAssignedCases';
import FieldOfficerFIRManagement from './components/FieldOfficerFIRManagement';
import FieldOfficerAlerts from './components/FieldOfficerAlerts';
import HotspotDetectionLayout from '../hotspot-detection/HotspotDetectionLayout';
import AnalystHotspotLayout from '../hotspot-detection/AnalystHotspotLayout';

// Intelligence Analyst specific widgets
import EmergingCrimePatterns from './components/EmergingCrimePatterns';
import CriminalNetworkSummary from './components/CriminalNetworkSummary';

// System Administrator specific modules
import AdminOverview from './components/AdminOverview';
import AdminUsers from './components/AdminUsers';
import AdminRoles from './components/AdminRoles';
import AdminAuditLogs from './components/AdminAuditLogs';
import AdminSystemHealth from './components/AdminSystemHealth';
import AdminConfiguration from './components/AdminConfiguration';

// Mock DB queries simulating APIs
import {
  getDashboardSummary,
  getDashboardTrends,
  getDashboardDistricts,
  getDashboardCategories,
  getDashboardRecentCases,
  getDashboardAlerts
} from './components/mockData';

// Map modules that should be full-height (no scroll container)
const FULL_HEIGHT_MODULES = new Set(['network']);

export default function DashboardLayout({ onLogout, role }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('overview');

  const isCompact = role === 'analyst' || role === 'officer' || role === 'admin';

  // Filter States
  const [filters, setFilters] = useState({
    dateRange: 'Monthly',
    district: 'All',
    policeStation: 'All',
    category: 'All',
    status: 'All',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Filtered Data Cache
  const [dashboardData, setDashboardData] = useState({
    summary: getDashboardSummary(filters),
    trends: getDashboardTrends(filters),
    categories: getDashboardCategories(filters),
    districts: getDashboardDistricts(filters),
    recentCases: getDashboardRecentCases(filters),
    alerts: getDashboardAlerts(filters),
  });

  const handleFilterApply = (newFilters) => {
    setIsLoading(true);
    setFilters(newFilters);
    // Simulate API network delay
    setTimeout(() => {
      setDashboardData({
        summary: getDashboardSummary(newFilters),
        trends: getDashboardTrends(newFilters),
        categories: getDashboardCategories(newFilters),
        districts: getDashboardDistricts(newFilters),
        recentCases: getDashboardRecentCases(newFilters),
        alerts: getDashboardAlerts(newFilters),
      });
      setIsLoading(false);
    }, 400);
  };

  const handleFilterReset = () => {
    setIsLoading(true);
    const defaultFilters = {
      dateRange: 'Monthly',
      district: 'All',
      policeStation: 'All',
      category: 'All',
      status: 'All',
    };
    setFilters(defaultFilters);
    setTimeout(() => {
      setDashboardData({
        summary: getDashboardSummary(defaultFilters),
        trends: getDashboardTrends(defaultFilters),
        categories: getDashboardCategories(defaultFilters),
        districts: getDashboardDistricts(defaultFilters),
        recentCases: getDashboardRecentCases(defaultFilters),
        alerts: getDashboardAlerts(defaultFilters),
      });
      setIsLoading(false);
    }, 400);
  };

  const handleModuleChange = (mod) => {
    setActiveModule(mod);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (FULL_HEIGHT_MODULES.has(activeModule)) {
      return (
        <div className="h-[calc(100vh-4rem)] w-full p-4 sm:p-6">
          {activeModule === 'map'     && <CrimeMapLayout role={role} />}
          {activeModule === 'network' && <NetworkAnalysisLayout />}
        </div>
      );
    }

    // Conditionally load the Field Officer modules
    if (role === 'officer') {
      const officerModuleMap = {
        overview:       <FieldOfficerOverview onNavigate={setActiveModule} />,
        assigned_cases: <FieldOfficerAssignedCases />,
        fir_management: <FieldOfficerFIRManagement />,
        alerts:         <FieldOfficerAlerts />,
        map:            <CrimeMapLayout role={role} />,
        hotspots:       <HotspotDetectionLayout onNavigate={setActiveModule} />,
        settings:       <SettingsLayout />,
      };
      
      const content = officerModuleMap[activeModule] || officerModuleMap.overview;
      
      return (
        <main className="flex-1 overflow-y-auto px-5 sm:px-10 py-8 mx-auto w-full max-w-[1500px]">
          {content}
        </main>
      );
    }

    // Conditionally load the System Administrator modules
    if (role === 'admin') {
      const adminModuleMap = {
        overview:      <AdminOverview onNavigate={setActiveModule} />,
        users:         <AdminUsers />,
        roles:         <AdminRoles />,
        audit_logs:    <AdminAuditLogs />,
        system_health: <AdminSystemHealth />,
        config:        <AdminConfiguration />,
        map:           <CrimeMapLayout role={role} />,
        settings:      <SettingsLayout />,
      };
      
      const content = adminModuleMap[activeModule] || adminModuleMap.overview;
      
      return (
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 mx-auto w-full max-w-[1600px]">
          {content}
        </main>
      );
    }

    const moduleMap = {
      overview:  (
        <div className="w-full mx-auto space-y-12">
          <DashboardHeader compact={isCompact} />
          <FilterBar
            filters={filters}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
            compact={isCompact}
          />

          {isLoading ? (
            <SkeletonDashboard />
          ) : dashboardData.recentCases.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-8 flex items-center justify-center shadow-sm">
              <EmptyState type="no-records" onAction={handleFilterReset} actionLabel="Clear Filters" />
            </div>
          ) : (
            <div className="animate-fade-in space-y-12">
              {/* Row 1: KPI Cards */}
              <KPICards data={dashboardData.summary} compact={isCompact} />

              {/* Row 2: Primary Trend Chart and Alerts */}
              <div className="flex flex-col lg:flex-row items-stretch gap-6">
                <div className="w-full lg:w-[65%]">
                  <ChartsPlaceholder
                    trendsData={dashboardData.trends}
                    overview={true}
                  />
                </div>
                <div className="w-full lg:w-[35%]">
                  <RecentAlerts data={dashboardData.alerts} />
                </div>
              </div>

              {/* Row 3: Recent Intelligence Records Table and Emerging Patterns */}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-[72%]">
                  <CrimeTablePlaceholder data={dashboardData.recentCases} />
                </div>
                <div className="w-full lg:w-[28%]">
                  <EmergingCrimePatterns />
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      map:       <CrimeMapLayout role={role} />,
      district:  <DistrictIntelligenceLayout />,
      analytics: <AnalyticsLayout />,
      reports:   <ReportsLayout role={role} />,
      correlation: <SocioEconomicCorrelation role={role} />,
      hotspots:  <AnalystHotspotLayout onNavigate={setActiveModule} />,
      settings:  <SettingsLayout />,
    };

    const content = moduleMap[activeModule] || moduleMap.overview;
    const isNetwork = activeModule === 'network';

    const layoutClasses = isCompact 
      ? (isNetwork ? 'w-full p-4 sm:p-6' : 'flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 mx-auto w-full max-w-[1600px]')
      : (isNetwork ? 'w-full p-4 sm:p-6 lg:p-8' : 'flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8');

    return (
      <main className={layoutClasses}>
        {content}
      </main>
    );
  };

  const isNetwork = activeModule === 'network';

  return (
    <div className={`flex bg-[#F7F8FA] text-[#0F172A] font-sans p-3 gap-3 ${isNetwork ? 'min-h-screen' : 'h-screen overflow-hidden'} relative`}>
      {/* Analyst Profile Widget */}
      {isCompact && (
        <AnalystProfileWidget onLogout={onLogout} onNavigate={handleModuleChange} role={role} />
      )}

      {/* Desktop Sidebar */}
      {!isCompact && (
        <div className="hidden md:block flex-shrink-0">
          <Sidebar
            role={role}
            onLogout={onLogout}
            activeModule={activeModule}
            setActiveModule={handleModuleChange}
          />
        </div>
      )}

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-[#0F172A]/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-smooth md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          role={role}
          onLogout={onLogout}
          activeModule={activeModule}
          setActiveModule={handleModuleChange}
        />
      </div>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden ${isNetwork ? '' : 'h-full'}`}>
        {isCompact && (
          <div className="hidden md:block shrink-0">
            <AnalystTopNav
              activeModule={activeModule}
              setActiveModule={handleModuleChange}
              role={role}
            />
          </div>
        )}

        <div className={`flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-[#E7EAF0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden ${isNetwork ? '' : 'h-full'}`}>
          <div className={isCompact ? 'block md:hidden' : 'block'}>
            <TopNavbar toggleMobileMenu={() => setMobileMenuOpen(true)} />
          </div>

          <ErrorBoundary key={activeModule}>
            <Suspense fallback={<div className="p-8"><SkeletonDashboard /></div>}>
              <AnimatePresence mode="wait">
                <PageTransition key={activeModule} className={isNetwork ? 'w-full' : 'flex-1 flex flex-col min-h-0'}>
                  {renderContent()}
                </PageTransition>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
