import React from 'react';
import { Key, LayoutDashboard, Database, ShieldAlert, ArrowRight, Mail } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

const SUPPORT_CATEGORIES = [
  {
    title: 'Account & Access Support',
    desc: 'Assistance with portal authentication, officer password resets, session expiration, and role assignments.',
    icon: Key,
    topics: ['Forgot Password Workflow', 'Station/Precinct Transfer', 'Role Privilege Adjustments'],
    action: 'View Help Guide',
    route: 'public-help',
  },
  {
    title: 'Platform & Module Support',
    desc: 'Guidance on operating the Crime Map, FIR records explorer, hotspot cluster analysis, and reports.',
    icon: LayoutDashboard,
    topics: ['Interactive Map Filters', 'FIR Status Updates', 'Generating PDF Reports'],
    action: 'Browse Documentation',
    route: 'public-documentation',
  },
  {
    title: 'Data & Incident Inquiries',
    desc: 'Resolving questions concerning missing FIR intakes, district aggregations, or date-range filter logic.',
    icon: Database,
    topics: ['Filter Query Troubleshooting', 'District Boundary Data', 'Historical Case Trends'],
    action: 'Read FAQs',
    route: 'public-faqs',
  },
  {
    title: 'Security & Telemetry Concerns',
    desc: 'Immediate reporting channels for suspicious login notifications, unauthorized token use, or audit flags.',
    icon: ShieldAlert,
    topics: ['Suspicious Activity Reports', 'Device Security Policies', 'Audit Trail Inquiries'],
    action: 'Security Guidelines',
    route: 'public-security-guidelines',
  },
];

export default function SupportLanding({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();

  return (
    <InfoPageLayout
      title={t('nav.support', 'Support Center')}
      category={t('nav.support', 'Support')}
      description={t('public.contactSupportSubtitle', 'Get assistance with account access, operational workflows, intelligence data verification, and platform technical support.')}
      activeRoute="/support"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Support Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SUPPORT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-xs flex flex-col justify-between hover:border-[#0B1F4D]/25 transition-all">
                <div>
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#C79A2B]" />
                    </div>
                    <h2 className="text-base font-extrabold text-[#0F172A]">{cat.title}</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    {cat.topics.map((t) => (
                      <li key={t} className="text-xs text-[#64748B] flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C79A2B]" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate(cat.route)}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D] hover:text-[#C79A2B] transition-colors cursor-pointer group"
                >
                  <span>{cat.action}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Links Banner */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#0F172A]">Still need assistance?</h3>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Submit an operational support inquiry to your designated police system desk.
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('public-contact-support')}
            className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#153E75] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Mail className="w-4 h-4 text-[#C79A2B]" />
            <span>Contact Support</span>
          </button>
        </div>

      </div>
    </InfoPageLayout>
  );
}
