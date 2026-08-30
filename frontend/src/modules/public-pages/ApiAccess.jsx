import React from 'react';
import { Key, ExternalLink } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { API_BASE_URL, API_ROOT_URL } from '../../services/api';
import { useTranslation } from '../../i18n';

export default function ApiAccess({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();

  const endpointGroups = [
    {
      prefix: '/auth',
      tag: t('public.epGroup1Tag', 'Authentication'),
      method: 'POST',
      desc: t('public.epGroup1Desc', 'Exchange credentials for cryptographically signed JWT Bearer tokens and verify session validity.'),
    },
    {
      prefix: '/dashboard',
      tag: t('public.epGroup2Tag', 'Dashboard Analytics'),
      method: 'GET',
      desc: t('public.epGroup2Desc', 'Retrieve aggregated state-level FIR metrics, arrest rates, chargesheet distributions, and date-bounded summaries.'),
    },
    {
      prefix: '/districts',
      tag: t('public.epGroup3Tag', 'District Intelligence'),
      method: 'GET',
      desc: t('public.epGroup3Desc', 'List all 31 Karnataka districts with transactional metrics and detailed single-district intelligence profiles (/districts/{id}/intelligence).'),
    },
    {
      prefix: '/stations',
      tag: t('public.epGroup4Tag', 'Precinct Telemetry'),
      method: 'GET',
      desc: t('public.epGroup4Desc', 'Query station records, precinct geolocation coordinates, jurisdiction coverage, and localized incident counts.'),
    },
    {
      prefix: '/analytics',
      tag: t('public.epGroup5Tag', 'ML & Predictive Engine'),
      method: 'GET',
      desc: t('public.epGroup5Desc', 'Access pre-computed DBSCAN spatial hotspots (/hotspots), station CCRI risk rankings (/risk-scores), and 30-day volume forecasts (/forecast).'),
    },
    {
      prefix: '/map/field & /map/intelligence',
      tag: t('public.epGroup6Tag', 'Geospatial Telemetry'),
      method: 'GET',
      desc: t('public.epGroup6Desc', 'Stream unified GeoJSON features for incident clustering, CCTV coverage grids, and patrol beat boundaries.'),
    },
    {
      prefix: '/reports',
      tag: t('public.epGroup7Tag', 'Reports & Export Engine'),
      method: 'GET / POST',
      desc: t('public.epGroup7Desc', 'Generate, query, and export structured intelligence dossiers in statutory PDF/CSV formats.'),
    },
    {
      prefix: '/admin',
      tag: t('public.epGroup8Tag', 'Administrative Suite'),
      method: 'GET / POST',
      desc: t('public.epGroup8Desc', 'Manage officer rosters, inspect immutable security audit event streams, and review system component health.'),
    },
  ];

  const openApiDocs = () => {
    window.open(`${API_ROOT_URL}/docs`, '_blank', 'noopener,noreferrer');
  };

  return (
    <InfoPageLayout
      title={t('public.apiAccessTitle', 'API & Developer Access')}
      category={t('nav.resources', 'Resources')}
      description={t('public.apiAccessSubtitle', 'Developer reference for integrating with the CrimeIntel backend REST services and consuming analytical endpoints.')}
      activeRoute="/api-access"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Base Configuration Card */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-5">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.apiEnvSpecsTitle', 'API Environment Specifications')}</h2>
              <p className="text-xs text-[#64748B] font-semibold">{t('public.apiEnvSpecsDesc', 'Production gateway endpoints and protocol standards')}</p>
            </div>
            <button
              onClick={openApiDocs}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#153E75] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C79A2B]" />
              <span>{t('public.interactiveSwaggerBtn', 'Interactive Swagger Docs')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{t('public.baseUrlLabel', 'Base URL')}</span>
              <p className="font-mono text-xs font-bold text-[#0B1F4D] break-all">{API_BASE_URL}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{t('public.apiVersionLabel', 'API Version')}</span>
              <p className="font-mono text-xs font-bold text-[#0F172A]">{t('public.apiVersionVal', 'v1 (JSON format)')}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{t('public.authStandardLabel', 'Authentication Standard')}</span>
              <p className="font-mono text-xs font-bold text-[#0F172A]">{t('public.authStandardVal', 'Authorization: Bearer <JWT>')}</p>
            </div>
          </div>
        </div>

        {/* Authentication Mechanism */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
              <Key className="w-4 h-4 text-[#C79A2B]" />
            </div>
            <h2 className="text-base font-extrabold text-[#0F172A]">{t('public.authReqHeadersTitle', 'Authentication & Request Headers')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.authReqHeadersDesc', 'All protected endpoints require an HTTP Authorization header containing a valid signed JWT Bearer token obtained via the authentication service:')}
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
            <div className="text-slate-400">{t('public.exampleAuthRequest', '// Example authorized HTTP request')}</div>
            <div>GET /api/v1/districts HTTP/1.1</div>
            <div>Host: crimeintel-backend-50044367664.development.catalystappsail.in</div>
            <div className="text-emerald-400">Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
            <div>Accept: application/json</div>
          </div>
        </div>

        {/* Endpoint Catalog */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A]">{t('public.coreEndpointsTitle', 'Core Endpoint Groups')}</h2>
            <p className="text-xs text-[#64748B]">{t('public.coreEndpointsDesc', 'Structured FastAPI routers available on the backend gateway')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpointGroups.map((grp) => (
              <div key={grp.prefix} className="bg-white border border-[#E7ECF3] rounded-[18px] p-5 shadow-xs flex flex-col justify-between hover:border-[#0B1F4D]/20 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold text-[#0B1F4D] bg-[#0B1F4D]/5 px-2 py-0.5 rounded border border-[#0B1F4D]/10">
                      {grp.prefix}
                    </span>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{grp.method}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] mb-1.5">{grp.tag}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed font-medium">{grp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </InfoPageLayout>
  );
}

