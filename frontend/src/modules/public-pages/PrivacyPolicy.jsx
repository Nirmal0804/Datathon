import React from 'react';
import { Eye, FileText, Server, UserCheck } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';

export default function PrivacyPolicy({ onNavigate, onLoginClick, role = null }) {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      category="Resources"
      description="Describes how law enforcement data, authentication credentials, and transactional intelligence are securely handled, processed, and safeguarded within the CrimeIntel platform."
      lastUpdated="August 2026"
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
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Platform Overview & Purpose</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            The CrimeIntel system is a specialized law enforcement analytics application designed for Karnataka State Police operations. It provides authorized officers and intelligence analysts with spatial crime analysis, incident forecasting, and multi-district intelligence summaries. Protecting the integrity and confidentiality of this operational telemetry is fundamental to the platform's design.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              02
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Information We Process</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            CrimeIntel processes strictly defined categories of operational and administrative data necessary for platform functionality:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                <UserCheck className="w-4 h-4 text-[#C79A2B]" />
                User Authentication Data
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Officer usernames, role classifications (Field Officer, Intelligence Analyst, Administrator), and cryptographically signed JWT session tokens.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                <FileText className="w-4 h-4 text-[#C79A2B]" />
                Crime & FIR Case Records
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                FIR identifiers, police station jurisdictions, IPC crime category codes, case status lifecycle, and offense timestamps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                <Eye className="w-4 h-4 text-[#C79A2B]" />
                Analytical Intelligence
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Geospatial cluster summaries (DBSCAN coordinates), Composite Crime Risk Index (CCRI) values, and aggregate temporal crime volume trends.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0B1F4D]">
                <Server className="w-4 h-4 text-[#C79A2B]" />
                System Audit & Security Telemetry
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Access timestamps, requesting IP addresses, API endpoint invocation logs, and administrative privilege change records.
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
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">How Information Is Used</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            All data processed by the platform is utilized solely for lawful law enforcement intelligence objectives:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-[#475569] space-y-1.5 leading-relaxed">
            <li>Generating jurisdictional crime distribution heatmaps and precinct density metrics.</li>
            <li>Enabling field personnel to track active investigation queues and intake records.</li>
            <li>Detecting cross-district co-offender syndicates through network graph visualizations.</li>
            <li>Auditing administrative actions to maintain compliance with departmental oversight.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              04
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Access Control & Authorization</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Access to platform modules is strictly gated by Role-Based Access Control (RBAC). Field Officers, Intelligence Analysts, and Administrators are granted granular API permissions (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">dashboard.read</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">districts.read</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">admin.audit</code>). Unauthenticated or unauthorized requests are rejected at the API gateway layer with standard HTTP 401/403 status codes.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              05
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Technical Data Security Controls</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Implemented technical safeguards include:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-[#475569] space-y-1.5 leading-relaxed">
            <li><strong>Transport Security:</strong> All client-to-server traffic is encrypted using TLS 1.3/HTTPS.</li>
            <li><strong>Token Signing:</strong> Authentication sessions use cryptographically verified Bearer tokens.</li>
            <li><strong>Rate Limiting:</strong> Ingress endpoints enforce sliding-window rate throttling to protect API availability.</li>
            <li><strong>Security Headers:</strong> Responses enforce <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">X-Content-Type-Options: nosniff</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">X-Frame-Options: DENY</code>, and restrictive CORS origins.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              06
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Data Retention & Third-Party Infrastructure</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Crime record retention schedules and audit log lifecycles follow departmental police data management policies. CrimeIntel does not sell, market, or share data with advertising brokers. Cloud execution and hosting are managed through Zoho Catalyst serverless infrastructure and configured enterprise database backends.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 border-t border-[#F1F5F9] pt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center font-extrabold text-xs">
              07
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Questions & Policy Updates</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            This policy is periodically reviewed to reflect technical updates to the platform. For inquiries regarding data handling or privacy controls, please contact your designated precinct system administrator or visit the{' '}
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
