import React from 'react';
import { Key, ExternalLink } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { API_BASE_URL, API_ROOT_URL } from '../../services/api';

const ENDPOINT_GROUPS = [
  {
    prefix: '/auth',
    tag: 'Authentication',
    method: 'POST',
    desc: 'Exchange credentials for cryptographically signed JWT Bearer tokens and verify session validity.',
  },
  {
    prefix: '/dashboard',
    tag: 'Dashboard Analytics',
    method: 'GET',
    desc: 'Retrieve aggregated state-level FIR metrics, arrest rates, chargesheet distributions, and date-bounded summaries.',
  },
  {
    prefix: '/districts',
    tag: 'District Intelligence',
    method: 'GET',
    desc: 'List all 31 Karnataka districts with transactional metrics and detailed single-district intelligence profiles (/districts/{id}/intelligence).',
  },
  {
    prefix: '/stations',
    tag: 'Precinct Telemetry',
    method: 'GET',
    desc: 'Query station records, precinct geolocation coordinates, jurisdiction coverage, and localized incident counts.',
  },
  {
    prefix: '/analytics',
    tag: 'ML & Predictive Engine',
    method: 'GET',
    desc: 'Access pre-computed DBSCAN spatial hotspots (/hotspots), station CCRI risk rankings (/risk-scores), and 30-day volume forecasts (/forecast).',
  },
  {
    prefix: '/map/field & /map/intelligence',
    tag: 'Geospatial Telemetry',
    method: 'GET',
    desc: 'Fetch coordinate-mapped incident locations, hotspot radius polygons, and regional boundaries for GIS rendering.',
  },
  {
    prefix: '/network',
    tag: 'Criminal Relationship Graph',
    method: 'GET',
    desc: 'Fetch sociocentric co-offender network nodes, cross-district syndicate edges, and query entity associations (/network/search).',
  },
  {
    prefix: '/admin',
    tag: 'System Administration',
    method: 'GET / POST / PUT',
    desc: 'Manage personnel rosters (/admin/users), configure RBAC role scopes (/admin/roles), and query system audit event logs (/admin/audit).',
  },
];

export default function ApiAccess({ onNavigate, onLoginClick, role = null }) {
  const openApiDocs = () => {
    window.open(`${API_ROOT_URL}/docs`, '_blank', 'noopener,noreferrer');
  };

  return (
    <InfoPageLayout
      title="API Access"
      category="Resources"
      description="Programmatic integration and RESTful API access guidelines for the CrimeIntel platform."
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
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">API Environment Specifications</h2>
              <p className="text-xs text-[#64748B] font-semibold">Production gateway endpoints and protocol standards</p>
            </div>
            <button
              onClick={openApiDocs}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1F4D] hover:bg-[#153E75] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C79A2B]" />
              <span>Interactive Swagger Docs</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Base URL</span>
              <p className="font-mono text-xs font-bold text-[#0B1F4D] break-all">{API_BASE_URL}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">API Version</span>
              <p className="font-mono text-xs font-bold text-[#0F172A]">v1 (JSON format)</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Authentication Standard</span>
              <p className="font-mono text-xs font-bold text-[#0F172A]">Authorization: Bearer &lt;JWT&gt;</p>
            </div>
          </div>
        </div>

        {/* Authentication Mechanism */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
              <Key className="w-4 h-4 text-[#C79A2B]" />
            </div>
            <h2 className="text-base font-extrabold text-[#0F172A]">Authentication & Request Headers</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            All protected endpoints require an HTTP Authorization header containing a valid signed JWT Bearer token obtained via the authentication service:
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
            <div className="text-slate-400">// Example authorized HTTP request</div>
            <div>GET /api/v1/districts HTTP/1.1</div>
            <div>Host: crimeintel-backend-50044367664.development.catalystappsail.in</div>
            <div className="text-emerald-400">Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
            <div>Accept: application/json</div>
          </div>
        </div>

        {/* Endpoint Catalog */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A]">Core Endpoint Groups</h2>
            <p className="text-xs text-[#64748B]">Structured FastAPI routers available on the backend gateway</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENDPOINT_GROUPS.map((grp) => (
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
