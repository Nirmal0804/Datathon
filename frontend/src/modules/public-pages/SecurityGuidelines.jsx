import React from 'react';
import { Lock, Key, Monitor, Eye, FileDown, AlertTriangle, UserCheck, ShieldCheck, Mail } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

export default function SecurityGuidelines({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();

  const guidelines = [
    {
      num: '01',
      title: t('public.rule1Title', 'Protect Your Credentials & Passwords'),
      desc: t('public.rule1Desc', 'Use strong passwords adhering to departmental complexity policies. Never write down or store credentials on unsecured local drives or sticky notes.'),
      icon: Key,
    },
    {
      num: '02',
      title: t('public.rule2Title', 'Never Share Authentication Tokens'),
      desc: t('public.rule2Desc', 'JWT session tokens are strictly bound to individual officers. Do not export, copy, or transfer tokens across unapproved browser sessions.'),
      icon: Lock,
    },
    {
      num: '03',
      title: t('public.rule3Title', 'Use Authorized Police Accounts Only'),
      desc: t('public.rule3Desc', 'Never log in using another officer’s account or allow unauthorized personnel to operate the console under your credentials.'),
      icon: UserCheck,
    },
    {
      num: '04',
      title: t('public.rule4Title', 'Lock Shared Precinct Workstations'),
      desc: t('public.rule4Desc', 'Always lock terminal screens (Win+L / Ctrl+Alt+L) or log out of the portal when stepping away from station command consoles.'),
      icon: Monitor,
    },
    {
      num: '05',
      title: t('public.rule5Title', 'Verify Sensitive & High-Impact Actions'),
      desc: t('public.rule5Desc', 'Double-check case identifiers, suspect records, and chargesheet modifications before confirming administrative or status updates.'),
      icon: ShieldCheck,
    },
    {
      num: '06',
      title: t('public.rule6Title', 'Handle Crime Data Responsibly'),
      desc: t('public.rule6Desc', 'All incident records, suspect profiles, and hotspot analytics are confidential law enforcement materials protected under operational guidelines.'),
      icon: Eye,
    },
    {
      num: '07',
      title: t('public.rule7Title', 'Avoid Unnecessary Bulk Data Exports'),
      desc: t('public.rule7Desc', 'Only export CSV summaries or PDF reports when explicitly required for official court or command briefings. Store files on encrypted departmental media.'),
      icon: FileDown,
    },
    {
      num: '08',
      title: t('public.rule8Title', 'Report Suspicious Activity Promptly'),
      desc: t('public.rule8Desc', 'Immediately report unexpected password reset notifications, unknown session locations, or anomalous telemetry to the system admin.'),
      icon: AlertTriangle,
    },
  ];

  return (
    <InfoPageLayout
      title={t('public.securityGuidelinesTitle', 'Security Guidelines')}
      category={t('nav.support', 'Support')}
      description={t('public.securityGuidelinesSubtitle', 'Operational cybersecurity best practices, workstation safety rules, and credential handling requirements for authorized platform users.')}
      lastUpdated={t('public.august2026', 'August 2026')}
      activeRoute="/security-guidelines"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.num} className="bg-white border border-[#E7ECF3] rounded-[18px] p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-[#0B1F4D]/25 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#C79A2B]" />
                    </div>
                    <span className="font-mono font-extrabold text-xs text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                      {t('public.ruleBadge', 'RULE')} {g.num}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0F172A] mb-1.5">{g.title}</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{g.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report Security Concern Banner */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">{t('public.reportConcernTitle', 'Report a Security Concern')}</h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                {t('public.reportConcernDesc', 'Observed potential account tampering, suspicious IP activity, or compromised officer credentials?')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('public-contact-support')}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Mail className="w-4 h-4 text-white" />
            <span>{t('public.notifySecurityBtn', 'Notify Security Team')}</span>
          </button>
        </div>

      </div>
    </InfoPageLayout>
  );
}

