import React from 'react';
import { Lock, Key, Monitor, Eye, FileDown, AlertTriangle, UserCheck, ShieldCheck, Mail } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

const GUIDELINES = [
  {
    num: '01',
    title: 'Protect Your Credentials & Passwords',
    desc: 'Use strong passwords adhering to departmental complexity policies. Never write down or store credentials on unsecured local drives or sticky notes.',
    icon: Key,
  },
  {
    num: '02',
    title: 'Never Share Authentication Tokens',
    desc: 'JWT session tokens are strictly bound to individual officers. Do not export, copy, or transfer tokens across unapproved browser sessions.',
    icon: Lock,
  },
  {
    num: '03',
    title: 'Use Authorized Police Accounts Only',
    desc: 'Never log in using another officer’s account or allow unauthorized personnel to operate the console under your credentials.',
    icon: UserCheck,
  },
  {
    num: '04',
    title: 'Lock Shared Precinct Workstations',
    desc: 'Always lock terminal screens (Win+L / Ctrl+Alt+L) or log out of the portal when stepping away from station command consoles.',
    icon: Monitor,
  },
  {
    num: '05',
    title: 'Verify Sensitive & High-Impact Actions',
    desc: 'Double-check case identifiers, suspect records, and chargesheet modifications before confirming administrative or status updates.',
    icon: ShieldCheck,
  },
  {
    num: '06',
    title: 'Handle Crime Data Responsibly',
    desc: 'All incident records, suspect profiles, and hotspot analytics are confidential law enforcement materials protected under operational guidelines.',
    icon: Eye,
  },
  {
    num: '07',
    title: 'Avoid Unnecessary Bulk Data Exports',
    desc: 'Only export CSV summaries or PDF reports when explicitly required for official court or command briefings. Store files on encrypted departmental media.',
    icon: FileDown,
  },
  {
    num: '08',
    title: 'Report Suspicious Activity Promptly',
    desc: 'Immediately report unexpected password reset notifications, unknown session locations, or anomalous telemetry to the system admin.',
    icon: AlertTriangle,
  },
];

export default function SecurityGuidelines({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();

  return (
    <InfoPageLayout
      title={t('public.securityGuidelinesTitle', 'Security Guidelines')}
      category={t('nav.support', 'Support')}
      description={t('public.securityGuidelinesSubtitle', 'Operational cybersecurity best practices, workstation safety rules, and credential handling requirements for authorized platform users.')}
      lastUpdated="August 2026"
      activeRoute="/security-guidelines"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDELINES.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.num} className="bg-white border border-[#E7ECF3] rounded-[18px] p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-[#0B1F4D]/25 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#C79A2B]" />
                    </div>
                    <span className="font-mono font-extrabold text-xs text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                      RULE {g.num}
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
              <h3 className="text-base font-extrabold text-[#0F172A]">{t('public.contactSupportTitle', 'Report a Security Concern')}</h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                {t('public.contactSupportSubtitle', 'Observed potential account tampering, suspicious IP activity, or compromised officer credentials?')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('public-contact-support')}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Mail className="w-4 h-4 text-white" />
            <span>{t('nav.contactSupport', 'Notify Security Team')}</span>
          </button>
        </div>

      </div>
    </InfoPageLayout>
  );
}
