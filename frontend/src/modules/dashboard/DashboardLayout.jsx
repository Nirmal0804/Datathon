import React, { useState, Suspense, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/ui/PageTransition';
import { ErrorBoundary } from '../../components/ui/ErrorState';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import AnalystTopNav from './components/AnalystTopNav';
import Footer from '../../components/shared/navigation/Footer';
// GlobalNotificationCenter is rendered at the App level
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

// ML Engine API Service
import { getMLSummary, getMLHotspots, getMLRiskScores, getMLForecast } from '../../services/api';

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
const FULL_HEIGHT_MODULES = new Set(['map']);

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

  // ML Engine Live API Data State
  const [mlData, setMlData] = useState({
    summary: null,
    hotspots: null,
    riskScores: null,
    forecast: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadLiveMLAnalytics() {
      setMlData((prev) => ({ ...prev, loading: true }));
      try {
        const [summary, hotspots, riskScores, forecast] = await Promise.all([
          getMLSummary().catch((err) => { console.warn('ML Summary API warning:', err); return null; }),
          getMLHotspots().catch((err) => { console.warn('ML Hotspots API warning:', err); return null; }),
          getMLRiskScores().catch((err) => { console.warn('ML RiskScores API warning:', err); return null; }),
          getMLForecast(30).catch((err) => { console.warn('ML Forecast API warning:', err); return null; }),
        ]);

        if (isMounted) {
          setMlData({
            summary,
            hotspots,
            riskScores,
            forecast,
            loading: false,
            error: null,
          });
          if (summary && hotspots && riskScores && forecast) {
            console.log('[ML Engine API Connected]:', { summary, hotspots, riskScores, forecast });
          }
        }
      } catch (err) {
        if (isMounted) {
          setMlData((prev) => ({ ...prev, loading: false, error: err.message }));
        }
      }
    }
    loadLiveMLAnalytics();
    return () => { isMounted = false; };
  }, []);

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
        <div className="h-[calc(100vh-4rem)] w-full p-4 sm:p-6 overflow-y-auto">
          {activeModule === 'map' && <CrimeMapLayout role={role} />}
        </div>
      );
    }

    // Conditionally load the Field Officer modules
    if (role === 'officer') {
      const officerModuleMap = {
        overview: <FieldOfficerOverview onNavigate={setActiveModule} />,
        assigned_cases: <FieldOfficerAssignedCases />,
        fir_management: <FieldOfficerFIRManagement />,
        alerts: <FieldOfficerAlerts />,
        hotspots: <HotspotDetectionLayout role={role} onNavigate={setActiveModule} />,
        map: <CrimeMapLayout role={role} />,
        settings: <SettingsLayout role={role} />
      };

      const content = officerModuleMap[activeModule] || officerModuleMap.overview;

      return (
        <main className="flex-1 px-5 sm:px-10 py-8 mx-auto w-full max-w-[1500px]">
          {content}
        </main>
      );
    }

    // Conditionally load the System Administrator modules
    if (role === 'admin') {
      const adminModuleMap = {
        overview: <AdminOverview onNavigate={setActiveModule} />,
        users: <AdminUsers />,
        roles: <AdminRoles />,
        audit_logs: <AdminAuditLogs />,
        system_health: <AdminSystemHealth />,
        config: <AdminConfiguration />,
        settings: <SettingsLayout role={role} />
      };

      const content = adminModuleMap[activeModule] || adminModuleMap.overview;

      return (
        <main className="flex-1 px-4 sm:px-8 py-4 sm:py-6 mx-auto w-full max-w-[1600px]">
          {content}
        </main>
      );
    }

    const moduleMap = {
      overview: (
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
      map: <CrimeMapLayout role={role} />,
      network: <NetworkAnalysisLayout />,
      district: <DistrictIntelligenceLayout onNavigate={setActiveModule} />,
      analytics: <AnalyticsLayout />,
      reports: <ReportsLayout role={role} />,
      correlation: <SocioEconomicCorrelation role={role} />,
      hotspots: <AnalystHotspotLayout onNavigate={setActiveModule} />,
      settings: <SettingsLayout role={role} />,
    };

    const content = moduleMap[activeModule] || moduleMap.overview;
    const isNetwork = activeModule === 'network';

    const layoutClasses = isCompact
      ? (isNetwork ? 'w-full p-4 sm:p-6' : 'flex-1 px-4 sm:px-8 py-4 sm:py-6 mx-auto w-full max-w-[1600px]')
      : (isNetwork ? 'w-full p-4 sm:p-6 lg:p-8' : 'flex-1 p-4 sm:p-6 lg:p-8');

    return (
      <main className={layoutClasses}>
        {content}
      </main>
    );
  };

  return (
    <div className="bg-[#F7F8FA] text-[#0F172A] font-sans min-h-screen relative selection:bg-[#E00000]/10 selection:text-[#E00000]">
      {/* 1. FIXED TOP NAVBAR (position: fixed attached directly to viewport top with z-9999) */}
      {isCompact && (
        <header className="fixed top-0 left-0 right-0 z-[9999] bg-[#F7F8FA] p-3 shadow-xs">
          <div className="max-w-[1600px] mx-auto w-full">
            <div className="hidden md:block">
              <AnalystTopNav
                activeModule={activeModule}
                setActiveModule={handleModuleChange}
                role={role}
              />
            </div>
            <div className="block md:hidden">
              <TopNavbar toggleMobileMenu={() => setMobileMenuOpen(true)} />
            </div>
          </div>
        </header>
      )}

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-[#0F172A]/40 z-50 md:hidden backdrop-blur-sm"
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

      {/* 2. SCROLLABLE MAIN CONTENT (Top padding pt-[92px] ensures content starts below fixed navbar) */}
      <main className={`max-w-[1600px] mx-auto w-full min-h-screen p-3 ${isCompact ? 'pt-[92px]' : 'pt-3'} flex flex-col gap-3`}>
        {/* Main Content Card Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-[#E7EAF0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[500px]">
          {!isCompact && (
            <div className="block">
              <TopNavbar toggleMobileMenu={() => setMobileMenuOpen(true)} />
            </div>
          )}

          <ErrorBoundary key={activeModule}>
            <Suspense fallback={<div className="p-8"><SkeletonDashboard /></div>}>
              <AnimatePresence mode="wait">
                <PageTransition key={activeModule} className="flex-1 flex flex-col min-h-0">
                  {renderContent()}
                </PageTransition>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* 3. FOOTER (Normal document flow, rendered naturally AFTER all content at document end) */}
        <div className="shrink-0 w-full">
          <Footer
            rounded={true}
            role={role}
            activeModule={activeModule}
            onNavigate={handleModuleChange}
          />
        </div>
      </main>

      {/* 4. FIXED FLOATING SETTINGS + LOGOUT CONTROLS (Lower-left viewport) */}
      {isCompact && (
        <AnalystProfileWidget onLogout={onLogout} onNavigate={handleModuleChange} role={role} />
      )}
    </div>
  );
}
