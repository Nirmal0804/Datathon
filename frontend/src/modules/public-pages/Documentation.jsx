import React, { useState } from 'react';
import { BookOpen, FileText, Activity, Shield, Database, Search, Network } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';

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
        title: 'Real-Time Anomaly & Security Alert Feeds',
        desc: 'Automated notification stream highlighting sudden local crime surges, repeat offenders, and priority incidents.',
      },
    ],
  },
  {
    category: 'INTELLIGENCE & INVESTIGATION',
    icon: Network,
    items: [
      {
        title: 'District Intelligence Profiles',
        desc: 'Deep-dive analytical profiles for all 31 Karnataka districts featuring temporal breakdown and crime head categorization.',
      },
      {
        title: 'Sociocentric Criminal Network Analysis',
        desc: 'Force-directed graph canvas mapping co-offender syndicates, shared case connections, and cross-district criminal associations.',
      },
      {
        title: 'Geospatial Timeline Analysis',
        desc: 'Historical playback slider scrubbing through incident developments over custom chronological date windows.',
      },
    ],
  },
  {
    category: 'ANALYTICS & ML ENGINE',
    icon: Activity,
    items: [
      {
        title: 'DBSCAN Geospatial Hotspot Detection',
        desc: 'Pre-computed spatial cluster detection isolating high-density crime epicenters and assigning patrol priorities.',
      },
      {
        title: 'Composite Crime Risk Index (CCRI)',
        desc: 'Station-level multi-factor risk scoring evaluating case volume, chargesheet velocity, and crime severity.',
      },
      {
        title: 'Daily Crime Incident Time-Series Forecasting',
        desc: '30-day forward predictive volume models for statewide and district-level operational resource planning.',
      },
    ],
  },
  {
    category: 'SYSTEM ADMINISTRATION',
    icon: Shield,
    items: [
      {
        title: 'Personnel & User Account Management',
        desc: 'Administering officer access rosters, station assignments, and account status transitions.',
      },
      {
        title: 'Role Permissions & Access Matrix',
        desc: 'Configuring fine-grained authorization scopes and verifying module access gates.',
      },
      {
        title: 'Security Audit Log Auditing',
        desc: 'Reviewing forensic audit streams tracking operator interactions, IP addresses, and sensitive resource queries.',
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
      title="CrimeIntel Documentation"
      category="Resources"
      description="Comprehensive operational guides, analytical methodology overviews, and system documentation for the Karnataka State Police Crime Analytics Platform."
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
            placeholder="Search documentation guides, operational modules, or analytics topics..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none placeholder:text-slate-400"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] px-2 py-1 bg-slate-100 rounded-lg"
            >
              Clear
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
