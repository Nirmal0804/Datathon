import React, { useState } from 'react';
import { BookOpen, FileText, Activity, Shield, Database, Search, Network } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

const DOC_SECTIONS = [
  {
    category: 'GETTING STARTED',
    icon: BookOpen,
    items: [
      {
        title: 'Platform Architecture & Role Overview',
        desc: 'Understanding the tri-role operational framework (Field Officer, Intelligence Analyst, Administrator) and precinct boundaries.',
      },
      {
        title: 'Authentication & Session Token Management',
        desc: 'Navigating the secure login portal, password reset workflows, and symmetric JWT token persistence.',
      },
      {
        title: 'Executive Dashboard Navigation',
        desc: 'Reading high-level KPI cards, real-time security anomaly feeds, and multi-district summary metrics.',
      },
    ],
  },
  {
    category: 'CORE OPERATIONS',
    icon: FileText,
    items: [
      {
        title: 'Field Officer FIR Management',
        desc: 'Registering new precinct FIR complaints, updating case lifecycle stages (Active, Investigating, Closed), and inspecting records.',
      },
      {
        title: 'Assigned Cases Workflow',
        desc: 'Delegated investigation rosters tailored specifically for precinct officers with evidence tracking.',
      },
      {
        title: 'Karnataka Geospatial Crime Map',
        desc: 'Interactive Google GIS canvas mapping incident coordinates, police station telemetry, boundary choropleths, and heatmap layers.',
      },
      {
        title: 'Hotspot Detection & Risk Forecasting',
        desc: 'Spatial-temporal DBSCAN and kernel density clustering to isolate repeat high-density incident corridors.',
      },
    ],
  },
  {
    category: 'ADVANCED ANALYTICS & AI',
    icon: Activity,
    items: [
      {
        title: 'Graph Neural Network Analysis',
        desc: 'Co-offender graph representations revealing criminal syndicate topology and degree centrality metrics.',
      },
      {
        title: 'Multi-Factor Socio-Economic Correlation',
        desc: 'Regression and correlation matrix modeling between economic indicators and incident recurrence rates.',
      },
      {
        title: 'Predictive Risk Models & Anomaly Triggers',
        desc: 'Automated statistical anomaly detection flagging spikes exceeding baseline thresholds.',
      },
    ],
  },
  {
    category: 'ADMINISTRATION & COMPLIANCE',
    icon: Shield,
    items: [
      {
        title: 'Role-Based Access Control (RBAC) Policies',
        desc: 'Granular permissions matrix determining operational boundaries across officer roles.',
      },
      {
        title: 'Audit Logging & Compliance Traceability',
        desc: 'Comprehensive tamper-evident logging of administrative actions, data exports, and login sessions.',
      },
      {
        title: 'System Health & Resource Telemetry',
        desc: 'Monitoring microservice latency, PostgreSQL connection pools, and Redis cache hit ratios.',
      },
    ],
  },
  {
    category: 'DEVELOPER API INTEGRATION',
    icon: Database,
    items: [
      {
        title: 'REST API Overview & Bearer Authentication',
        desc: 'Consuming FastAPI v1 endpoints with Bearer token authentication and structured Pydantic payload models.',
      },
      {
        title: 'Endpoint Reference & OpenAPI Schema',
        desc: 'Documentation for /dashboard, /districts, /stations, /analytics, and /admin endpoints.',
      },
    ],
  },
];

export default function Documentation({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredSections = DOC_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.filter(
      (it) =>
        it.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        it.desc.toLowerCase().includes(filterQuery.toLowerCase()) ||
        sec.category.toLowerCase().includes(filterQuery.toLowerCase())
    ),
  })).filter((sec) => sec.items.length > 0);

  return (
    <InfoPageLayout
      title={t('public.documentationTitle', 'Platform Documentation')}
      category={t('nav.resources', 'Resources')}
      description={t('public.documentationSubtitle', 'Comprehensive operational guides, analytical methodology overviews, and system documentation for the Karnataka State Police Crime Analytics Platform.')}
      activeRoute="/documentation"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Search Toolbar */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 sm:p-5 shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-[#64748B] shrink-0" />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder', 'Search documentation guides, operational modules, or analytics topics...')}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none placeholder:text-slate-400"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] px-2 py-1 bg-slate-100 rounded-lg cursor-pointer"
            >
              {t('common.clear', 'Clear')}
            </button>
          )}
        </div>

        {/* Documentation Sections */}
        <div className="space-y-8">
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.category} className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-[#E7ECF3] pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#C79A2B]" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-black text-[#0B1F4D] uppercase tracking-wider">
                    {sec.category}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.items.map((item) => (
                    <div
                      key={item.title}
                      className="bg-white border border-[#E7ECF3] rounded-[18px] p-5 shadow-xs hover:border-[#0B1F4D]/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0F172A] mb-1.5">{item.title}</h3>
                        <p className="text-xs text-[#64748B] leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </InfoPageLayout>
  );
}
