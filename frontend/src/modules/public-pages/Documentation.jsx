import React, { useState } from 'react';
import { BookOpen, FileText, Activity, Shield, Database, Search } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

export default function Documentation({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();
  const [filterQuery, setFilterQuery] = useState('');

  const docSections = [
    {
      category: t('public.docCatGettingStarted', 'GETTING STARTED'),
      icon: BookOpen,
      items: [
        {
          title: t('public.docItem1_1Title', 'Platform Architecture & Role Overview'),
          desc: t('public.docItem1_1Desc', 'Understanding the tri-role operational framework (Field Officer, Intelligence Analyst, Administrator) and precinct boundaries.'),
        },
        {
          title: t('public.docItem1_2Title', 'Authentication & Session Token Management'),
          desc: t('public.docItem1_2Desc', 'Navigating the secure login portal, password reset workflows, and symmetric JWT token persistence.'),
        },
        {
          title: t('public.docItem1_3Title', 'Executive Dashboard Navigation'),
          desc: t('public.docItem1_3Desc', 'Reading high-level KPI cards, real-time security anomaly feeds, and multi-district summary metrics.'),
        },
      ],
    },
    {
      category: t('public.docCatCoreOperations', 'CORE OPERATIONS'),
      icon: FileText,
      items: [
        {
          title: t('public.docItem2_1Title', 'Field Officer FIR Management'),
          desc: t('public.docItem2_1Desc', 'Registering new precinct FIR complaints, updating case lifecycle stages (Active, Investigating, Closed), and inspecting records.'),
        },
        {
          title: t('public.docItem2_2Title', 'Assigned Cases Workflow'),
          desc: t('public.docItem2_2Desc', 'Delegated investigation rosters tailored specifically for precinct officers with evidence tracking.'),
        },
        {
          title: t('public.docItem2_3Title', 'Karnataka Geospatial Crime Map'),
          desc: t('public.docItem2_3Desc', 'Interactive Google GIS canvas mapping incident coordinates, police station telemetry, boundary choropleths, and heatmap layers.'),
        },
        {
          title: t('public.docItem2_4Title', 'Hotspot Detection & Risk Forecasting'),
          desc: t('public.docItem2_4Desc', 'Spatial-temporal DBSCAN and kernel density clustering to isolate repeat high-density incident corridors.'),
        },
      ],
    },
    {
      category: t('public.docCatAnalytics', 'ADVANCED ANALYTICS & AI'),
      icon: Activity,
      items: [
        {
          title: t('public.docItem3_1Title', 'Graph Neural Network Analysis'),
          desc: t('public.docItem3_1Desc', 'Co-offender graph representations revealing criminal syndicate topology and degree centrality metrics.'),
        },
        {
          title: t('public.docItem3_2Title', 'Multi-Factor Socio-Economic Correlation'),
          desc: t('public.docItem3_2Desc', 'Regression and correlation matrix modeling between economic indicators and incident recurrence rates.'),
        },
        {
          title: t('public.docItem3_3Title', 'Predictive Risk Models & Anomaly Triggers'),
          desc: t('public.docItem3_3Desc', 'Automated statistical anomaly detection flagging spikes exceeding baseline thresholds.'),
        },
      ],
    },
    {
      category: t('public.docCatAdmin', 'ADMINISTRATION & COMPLIANCE'),
      icon: Shield,
      items: [
        {
          title: t('public.docItem4_1Title', 'Role-Based Access Control (RBAC) Policies'),
          desc: t('public.docItem4_1Desc', 'Granular permissions matrix determining operational boundaries across officer roles.'),
        },
        {
          title: t('public.docItem4_2Title', 'Audit Logging & Compliance Traceability'),
          desc: t('public.docItem4_2Desc', 'Comprehensive tamper-evident logging of administrative actions, data exports, and login sessions.'),
        },
        {
          title: t('public.docItem4_3Title', 'System Health & Resource Telemetry'),
          desc: t('public.docItem4_3Desc', 'Monitoring microservice latency, PostgreSQL connection pools, and Redis cache hit ratios.'),
        },
      ],
    },
    {
      category: t('public.docCatApi', 'DEVELOPER API INTEGRATION'),
      icon: Database,
      items: [
        {
          title: t('public.docItem5_1Title', 'REST API Overview & Bearer Authentication'),
          desc: t('public.docItem5_1Desc', 'Consuming FastAPI v1 endpoints with Bearer token authentication and structured Pydantic payload models.'),
        },
        {
          title: t('public.docItem5_2Title', 'Endpoint Reference & OpenAPI Schema'),
          desc: t('public.docItem5_2Desc', 'Documentation for /dashboard, /districts, /stations, /analytics, and /admin endpoints.'),
        },
      ],
    },
  ];

  const filteredSections = docSections.map((sec) => ({
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
            placeholder={t('public.docSearchPlaceholder', 'Search documentation guides, operational modules, or analytics topics...')}
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

