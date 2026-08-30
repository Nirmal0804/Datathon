import React from 'react';
import { AlertCircle } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

export default function TermsOfService({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();

  return (
    <InfoPageLayout
      title={t('public.termsTitle', 'Terms of Service')}
      category={t('nav.resources', 'Resources')}
      description={t('public.termsSubtitle', 'Guidelines, usage policies, and operational conditions governing authorized access to the CrimeIntel intelligence and analytics ecosystem.')}
      lastUpdated="August 2026"
      activeRoute="/terms"
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
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Purpose of the Platform</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            The CrimeIntel application is intended exclusively for official law enforcement, investigative, crime prevention, and analytical operations within the Karnataka State Police jurisdiction. All use of this application must align strictly with authorized departmental duties and statutory obligations.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              02
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Authorized Use & Credentials</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Access to CrimeIntel is restricted to verified police personnel who have been issued individual officer or administrator accounts. Users must:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-[#475569] space-y-1.5 leading-relaxed">
            <li>Maintain the strict confidentiality of their personal credentials, passwords, and security tokens.</li>
            <li>Never share individual login credentials with colleagues or third parties.</li>
            <li>Immediately notify system administrators if unauthorized access or compromised credentials are suspected.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              03
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Acceptable Use & Prohibited Activities</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Authorized personnel must use the system in a professional and lawful manner. The following activities are strictly prohibited:
          </p>
          <div className="p-4 rounded-xl bg-red-50/60 border border-red-100 text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              Prohibited Actions:
            </div>
            <ul className="list-disc pl-5 space-y-1 text-red-800">
              <li>Querying records, case histories, or personal dossiers for non-official or personal reasons.</li>
              <li>Exporting or transmitting sensitive crime intelligence to unauthorized external systems or unapproved media.</li>
              <li>Attempting to bypass Role-Based Access Control restrictions, reverse engineer API endpoints, or conduct unauthorized vulnerability probing.</li>
              <li>Sharing or publishing intelligence snapshots, hotspot models, or predictive risk indicators to non-departmental entities.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              04
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Data Stewardship & Auditability</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            All actions conducted on the CrimeIntel platform—including logins, record lookups, report downloads, filter executions, and administrative modifications—are logged permanently in immutable audit records. Officers acknowledge that audit logs are reviewed routinely to ensure accountability and policy adherence.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              05
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">System Availability & Maintenance</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            While CrimeIntel is architected for high reliability on cloud serverless infrastructure, occasional planned maintenance or database sync cycles may be required. Advance notice will be communicated through operational bulletin channels when possible.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              06
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Contact & Inquiries</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Questions regarding terms of use or operational governance should be addressed to the Karnataka Police Information Technology Division or submitted via the{' '}
            <button
              onClick={() => onNavigate && onNavigate('public-contact-support')}
              className="text-[#0B1F4D] font-bold underline hover:text-[#C79A2B] cursor-pointer"
            >
              Contact Support page
            </button>.
          </p>
        </section>

      </div>
    </InfoPageLayout>
  );
}
