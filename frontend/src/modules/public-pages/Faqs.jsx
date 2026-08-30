import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoPageLayout from './components/InfoPageLayout';

const FAQS = [
  {
    q: 'What is CrimeIntel?',
    a: 'CrimeIntel is a secure AI-driven crime analytics and operational intelligence system built for the Karnataka State Police. It unifies FIR intake records, geospatial mapping, hotspot clustering, predictive time-series forecasting, and criminal syndicate network analysis.',
  },
  {
    q: 'Who is the platform intended for?',
    a: 'The platform serves verified Karnataka Police personnel across three primary roles: Field Officers (for daily precinct case management and FIR intakes), Intelligence Analysts (for geospatial modeling, forecasting, and report generation), and System Administrators (for user rosters, role permissions, and security audit oversight).',
  },
  {
    q: 'What can I see on the dashboard?',
    a: 'The dashboard provides aggregate state-level totals for registered FIRs, arrest rates, chargesheet progress percentages, district rankings, real-time security anomaly feeds, and recent crime intakes.',
  },
  {
    q: 'How does the Crime Map work?',
    a: 'The Crime Map displays incident markers and precinct telemetry on a dynamic GIS canvas. Users can filter by district, police station, crime category, or severity, toggle hotspot density heatmaps, and use the timeline playback slider to analyze historical trends.',
  },
  {
    q: 'What is Crime Hotspot Detection?',
    a: 'Hotspot detection uses density-based spatial clustering (DBSCAN) algorithms to automatically detect high-density crime clusters across coordinates. It groups related incidents and calculates patrol priority scores for precinct deployment.',
  },
  {
    q: 'What is the Composite Crime Risk Index (CCRI)?',
    a: 'The CCRI is a station-level composite scoring metric that evaluates incident frequency, crime severity weighting, and chargesheet velocity to rank precincts into Critical, High, Medium, and Low risk tiers.',
  },
  {
    q: 'How does crime forecasting work?',
    a: 'The forecasting module models historical daily incident counts to project estimated crime volumes up to 30 days ahead, assisting leadership with forward resource planning and patrol scheduling.',
  },
  {
    q: 'Can I filter crime records?',
    a: 'Yes. All major views support multi-dimensional filtering across districts, police stations, crime categories, case status (Active, Investigating, Closed), and inclusive date ranges.',
  },
  {
    q: 'What is Network Analysis?',
    a: 'Network Analysis visualizes sociocentric criminal syndicates through a force-directed graph canvas. It reveals repeat co-offenders, shared cases, cross-district gang affiliations, and key accused hubs.',
  },
  {
    q: 'How are district comparisons generated?',
    a: 'District intelligence profiles aggregate FIR counts, arrest compliance rates, and crime categories for all 31 districts, enabling side-by-side comparative benchmarking.',
  },
  {
    q: 'What should I do if I cannot log in?',
    a: 'Ensure you are using your official credentials. Use the "Forgot Password" link on the login screen to request recovery, or contact your station administrator if your account has been locked.',
  },
  {
    q: 'How can I report a security issue?',
    a: 'Security concerns, potential account compromises, or abnormal system activity should be reported immediately via the Contact Support page or directly to the cyber command desk.',
  },
  {
    q: 'Where can I find API documentation?',
    a: 'Visit the API Access page for endpoint group details, or open the interactive Swagger OpenAPI documentation directly from the API Access portal.',
  },
];

export default function Faqs({ onNavigate, onLoginClick, role = null }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(
    (faq) =>
      !searchQuery.trim() ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <InfoPageLayout
      title="Frequently Asked Questions"
      category="Support"
      description="Common questions and answers regarding platform capabilities, analytical methodologies, and operational workflows."
      activeRoute="/faqs"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Search Field */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 sm:p-5 shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-[#64748B] shrink-0" />
          <input
            type="text"
            placeholder="Search FAQs by topic or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] px-2 py-1 bg-slate-100 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-12 text-center text-xs font-bold text-[#64748B]">
              No questions found matching "{searchQuery}".
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white border border-[#E7ECF3] rounded-[16px] overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#F8F9FB]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-extrabold text-[#0B1F4D] bg-[#0B1F4D]/5 px-2 py-0.5 rounded border border-[#0B1F4D]/10 shrink-0">
                        Q{idx + 1}
                      </span>
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">{faq.q}</h3>
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
                          {faq.a}
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
