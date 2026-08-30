import React from 'react';
import { Eye, FileText, Server, UserCheck } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

export default function PrivacyPolicy({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();

  return (
    <InfoPageLayout
      title={t('public.privacyTitle', 'Privacy Policy')}
      category={t('nav.resources', 'Resources')}
      description={t('public.privacySubtitle', 'Describes how law enforcement data, authentication credentials, and transactional intelligence are securely handled, processed, and safeguarded within the CrimeIntel platform.')}
      lastUpdated={t('public.august2026', 'August 2026')}
      activeRoute="/privacy"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              01
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.privacySec1Title', 'Platform Overview & Purpose')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.privacySec1Desc', "The CrimeIntel system is a specialized law enforcement analytics application designed for Karnataka State Police operations. It provides authorized officers and intelligence analysts with spatial crime analysis, incident forecasting, and multi-district intelligence summaries. Protecting the integrity and confidentiality of this operational telemetry is fundamental to the platform's design.")}
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              02
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.privacySec2Title', 'Information We Process')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.privacySec2Desc', 'CrimeIntel processes strictly defined categories of operational and administrative data necessary for platform functionality:')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                <UserCheck className="w-4 h-4 text-[#C79A2B]" />
                {t('public.privacyUserAuthTitle', 'User Authentication Data')}
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t('public.privacyUserAuthDesc', 'Officer usernames, role classifications (Field Officer, Intelligence Analyst, Administrator), and cryptographically signed JWT session tokens.')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                <FileText className="w-4 h-4 text-[#C79A2B]" />
                {t('public.privacyCrimeRecordsTitle', 'Crime & FIR Case Records')}
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t('public.privacyCrimeRecordsDesc', 'FIR identifiers, police station jurisdictions, IPC crime category codes, case status lifecycle, and offense timestamps.')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                <Eye className="w-4 h-4 text-[#C79A2B]" />
                {t('public.privacyAnalyticsTitle', 'Analytical Intelligence')}
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t('public.privacyAnalyticsDesc', 'Geospatial cluster summaries (DBSCAN coordinates), Composite Crime Risk Index (CCRI) values, and aggregate temporal crime volume trends.')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                <Server className="w-4 h-4 text-[#C79A2B]" />
                {t('public.privacyAuditTitle', 'System Audit & Security Telemetry')}
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t('public.privacyAuditDesc', 'Access timestamps, requesting IP addresses, API endpoint invocation logs, and administrative privilege change records.')}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              03
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.privacySec3Title', 'How Information Is Used')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.privacySec3Desc', 'All data processed by the platform is utilized solely for lawful law enforcement intelligence objectives:')}
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-[#475569] space-y-1.5 leading-relaxed">
            <li>{t('public.privacySec3B1', 'Generating jurisdictional crime distribution heatmaps and precinct density metrics.')}</li>
            <li>{t('public.privacySec3B2', 'Enabling field personnel to track active investigation queues and intake records.')}</li>
            <li>{t('public.privacySec3B3', 'Detecting cross-district co-offender syndicates through network graph visualizations.')}</li>
            <li>{t('public.privacySec3B4', 'Auditing administrative actions to maintain compliance with departmental oversight.')}</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              04
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.privacySec4Title', 'Access Control & Authorization')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.privacySec4Desc', 'Access to platform modules is strictly gated by Role-Based Access Control (RBAC). Field Officers, Intelligence Analysts, and Administrators are granted granular API permissions (dashboard.read, districts.read, admin.audit). Unauthenticated or unauthorized requests are rejected at the API gateway layer with standard HTTP 401/403 status codes.')}
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              05
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.privacySec5Title', 'Technical Data Security Controls')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.privacySec5Desc', 'Implemented technical safeguards include:')}
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-[#475569] space-y-1.5 leading-relaxed">
            <li><strong>{t('public.privacySec5Transport', 'Transport Security:')}</strong> {t('public.privacySec5TransportDesc', 'All client-to-server traffic is encrypted using TLS 1.3/HTTPS.')}</li>
            <li><strong>{t('public.privacySec5Token', 'Token Signing:')}</strong> {t('public.privacySec5TokenDesc', 'Authentication sessions use cryptographically verified Bearer tokens.')}</li>
            <li><strong>{t('public.privacySec5Rate', 'Rate Limiting:')}</strong> {t('public.privacySec5RateDesc', 'Ingress endpoints enforce sliding-window rate throttling to protect API availability.')}</li>
            <li><strong>{t('public.privacySec5Headers', 'Security Headers:')}</strong> {t('public.privacySec5HeadersDesc', 'Responses enforce X-Content-Type-Options: nosniff, X-Frame-Options: DENY, and restrictive CORS origins.')}</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              06
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.privacySec6Title', 'Data Retention & Third-Party Infrastructure')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.privacySec6Desc', 'Crime record retention schedules and audit log lifecycles follow departmental police data management policies. CrimeIntel does not sell, market, or share data with advertising brokers. Cloud execution and hosting are managed through Zoho Catalyst serverless infrastructure and configured enterprise database backends.')}
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              07
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.privacySec7Title', 'Questions & Policy Updates')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.privacySec7Desc', 'This policy is periodically reviewed to reflect technical updates to the platform. For inquiries regarding data handling or privacy controls, please contact your designated precinct system administrator or visit the')}{' '}
            <button
              onClick={() => onNavigate && onNavigate('public-contact-support')}
              className="text-[#0B1F4D] font-bold underline hover:text-[#C79A2B] cursor-pointer"
            >
              {t('public.contactSupportPage', 'Contact Support page')}
            </button>.
          </p>
        </section>

      </div>
    </InfoPageLayout>
  );
}

