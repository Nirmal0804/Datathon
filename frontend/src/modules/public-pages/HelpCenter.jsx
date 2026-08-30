import React, { useState } from 'react';
import { Search, ChevronDown, HelpCircle, Key, LayoutDashboard, FileText, Map, Activity, Network, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

export default function HelpCenter({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  const helpTopics = [
    {
      category: t('public.catGettingStarted', 'Getting Started'),
      categoryKey: 'Getting Started',
      icon: HelpCircle,
      q: t('public.helpQ1', 'How do I access the CrimeIntel platform?'),
      a: t('public.helpA1', 'Navigate to the Login Portal from the top navigation bar. Enter your assigned Karnataka State Police officer credentials or select your designated role to enter the secure environment.'),
    },
    {
      category: t('public.catAccountAccess', 'Account & Access'),
      categoryKey: 'Account & Access',
      icon: Key,
      q: t('public.helpQ2', 'What should I do if I cannot access my account or forgot my password?'),
      a: t('public.helpA2', 'Use the "Forgot Password" link on the login screen to request a secure password recovery dispatch. If your account remains locked or credentials have expired, contact your station system administrator.'),
    },
    {
      category: t('public.catDashboard', 'Dashboard'),
      categoryKey: 'Dashboard',
      icon: LayoutDashboard,
      q: t('public.helpQ3', 'What intelligence can I inspect on the executive dashboard?'),
      a: t('public.helpA3', 'The dashboard provides real-time totals for registered FIRs, arrest compliance rates, chargesheet progress metrics, district rankings, and live security anomaly notifications.'),
    },
    {
      category: t('public.catCasesFir', 'Cases & FIR Management'),
      categoryKey: 'Cases & FIR Management',
      icon: FileText,
      q: t('public.helpQ4', 'How do I register a new FIR or update case investigation status?'),
      a: t('public.helpA4', 'In the Field Officer portal, navigate to FIR Management. Click "Register New FIR" to input complaint details. For existing cases, open the case details to update status between Active, Investigating, and Closed.'),
    },
    {
      category: t('public.catCrimeMaps', 'Crime Maps'),
      categoryKey: 'Crime Maps',
      icon: Map,
      q: t('public.helpQ5', 'How do I filter incident markers and hotspots on the Crime Map?'),
      a: t('public.helpA5', 'Use the GIS Sidebar to filter by district, police station jurisdiction, crime category, or severity level. Toggle heatmap layers, precinct markers, and timeline playback sliders at the bottom of the map.'),
    },
    {
      category: t('public.catAnalytics', 'Analytics'),
      categoryKey: 'Analytics',
      icon: Activity,
      q: t('public.helpQ6', 'How does ML hotspot detection and crime risk index calculation work?'),
      a: t('public.helpA6', 'Hotspot detection clusters incidents using spatio-temporal algorithms, while the composite crime risk index weighs incident volume, chargesheet completion speed, and offense severity.'),
    },
    {
      category: t('public.catNetworkAnalysis', 'Network Analysis'),
      categoryKey: 'Network Analysis',
      icon: Network,
      q: t('public.helpQ7', 'How are criminal entity associations and syndicate graphs structured?'),
      a: t('public.helpA7', 'Network graphs connect suspects sharing co-accused FIR filings, common jurisdiction ties, and syndicate memberships, illustrating gang hierarchies and centrality scores.'),
    },
    {
      category: t('public.catAlertsFeeds', 'Alerts & Feeds'),
      categoryKey: 'Alerts & Feeds',
      icon: Bell,
      q: t('public.helpQ8', 'What triggers automated security and anomaly alerts?'),
      a: t('public.helpA8', 'Automated AI anomaly detectors trigger alerts when incident intake frequencies exceed historical baselines, when high-risk repeat offenders are flagged, or when system health metrics fluctuate.'),
    },
  ];

  const categoryList = [
    { key: 'All', label: t('public.catAll', 'All') },
    { key: 'Getting Started', label: t('public.catGettingStarted', 'Getting Started') },
    { key: 'Account & Access', label: t('public.catAccountAccess', 'Account & Access') },
    { key: 'Dashboard', label: t('public.catDashboard', 'Dashboard') },
    { key: 'Cases & FIR Management', label: t('public.catCasesFir', 'Cases & FIR Management') },
    { key: 'Crime Maps', label: t('public.catCrimeMaps', 'Crime Maps') },
    { key: 'Analytics', label: t('public.catAnalytics', 'Analytics') },
    { key: 'Network Analysis', label: t('public.catNetworkAnalysis', 'Network Analysis') },
    { key: 'Alerts & Feeds', label: t('public.catAlertsFeeds', 'Alerts & Feeds') },
  ];

  const filteredTopics = helpTopics.filter((topic) => {
    const matchesCat = selectedCategory === 'All' || topic.categoryKey === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      topic.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <InfoPageLayout
      title={t('public.helpCenterTitle', 'Help Center')}
      category={t('nav.support', 'Support')}
      description={t('public.helpCenterSubtitle', 'Quick answers, procedural guidance, and operational tutorials for using the CrimeIntel intelligence platform.')}
      activeRoute="/help"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Search Toolbar */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('public.helpSearchPlaceholder', 'Search help topics by question, category, or workflow...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-[#F8F9FB] border border-[#E7ECF3] text-xs sm:text-sm font-semibold text-[#0F172A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {categoryList.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat.key
                    ? 'bg-[#0B1F4D] text-white shadow-xs'
                    : 'bg-[#F8F9FB] text-[#64748B] hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-3">
          {filteredTopics.length === 0 ? (
            <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-12 text-center text-xs font-bold text-[#64748B]">
              {t('public.noHelpFound', 'No help topics found matching')} "{searchQuery}".
            </div>
          ) : (
            filteredTopics.map((topic, index) => {
              const isOpen = openIndex === index;
              const Icon = topic.icon;
              return (
                <div
                  key={topic.q}
                  className="bg-white border border-[#E7ECF3] rounded-[16px] overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#F8F9FB]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#C79A2B]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">{topic.category}</span>
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">{topic.q}</h3>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0B1F4D]' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-[#F1F5F9] bg-[#F8F9FB]/30 px-5 py-4"
                      >
                        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                          {topic.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

      </div>
    </InfoPageLayout>
  );
}

