import React, { useState, Suspense, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/ui/PageTransition';
import { ErrorBoundary } from '../../components/ui/ErrorState';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
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

import { fetchDashboardData } from '../../api/dashboardAdapter';

const FULL_HEIGHT_MODULES = new Set(['map', 'network']);

const EMPTY_DATA = {
  summary: { totalFIRs: { value: 0, trend: 'up', percentage: '—' }, activeCases: { value: 0, trend: 'up', percentage: '—' }, closedCases: { value: 0, trend: 'up', percentage: '—' }, totalArrests: { value: 0, trend: 'up', percentage: '—' } },
  trends: { daily: [], monthly: [], yearly: [] },
  categories: [],
  districts: [],
  recentCases: [],
  alerts: [],
};

export default function DashboardLayout({ onLogout, role }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('overview');

  const [filters, setFilters] = useState({
    dateRange: 'Monthly',
    district: 'All',
    policeStation: 'All',
    category: 'All',
    status: 'All',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(EMPTY_DATA);

  const loadData = useCallback(async (f) => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardData(f);
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setDashboardData(EMPTY_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(filters);
  }, []);

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleFilterReset = () => {
    const defaultFilters = { dateRange: 'Monthly', district: 'All', policeStation: 'All', category: 'All', status: 'All' };
    setFilters(defaultFilters);
    loadData(defaultFilters);
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

    if (role === 'officer') {
      const officerModuleMap = {
        overview:       <FieldOfficerOverview onNavigate={setActiveModule} />,
        assigned_cases: <FieldOfficerAssignedCases />,
        fir_management: <FieldOfficerFIRManagement />,
        alerts:         <FieldOfficerAlerts />,
        hotspots:       <HotspotDetectionLayout onNavigate={setActiveModule} />,
        settings:       <SettingsLayout />,
      };
      const content = officerModuleMap[activeModule] || officerModuleMap.overview;
      return (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {content}
        </main>
      );
    }

    if (role === 'admin') {
      const adminModuleMap = {
        overview:      <AdminOverview onNavigate={setActiveModule} />,
        users:         <AdminUsers />,
        roles:         <AdminRoles />,
        audit_logs:    <AdminAuditLogs />,
        system_health: <AdminSystemHealth />,
        config:        <AdminConfiguration />,
        settings:      <SettingsLayout />,
      };
      const content = adminModuleMap[activeModule] || adminModuleMap.overview;
      return (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {content}
        </main>
      );
    }

    const moduleMap = {
      overview:  (
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardHeader />
          <FilterBar
            filters={filters}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
          />

          {isLoading ? (
            <SkeletonDashboard />
          ) : dashboardData.recentCases.length === 0 ? (
            <div className="card p-6 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
              <EmptyState type="no-records" onAction={handleFilterReset} actionLabel="Clear Filters" />
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <KPICards data={dashboardData.summary} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ChartsPlaceholder trendsData={dashboardData.trends} overview={true} />
                </div>
                <div className="lg:col-span-1">
                  <RecentAlerts data={dashboardData.alerts} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <CrimeTablePlaceholder data={dashboardData.recentCases} />
                </div>
                <div className="lg:col-span-1">
                  <DistrictRanking districtData={dashboardData.districts} />
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      district:  <DistrictIntelligenceLayout />,
      analytics: <AnalyticsLayout />,
      reports:   <ReportsLayout role={role} />,
      correlation: <SocioEconomicCorrelation role={role} />,
      hotspots:  <AnalystHotspotLayout onNavigate={setActiveModule} />,
      settings:  <SettingsLayout />,
    };

    const content = moduleMap[activeModule] || moduleMap.overview;
    const isNetwork = activeModule === 'network';

    return (
      <main className={isNetwork ? 'w-full p-4 sm:p-6 lg:p-8' : 'flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'}>
        {content}
      </main>
    );
  };

  const isNetwork = activeModule === 'network';

  return (
    <div className={`flex bg-background text-text-primary font-sans ${isNetwork ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
      <Sidebar
        role={role}
        onLogout={onLogout}
        activeModule={activeModule}
        setActiveModule={handleModuleChange}
      />

      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-smooth md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          role={role}
          onLogout={onLogout}
          activeModule={activeModule}
          setActiveModule={handleModuleChange}
        />
      </div>

      <div className={`flex-1 flex flex-col md:ml-64 w-full min-w-0 ${isNetwork ? '' : 'h-screen'}`}>
        <TopNavbar toggleMobileMenu={() => setMobileMenuOpen(true)} />

        <ErrorBoundary>
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
  );
}
