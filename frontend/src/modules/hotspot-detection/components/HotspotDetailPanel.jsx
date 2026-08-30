import React from 'react';
import RiskBadge from './RiskBadge';
import TrendBadge from './TrendBadge';
import { Shield, MapPin, Eye, FileText, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function HotspotDetailPanel({ 
  hotspot, 
  onClose, 
  onNavigate,
  role
}) {
  const { t } = useTranslation();
  const isAnalyst = role === 'analyst';

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'Cybercrime': return t('categories.cybercrime', 'Cybercrime');
      case 'Property Theft': return t('categories.propertyTheft', 'Property Theft');
      case 'Violent Crime': return t('categories.violentCrime', 'Violent Crime');
      case 'Financial Fraud': return t('categories.financialFraud', 'Financial Fraud');
      case 'Narcotics': return t('categories.narcotics', 'Narcotics');
      case 'Crime Against Women': return t('categories.crimeAgainstWomen', 'Crime Against Women');
      default: return cat;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'Critical': return t('common.critical', 'Critical');
      case 'High': return t('common.high', 'High');
      case 'Medium': return t('common.medium', 'Medium');
      case 'Low': return t('common.low', 'Low');
      default: return priority;
    }
  };
  
  if (!hotspot) {
    return (
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-8 text-center h-full flex flex-col justify-center items-center text-[#64748B] shadow-sm min-h-[400px]">
        <div className="w-12 h-12 rounded-[16px] bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center mb-3">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-black text-[#0F172A] mb-1">{t('hotspots.selectZoneTitle', 'Select a Hotspot Zone')}</h3>
        <p className="text-xs font-semibold text-[#64748B] max-w-xs">{t('hotspots.selectZoneDesc', 'Click a record in the registry to inspect threat details and recommended patrol activities.')}</p>
      </div>
    );
  }

  const handleViewOnMap = () => {
    localStorage.setItem('selectedMapPosition', JSON.stringify({
      center: [hotspot.latitude, hotspot.longitude],
      zoom: 12
    }));
    onNavigate('map');
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-xs flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-extrabold text-[#0B1F4D] bg-[#0B1F4D]/5 px-2.5 py-0.5 rounded-full border border-[#0B1F4D]/10">{hotspot.hotspotId}</span>
            <h3 className="text-sm font-black text-[#0F172A] mt-1">{hotspot.policeStation}</h3>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-[#F8F9FB] hover:bg-[#E7ECF3] text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close detail panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Card 1: Risk Score & Trend Status */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-xs grid grid-cols-2 gap-4">
        <div className="p-3.5 bg-[#F8F9FB] rounded-[14px] border border-[#E7ECF3]">
          <span className="block text-[10px] text-[#64748B] font-extrabold uppercase tracking-wider mb-1.5">{t('hotspots.riskScore', 'Risk Score')}</span>
          <RiskBadge risk={hotspot.riskLevel} />
        </div>
        <div className="p-3.5 bg-[#F8F9FB] rounded-[14px] border border-[#E7ECF3]">
          <span className="block text-[10px] text-[#64748B] font-extrabold uppercase tracking-wider mb-1.5">{t('hotspots.trendStatus', 'Trend Status')}</span>
          <TrendBadge trend={hotspot.trend} />
        </div>
      </div>

      {/* Card 2: Incident Metrics List */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-xs space-y-3 text-xs">
        <div className="flex justify-between items-center py-1.5 border-b border-[#E7ECF3]/60">
          <span className="text-[#64748B] font-semibold">{t('hotspots.incidentCount', 'Incident Count')}</span>
          <span className="font-mono font-extrabold text-[#0F172A]">{hotspot.crimeCount} {t('hotspots.casesSuffix', 'cases')}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-[#E7ECF3]/60">
          <span className="text-[#64748B] font-semibold">{t('hotspots.dominantCategory', 'Dominant Category')}</span>
          <span className="font-bold text-[#0F172A]">{getCategoryLabel(hotspot.dominantCrime)}</span>
        </div>
        {isAnalyst && hotspot.densityIndex !== undefined && (
          <div className="flex justify-between items-center py-1.5 border-b border-[#E7ECF3]/60">
            <span className="text-[#64748B] font-semibold">{t('hotspots.densityIndex', 'Density Index')}</span>
            <span className="font-mono font-extrabold text-[#0F172A]">{hotspot.densityIndex} /10</span>
          </div>
        )}
        {isAnalyst && hotspot.growthPercentage !== undefined && (
          <div className="flex justify-between items-center py-1.5 border-b border-[#E7ECF3]/60">
            <span className="text-[#64748B] font-semibold">{t('hotspots.growthRate', 'Growth Rate (YoY)')}</span>
            <span className={`font-mono font-extrabold ${hotspot.growthPercentage >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {hotspot.growthPercentage >= 0 ? '+' : ''}{hotspot.growthPercentage}%
            </span>
          </div>
        )}
        <div className="flex justify-between items-center py-1.5 border-b border-[#E7ECF3]/60">
          <span className="text-[#64748B] font-semibold">{t('hotspots.patrolPriority', 'Patrol Priority')}</span>
          <span className="font-extrabold text-rose-600 uppercase text-[11px]">{getPriorityLabel(hotspot.patrolPriority)}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-[#E7ECF3]/60">
          <span className="text-[#64748B] font-semibold">{t('hotspots.districtCenter', 'District Center')}</span>
          <span className="font-bold text-[#0F172A]">{hotspot.district}</span>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span className="text-[#64748B] font-semibold">{t('hotspots.lastIncidentDate', 'Last Incident Date')}</span>
          <span className="font-mono font-bold text-[#0F172A]">{hotspot.lastIncidentDate}</span>
        </div>
      </div>

      {/* Card 3: Active Incident Summary */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-xs space-y-2">
        <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0B1F4D]" /> {t('hotspots.activeIncidentLog', 'Active Incident Log')}
        </h4>
        <div className="p-3.5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-[#0F172A] font-medium text-xs leading-relaxed">
          {hotspot.activitySummary}
        </div>
      </div>

      {/* Card 4: Recommended Action */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-xs space-y-2">
        <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('hotspots.recommendedAction', 'Recommended Action')}
        </h4>
        <div className="p-3.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[14px] text-[#166534] font-bold text-xs leading-relaxed">
          {hotspot.recommendedAction}
        </div>
      </div>

      {/* Card 5: View on Crime Map Button */}
      <button
        onClick={handleViewOnMap}
        className="w-full h-11 rounded-full bg-[#0B1F4D] hover:bg-[#143275] text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <Eye className="w-4 h-4 text-[#C79A2B]" />
        <span>{t('hotspots.viewOnMap', 'View on Crime Map')}</span>
      </button>
    </div>
  );
}
