import React, { useState, useEffect } from 'react';
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

import DistrictRanking from '../dashboard/components/DistrictRanking';
import { getDistricts } from '../../api/endpoints';

export default function DistrictIntelligenceLayout() {
  const [districts, setDistricts] = useState([]);
  const [selectedOffender, setSelectedOffender] = useState(null);

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await getDistricts();
        if (res?.districts) {
          setDistricts(res.districts.map(d => ({
            district: d.district_name,
            count: d.fir_count,
          })).filter(d => d.count > 0).sort((a, b) => b.count - a.count));
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    }
    loadDistricts();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-7xl mx-auto space-y-6 pb-12"
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
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <DistrictHeader />
            
            {/* Standard Dashboard Widgets Grid */}
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
                <DistrictRanking districtData={districts} />
              </div>
              <div className="lg:col-span-1">
                <CategoryDistribution />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HotspotSummary />
              <RecentCases />
            </div>

            {/* Repeat Offenders Intelligence Panel */}
            <RepeatOffenders onSelectOffender={setSelectedOffender} />

            <PoliceStationTable />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
