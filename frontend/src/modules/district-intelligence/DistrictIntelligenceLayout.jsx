import React from 'react';
import DistrictHeader from './components/DistrictHeader';
import RiskScoreCard from './components/RiskScoreCard';
import CrimeStatistics from './components/CrimeStatistics';
import TrendChartsPlaceholder from './components/TrendChartsPlaceholder';
import CategoryDistribution from './components/CategoryDistribution';
import PoliceStationTable from './components/PoliceStationTable';
import RecentCases from './components/RecentCases';
import HotspotSummary from './components/HotspotSummary';

export default function DistrictIntelligenceLayout() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <DistrictHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CrimeStatistics />
        </div>
        <div className="lg:col-span-1">
          <RiskScoreCard />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendChartsPlaceholder />
        </div>
        <div className="lg:col-span-1">
          <CategoryDistribution />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HotspotSummary />
        <RecentCases />
      </div>

      <PoliceStationTable />
    </div>
  );
}
