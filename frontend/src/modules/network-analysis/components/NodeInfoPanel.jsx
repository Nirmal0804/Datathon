import React from 'react';
import { X, ShieldAlert, MapPin, Link2, FileText, Clock } from 'lucide-react';
import { MOCK_OFFENDERS_DOSSIERS } from '../../../mock/offenderData';
import { useTranslation } from '../../../i18n';

const RISK_STYLES = {
  Critical: 'bg-rose-50 text-rose-600 border-rose-200',
  High:     'bg-orange-50 text-orange-600 border-orange-200',
  Medium:   'bg-amber-50 text-amber-600 border-amber-200',
  Low:      'bg-emerald-50 text-emerald-600 border-emerald-200',
};

function InfoRow({ label, value, valueClass = 'text-[#0B1F4D]' }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#F8F9FB] last:border-0 text-xs">
      <span className="font-semibold text-[#64748B]">{label}</span>
      <span className={`font-bold text-right max-w-[60%] ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function NodeInfoPanel({ node, onClose, onSelectNode }) {
  const { t } = useTranslation();
  if (!node) return null;

  const offenderDossier = node.type === 'Accused' ? MOCK_OFFENDERS_DOSSIERS[node.id] : null;

  const nodeTypeColor = {
    'Accused':        '#EF4444',
    'Case':           '#818CF8',
    'Police Station': '#60A5FA',
    'District':       '#A78BFA',
    'Crime Category': '#94A3B8',
  }[node.type] || '#64748B';

  const getNodeTypeLabel = (type) => {
    switch (type) {
      case 'Accused': return t('network.associate', 'Accused');
      case 'Case': return t('fir.title', 'Case');
      case 'Police Station': return t('common.station', 'Police Station');
      case 'District': return t('common.district', 'District');
      case 'Crime Category': return t('common.category', 'Crime Category');
      default: return type;
    }
  };

  const getRiskLabel = (risk) => {
    switch (risk) {
      case 'Critical': return t('common.critical', 'Critical');
      case 'High': return t('common.high', 'High');
      case 'Medium': return t('common.medium', 'Medium');
      case 'Low': return t('common.low', 'Low');
      default: return risk;
    }
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0B1F4D]/10 rounded-[8px] flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-[#C79A2B]" />
          </div>
          <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">{t('network.nodeInspector', 'Entity Inspector')}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[8px] flex items-center justify-center text-[#64748B] hover:text-[#0B1F4D] hover:border-[#1A2F63]/30 transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Node Profile */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center font-black text-sm border-2"
          style={{ borderColor: nodeTypeColor, color: nodeTypeColor, background: nodeTypeColor + '15' }}
        >
          {node.label.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h4 className="font-black text-[#0B1F4D] text-sm leading-tight">{node.label}</h4>
          <span
            className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
            style={{ color: nodeTypeColor, background: nodeTypeColor + '15', borderColor: nodeTypeColor + '40' }}
          >
            {getNodeTypeLabel(node.type)}
          </span>
        </div>
      </div>

      {/* ── ACCUSED PANEL ── */}
      {node.type === 'Accused' && offenderDossier && (
        <div className="space-y-4">
          {/* Stats mini-row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t('fir.title', 'Cases'),    value: offenderDossier.totalCases   },
              { label: t('district.priorArrests', 'Arrests'),  value: offenderDossier.totalArrests },
              { label: t('district.activeWarrants', 'Warrants'), value: offenderDossier.activeWarrants },
            ].map((s, i) => (
              <div key={i} className="text-center p-2.5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[12px]">
                <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-0.5">{s.label}</div>
                <div className="text-lg font-black text-[#0B1F4D]">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Risk badge */}
          {node.risk && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">{t('district.threat', 'Threat Level')}</span>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${RISK_STYLES[node.risk] || ''}`}>
                {getRiskLabel(node.risk)}
              </span>
            </div>
          )}

          {/* Details */}
          <div className="space-y-0">
            <InfoRow label={t('cases.jurisdiction', 'District Jurisdiction')} value={offenderDossier.lastKnownDistrict} />
            <InfoRow label={t('common.station', 'Police Station')} value={node.station || '—'} />
          </div>

          {/* Connected Associates */}
          {offenderDossier.knownAssociates?.length > 0 && (
            <div>
              <div className="text-[10px] font-black text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Link2 className="w-3 h-3 text-[#C79A2B]" />
                {t('network.knownAssociatesNetwork', 'Connected Associates')}
              </div>
              <div className="space-y-1.5">
                {offenderDossier.knownAssociates.map((assoc, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectNode({ id: assoc.name, label: assoc.name, type: 'Accused' })}
                    className="w-full p-2.5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[10px] text-left hover:border-[#1A2F63]/30 hover:bg-white transition-all flex justify-between items-center text-xs cursor-pointer"
                  >
                    <span className="font-bold text-[#0B1F4D]">{assoc.name}</span>
                    <span className="text-[#64748B] text-[10px] font-semibold">{assoc.relationship}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CASE PANEL ── */}
      {node.type === 'Case' && (
        <div className="space-y-0">
          <InfoRow label={t('fir.firNumber', 'FIR ID')} value={node.id} valueClass="text-violet-600 font-mono" />
          <InfoRow label={t('cases.crimeType', 'Crime Type')} value={node.category || 'Theft'} />
          <InfoRow label={t('fir.filingDate', 'Intake Date')} value={node.date || '2026-07-22'} />
          <InfoRow label={t('cases.investigator', 'Investigator')} value={node.officer || 'Inspector Patil'} />
          <div className="mt-3 p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[12px] text-[11px] font-semibold text-[#64748B] leading-relaxed">
            {t('network.selectNodePrompt', 'Case files link co-defendants through mobile geolocation clusters.')}
          </div>
        </div>
      )}

      {/* ── POLICE STATION PANEL ── */}
      {node.type === 'Police Station' && (
        <div className="space-y-0">
          <InfoRow label={t('common.station', 'Station Name')} value={node.id} />
          <InfoRow label={t('common.district', 'District Zone')} value={node.district || 'Bengaluru City'} />
          <InfoRow label={t('network.connections', 'Connected Cases')} value="5 active" valueClass="text-violet-600" />
          <InfoRow label={t('district.activeMonitoring', 'Offenders Monitored')} value="8 monitored" valueClass="text-rose-600" />
        </div>
      )}

      {/* ── DISTRICT PANEL ── */}
      {node.type === 'District' && (
        <div className="space-y-0">
          <InfoRow label={t('cases.jurisdiction', 'Jurisdiction')} value={node.id} />
          <InfoRow label={t('district.stationPerformance', 'Active Stations')} value="12" />
          <InfoRow label={t('dashboard.activeCases', 'Open FIRs')} value="87" valueClass="text-rose-600" />
        </div>
      )}

    </div>
  );
}
