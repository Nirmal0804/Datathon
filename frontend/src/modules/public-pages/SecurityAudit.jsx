import React from 'react';
import { Shield, Lock, Key, FileCheck, Activity, Globe, Eye, ShieldCheck, Server, AlertTriangle } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';
import { useTranslation } from '../../i18n';

export default function SecurityAudit({ onNavigate, onLoginClick, role = null }) {
  const { t } = useTranslation();

  const controls = [
    {
      title: t('public.ctrlJwtTitle', 'JWT Bearer Authentication'),
      status: t('public.statusImplemented', 'Implemented'),
      category: t('public.catAuth', 'Authentication'),
      desc: t('public.ctrlJwtDesc', 'Stateless JWT session tokens verified via symmetric or JWKS asymmetric signing with explicit issuer, audience, and expiration claims.'),
      icon: Key,
    },
    {
      title: t('public.ctrlRbacTitle', 'Role-Based Access Control (RBAC)'),
      status: t('public.statusImplemented', 'Implemented'),
      category: t('public.catAuthz', 'Authorization'),
      desc: t('public.ctrlRbacDesc', 'Strict dependency-injected permission enforcement (e.g. dashboard.read, districts.read, admin.audit) across all FastAPI HTTP endpoints.'),
      icon: Lock,
    },
    {
      title: t('public.ctrlAuditTitle', 'Comprehensive Audit Logging'),
      status: t('public.statusImplemented', 'Implemented'),
      category: t('public.catAccountability', 'Accountability'),
      desc: t('public.ctrlAuditDesc', 'Automated audit event capture tracking user actions, operator IDs, requesting client IPs, severity ratings, and target resources.'),
      icon: FileCheck,
    },
    {
      title: t('public.ctrlRateTitle', 'API Rate Limiting & Throttling'),
      status: t('public.statusImplemented', 'Implemented'),
      category: t('public.catAvailability', 'Availability'),
      desc: t('public.ctrlRateDesc', 'IP and token-based rate limiting guards to defend backend endpoints against brute-force attacks and denial-of-service attempts.'),
      icon: Activity,
    },
    {
      title: t('public.ctrlCorsTitle', 'CORS & Strict Origin Validation'),
      status: t('public.statusImplemented', 'Implemented'),
      category: t('public.catTransport', 'Transport'),
      desc: t('public.ctrlCorsDesc', 'Configurable allowed origins restricting cross-origin resource requests strictly to authorized police workstation domains.'),
      icon: Globe,
    },
    {
      title: t('public.ctrlValidationTitle', 'Input Validation & Pydantic Sanitization'),
      status: t('public.statusImplemented', 'Implemented'),
      category: t('public.catDataIntegrity', 'Data Integrity'),
      desc: t('public.ctrlValidationDesc', 'All HTTP request bodies, path parameters, and query parameters validated against strict type-safe Pydantic schemas.'),
      icon: ShieldCheck,
    },
    {
      title: t('public.ctrlExceptionTitle', 'Exception & Traceback Masking'),
      status: t('public.statusImplemented', 'Implemented'),
      category: t('public.catInfoProtection', 'Information Protection'),
      desc: t('public.ctrlExceptionDesc', 'Structured global exception handlers that prevent database internals, file paths, or sensitive backend tracebacks from leaking in HTTP responses.'),
      icon: Eye,
    },
    {
      title: t('public.ctrlAdminTitle', 'Protected Administrative Functions'),
      status: t('public.statusImplemented', 'Implemented'),
      category: t('public.catPrivilegeMgmt', 'Privilege Management'),
      desc: t('public.ctrlAdminDesc', 'High-privilege user and role management routes restricted exclusively to verified administrator claims with full event traceability.'),
      icon: Shield,
    },
  ];

  return (
    <InfoPageLayout
      title={t('public.securityAuditTitle', 'Security Audit')}
      category={t('nav.resources', 'Resources')}
      description={t('public.securityAuditSubtitle', 'Security and accountability are built into the CrimeIntel platform through layered authentication, authorization, monitoring, and API protection.')}
      lastUpdated={t('public.august2026', 'August 2026')}
      activeRoute="/security-audit"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="space-y-8">
        
        {/* Intro Card */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.auditPostureTitle', 'Platform Security Posture')}</h2>
              <p className="text-xs text-[#64748B] font-semibold">{t('public.auditPostureDesc', 'Technical controls and defensive architecture')}</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {t('public.auditPostureText', 'The CrimeIntel architecture enforces defense-in-depth across the web presentation tier, serverless gateway, and analytical data layers. The controls documented below represent the technical capabilities actively implemented in the current system version.')}
          </p>
        </div>

        {/* Implemented Security Controls Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">{t('public.implementedControlsTitle', 'Implemented Security Controls')}</h2>
              <p className="text-xs text-[#64748B]">{t('public.implementedControlsDesc', 'Layered defenses actively running in production')}</p>
            </div>
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {t('public.activeLayersBadge', '8 Active Layers')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {controls.map((ctrl) => {
              const Icon = ctrl.icon;
              return (
                <div key={ctrl.title} className="bg-white border border-[#E7ECF3] rounded-[18px] p-5 shadow-xs flex flex-col justify-between hover:border-[#0B1F4D]/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
                          <Icon className="w-4 h-4 text-[#C79A2B]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{ctrl.category}</span>
                          <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">{ctrl.title}</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {ctrl.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {ctrl.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Verification Matrix */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
              <Server className="w-5 h-5 text-[#0B1F4D]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">{t('public.verificationMatrixTitle', 'Security Verification Matrix')}</h2>
              <p className="text-xs text-[#64748B]">{t('public.verificationMatrixDesc', 'Operational validation and governance tiers')}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7ECF3] bg-[#F8F9FB]">
                  <th className="py-3 px-4 font-extrabold text-[#0F172A] uppercase tracking-wider">{t('public.thControlArea', 'Control Area')}</th>
                  <th className="py-3 px-4 font-extrabold text-[#0F172A] uppercase tracking-wider">{t('public.thStatusTier', 'Status Tier')}</th>
                  <th className="py-3 px-4 font-extrabold text-[#0F172A] uppercase tracking-wider">{t('public.thOpContext', 'Operational Context')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7ECF3]/60">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">{t('public.matrixRow1Area', 'API Ingress & TLS Encryption')}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> {t('public.statusImplemented', 'Implemented')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">{t('public.matrixRow1Context', 'TLS 1.3 termination managed by Catalyst Serverless Gateway with automatic HTTPS redirection.')}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">{t('public.matrixRow2Area', 'JWT Signature Verification')}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> {t('public.statusImplemented', 'Implemented')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">{t('public.matrixRow2Context', 'Backend verifier enforces token signature, subject, and issuer validity on every protected route.')}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">{t('public.matrixRow3Area', 'Infrastructure Instance Scaling')}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <Activity className="w-3 h-3" /> {t('public.statusConfigDependent', 'Config-Dependent')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">{t('public.matrixRow3Context', 'Configurable min/max container instances in AppSail management console according to traffic loads.')}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">{t('public.matrixRow4Area', 'Privilege & Role Membership Review')}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3 h-3" /> {t('public.statusPeriodicReview', 'Periodic Review')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">{t('public.matrixRow4Context', 'Department administrators must perform periodic roster audits to deprecate decommissioned accounts.')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </InfoPageLayout>
  );
}

