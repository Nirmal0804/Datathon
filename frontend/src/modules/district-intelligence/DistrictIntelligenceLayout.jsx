import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DistrictHeader from './components/DistrictHeader';
import RiskScoreCard from './components/RiskScoreCard';
import CrimeStatistics from './components/CrimeStatistics';
import CategoryDistribution from './components/CategoryDistribution';
import PoliceStationTable from './components/PoliceStationTable';
import RecentCases from './components/RecentCases';
import HotspotSummary from './components/HotspotSummary';
import RepeatOffenders from './components/RepeatOffenders';
import RepeatOffenderProfile from './components/RepeatOffenderProfile';
import IntelligenceSummary from './components/IntelligenceSummary'; // NEW IMPORT

import DistrictRanking from '../dashboard/components/DistrictRanking';
import { getDashboardDistricts } from '../dashboard/components/mockData';

export default function DistrictIntelligenceLayout({ onNavigate }) {
  const defaultFilters = { dateRange: 'Monthly', district: 'All', policeStation: 'All', category: 'All', status: 'All' };
  const districts = getDashboardDistricts(defaultFilters);

  // Selected offender investigation workflow state
  const [selectedOffender, setSelectedOffender] = useState(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full mx-auto space-y-6 pb-12 px-6 sm:px-8"
    >
      <AnimatePresence mode="wait">
        {selectedOffender ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Expanded Offender Investigation dossier page */}
              <RepeatOffenderProfile 
                offenderName={selectedOffender}
                onBack={() => setSelectedOffender(null)}
                onSelectOffender={setSelectedOffender}
                onNavigate={onNavigate}
              />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <DistrictHeader />
            
            {/* KPI Row (Full Width) */}
            <div className="w-full">
              <CrimeStatistics />
            </div>

            {/* 2-Column Main Layout (approx 65% / 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (Main Content - 66%) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <PoliceStationTable />
                
                {/* Emerging Hotspots & Recent Cases side-by-side in Left Column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HotspotSummary onNavigate={onNavigate} />
                  <RecentCases />
                </div>
                
                <RepeatOffenders onSelectOffender={setSelectedOffender} />
              </div>

              {/* Right Column (Sidebar/Summary - 33%) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <RiskScoreCard />
                <IntelligenceSummary />
                <CategoryDistribution />
                <DistrictRanking districtData={districts} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
