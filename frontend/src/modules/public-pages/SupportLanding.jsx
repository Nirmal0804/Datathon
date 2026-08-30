import React from 'react';
import { Key, LayoutDashboard, Database, ShieldAlert, ArrowRight, Mail } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

export default function SupportLanding({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();

  const supportCategories = [
    {
      title: t('public.suppCat1Title', 'Account & Access Support'),
      desc: t('public.suppCat1Desc', 'Assistance with portal authentication, officer password resets, session expiration, and role assignments.'),
      icon: Key,
      topics: [
        t('public.suppCat1Topic1', 'Forgot Password Workflow'),
        t('public.suppCat1Topic2', 'Station/Precinct Transfer'),
        t('public.suppCat1Topic3', 'Role Privilege Adjustments'),
      ],
      action: t('public.suppCat1Action', 'View Help Guide'),
      route: 'public-help',
    },
    {
      title: t('public.suppCat2Title', 'Platform & Module Support'),
      desc: t('public.suppCat2Desc', 'Guidance on operating the Crime Map, FIR records explorer, hotspot cluster analysis, and reports.'),
      icon: LayoutDashboard,
      topics: [
        t('public.suppCat2Topic1', 'Interactive Map Filters'),
        t('public.suppCat2Topic2', 'FIR Status Updates'),
        t('public.suppCat2Topic3', 'Generating PDF Reports'),
      ],
      action: t('public.suppCat2Action', 'Browse Documentation'),
      route: 'public-documentation',
    },
    {
      title: t('public.suppCat3Title', 'Data & Incident Inquiries'),
      desc: t('public.suppCat3Desc', 'Resolving questions concerning missing FIR intakes, district aggregations, or date-range filter logic.'),
      icon: Database,
      topics: [
        t('public.suppCat3Topic1', 'Filter Query Troubleshooting'),
        t('public.suppCat3Topic2', 'District Boundary Data'),
        t('public.suppCat3Topic3', 'Historical Case Trends'),
      ],
      action: t('public.suppCat3Action', 'Read FAQs'),
      route: 'public-faqs',
    },
    {
      title: t('public.suppCat4Title', 'Security & Telemetry Concerns'),
      desc: t('public.suppCat4Desc', 'Immediate reporting channels for suspicious login notifications, unauthorized token use, or audit flags.'),
      icon: ShieldAlert,
      topics: [
        t('public.suppCat4Topic1', 'Suspicious Activity Reports'),
        t('public.suppCat4Topic2', 'Device Security Policies'),
        t('public.suppCat4Topic3', 'Audit Trail Inquiries'),
      ],
      action: t('public.suppCat4Action', 'Security Guidelines'),
      route: 'public-security-guidelines',
    },
  ];

  return (
    <InfoPageLayout
      title={t('public.supportLandingTitle', 'Support Center')}
      category={t('nav.support', 'Support')}
      description={t('public.supportLandingSubtitle', 'Get assistance with account access, operational workflows, intelligence data verification, and platform technical support.')}
      activeRoute="/support"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Support Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {supportCategories.map((cat) => {
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
                    {cat.topics.map((topicItem) => (
                      <li key={topicItem} className="text-xs text-[#64748B] flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C79A2B]" />
                        {topicItem}
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
            <h3 className="text-base font-extrabold text-[#0F172A]">{t('public.stillNeedAssistance', 'Still need assistance?')}</h3>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {t('public.stillNeedAssistanceDesc', 'Submit an operational support inquiry to your designated police system desk.')}
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('public-contact-support')}
            className="px-5 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#153E75] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Mail className="w-4 h-4 text-[#C79A2B]" />
            <span>{t('nav.contactSupport', 'Contact Support')}</span>
          </button>
        </div>

      </div>
    </InfoPageLayout>
  );
}

