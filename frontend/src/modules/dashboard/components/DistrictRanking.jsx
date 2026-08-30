import React from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';
import { useTranslation } from '../../../i18n';

const mockTrends = [
  { trend: 'up', value: '12%' },
  { trend: 'down', value: '5%' },
  { trend: 'up', value: '8%' },
  { trend: 'neutral', value: '0%' },
  { trend: 'down', value: '2%' }
];

export default function DistrictRanking({ districtData }) {
  const { t } = useTranslation();
  const topList = (districtData || []).slice(0, 5);
  const maxCount = topList[0]?.count || 1;

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm h-full flex flex-col justify-between hover:border-[#1A2F63]/30 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#C79A2B]/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-[#C79A2B]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider mb-1">
              {t('district.districtRankings', 'District Rankings')}
            </h3>
            <p className="text-xs font-semibold text-[#64748B]">
              {t('dashboard.topActiveDistricts', 'Top 5 Active Districts')}
            </p>
          </div>
        </div>
        <button className="text-[10px] font-bold text-[#0B1F4D] hover:text-[#C79A2B] transition-colors uppercase tracking-widest px-3 py-1.5 bg-[#F8F9FB] hover:bg-[#F1F5F9] rounded-lg cursor-pointer">
          {t('dashboard.viewAll', 'View All')}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {topList.length === 0 ? (
          <EmptyState type="analytics" title={t('district.noMetrics', 'No District Metrics')} message={t('district.noMetricsDesc', 'No district crime metrics found.')} compact={true} />
        ) : (
          topList.map((d, i) => {
            const percentage = (d.count / maxCount) * 100;
            const trendData = mockTrends[i] || mockTrends[0];
            
            return (
              <div key={i} className="group cursor-default py-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-6 h-6 rounded-[8px] flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                      i === 0 ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm' :
                      i === 1 ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm' :
                      i === 2 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' :
                      'bg-[#F8F9FB] text-[#64748B] border border-[#E7ECF3]'
                    }`}>
                      #{i + 1}
                    </div>
                    <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#0B1F4D] transition-colors">
                      {d.district}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Trend Arrow */}
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${
                      trendData.trend === 'up' ? 'text-rose-600' :
                      trendData.trend === 'down' ? 'text-emerald-600' :
                      'text-slate-400'
                    }`}>
                      {trendData.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                       trendData.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
                       <Minus className="w-3 h-3" />}
                      {trendData.value}
                    </div>
                    <span className="text-sm font-black text-[#0B1F4D]">
                      {d.count.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      i === 0 ? 'bg-rose-500' :
                      i === 1 ? 'bg-amber-500' :
                      i === 2 ? 'bg-emerald-500' :
                      'bg-[#0B1F4D]/40'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
