import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HOTSPOTS_DATA } from '../../../mock/analyticsData';
import { Flame, Compass, ArrowUpRight, TrendingUp, Map } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function HotspotAnalytics({ timeFilter }) {
  const { t } = useTranslation();
  const [timeTab, setTimeTab] = useState('Monthly'); // 'Daily' | 'Monthly' | 'Yearly'

  const tabs = [
    { key: 'Daily', label: t('dashboard.daily', 'Daily') },
    { key: 'Monthly', label: t('dashboard.monthly', 'Monthly') },
    { key: 'Yearly', label: t('dashboard.yearly', 'Yearly') },
  ];

  const activeHotspots = useMemo(() => {
    return HOTSPOTS_DATA[timeTab] || HOTSPOTS_DATA.Monthly;
  }, [timeTab]);

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm space-y-4 flex flex-col h-full justify-between">
      
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#C79A2B] animate-pulse-soft" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wider">{t('hotspots.emergingHotspots', 'Emerging Crime Hotspots')}</h3>
              <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">{t('hotspots.subtitle', 'Spatial clusters reporting the highest surge in weekly cases.')}</p>
            </div>
          </div>

          {/* Time tab toggle */}
          <div className="flex bg-[#F8F9FB] p-1 rounded-xl border border-[#E7ECF3] shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTimeTab(tab.key)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  timeTab === tab.key
                    ? 'bg-[#0B1F4D] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0B1F4D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hotspots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[300px]">
          {activeHotspots.map((hs, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] flex flex-col justify-between hover:border-[#CBD5E1] transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start mb-3 border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                    <Flame className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0B1F4D] text-[11px] leading-tight">{hs.area}</h4>
                    <p className="text-[9px] text-[#64748B] font-bold uppercase mt-0.5">{hs.station}</p>
                  </div>
                </div>
                {/* Risk Badge */}
                <span className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded font-bold uppercase tracking-wider text-[9px]">
                  {t('hotspots.highRisk', 'High Risk')}
                </span>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1 text-[10px]">
                  <span className="text-[#64748B] font-bold uppercase tracking-wider block">{t('hotspots.incidentCount', 'Incidents')}</span>
                  <span className="text-[#0B1F4D] font-bold">{hs.count} {t('hotspots.casesSuffix', 'cases')}</span>
                </div>
                <div className="space-y-1 text-[10px] text-right">
                  <span className="text-[#64748B] font-bold uppercase tracking-wider block">{t('hotspots.trendStatus', 'Trend')}</span>
                  <span className="font-bold text-rose-600 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3 text-rose-600" /> +{hs.rate}%
                  </span>
                </div>
              </div>

              {/* Action */}
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-[#E7ECF3] rounded-lg hover:bg-[#F1F5F9] transition-colors text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider cursor-pointer">
                <Map className="w-3 h-3 text-[#C79A2B]" /> {t('hotspots.viewOnMap', 'View Map')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
