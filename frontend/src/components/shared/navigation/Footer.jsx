import React from 'react';
import {
  Shield, ShieldCheck, Mail, ChevronRight,
  Headphones, Lock, HelpCircle, Globe, Share2
} from 'lucide-react';
import kspLogo from '../../../assets/ksp-official-logo.webp';
import LazyImage from '../../ui/LazyImage';
import { getRoleNavItems } from '../../../modules/dashboard/components/AnalystTopNav';

export default function Footer({ onLoginClick, rounded = false, role = null, activeModule = null, activeRoute = null, onNavigate = null }) {
  const roleNavItems = role ? getRoleNavItems(role) : null;

  return (
    <footer className={`bg-[#E00000] text-white pt-12 pb-8 relative z-10 transition-all ${
      rounded
        ? 'rounded-[20px] border border-[#C90000] shadow-md overflow-hidden w-full'
        : 'border-t border-[#C90000]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 4-Column Main Footer Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 text-left">

          {/* 1. BRAND INFORMATION — LEFT (lg:col-span-4) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-1 shadow-xs shrink-0 overflow-hidden">
                <LazyImage
                  src={kspLogo}
                  alt="Karnataka State Police Emblem"
                  className="h-full w-auto object-contain"
                  containerClassName="w-full h-full"
                  loading="lazy"
                />
              </div>
              <div>
                <span className="text-white font-extrabold tracking-tight text-base sm:text-lg flex items-center gap-1.5 leading-none">
                  KARNATAKA POLICE
                  <span className="text-[10px] bg-[#D49A00] text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">KSP</span>
                </span>
                <p className="text-xs text-white/80 font-medium tracking-wide mt-1">
                  AI-Driven Crime Analytics Platform
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed mb-6 max-w-sm">
              Empowering law enforcement with intelligent analytics, actionable insights, and secure data-driven decision making.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" title="Security Platform">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" title="Official Network">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" title="Intelligence Share">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer" title="Contact Email">
                <Mail className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* 2. PLATFORM — CENTER-LEFT (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-extrabold text-white tracking-wider uppercase mb-1">
              PLATFORM
            </h4>
            <div className="w-6 h-0.5 bg-[#D49A00] rounded-full mb-4" />

            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              {roleNavItems ? (
                roleNavItems.map((item) => {
                  const isActive = activeModule === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate(item.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer text-left ${
                          isActive ? 'text-[#D49A00] font-bold' : 'text-white/90 hover:text-white font-medium'
                        }`}
                      >
                        <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#D49A00]' : 'text-white/80'}`} />
                        {item.name}
                      </button>
                    </li>
                  );
                })
              ) : (
                <>
                  {[
                    { label: 'Home', href: '#home' },
                    { label: 'Features', href: '#features' },
                    { label: 'Workflow', href: '#workflow' },
                    { label: 'Modules', href: '#modules' },
                    { label: 'About', href: '#about' },
                  ].map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => onLoginClick && onLoginClick()}
                      className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer text-left font-medium text-xs sm:text-sm"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                      Login Portal
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* 3. RESOURCES — CENTER-RIGHT (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-extrabold text-white tracking-wider uppercase mb-1">
              RESOURCES
            </h4>
            <div className="w-6 h-0.5 bg-[#D49A00] rounded-full mb-4" />

            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              {[
                { label: 'Privacy Policy', route: 'public-privacy', path: '/privacy' },
                { label: 'Terms of Service', route: 'public-terms', path: '/terms' },
                { label: 'Security Audit', route: 'public-security-audit', path: '/security-audit' },
                { label: 'Support', route: 'public-support', path: '/support' },
                { label: 'Documentation', route: 'public-documentation', path: '/documentation' },
                { label: 'API Access', route: 'public-api-access', path: '/api-access' },
              ].map((item) => {
                const isActive = activeRoute === item.path || activeModule === item.route || activeModule === item.path;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate(item.path);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer text-left ${
                        isActive ? 'text-[#D49A00] font-bold' : 'text-white/90 hover:text-white font-medium'
                      }`}
                    >
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#D49A00]' : 'text-white/80'}`} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 4. SUPPORT — RIGHT (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-extrabold text-white tracking-wider uppercase mb-1">
              SUPPORT
            </h4>
            <div className="w-6 h-0.5 bg-[#D49A00] rounded-full mb-4" />

            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              {[
                { label: 'Help Center', route: 'public-help', path: '/help', icon: Headphones },
                { label: 'Security Guidelines', route: 'public-security-guidelines', path: '/security-guidelines', icon: Lock },
                { label: 'FAQs', route: 'public-faqs', path: '/faqs', icon: HelpCircle },
                { label: 'Contact Support', route: 'public-contact-support', path: '/contact-support', icon: Mail },
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeRoute === item.path || activeModule === item.route || activeModule === item.path;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate(item.path);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`inline-flex items-center gap-2 transition-colors cursor-pointer text-left ${
                        isActive ? 'text-[#D49A00] font-bold' : 'text-white/90 hover:text-white font-medium'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#D49A00]' : 'text-white'}`} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* BOTTOM AREA: Divider & Copyright + Security Status */}
        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/90">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <p>
              &copy; {new Date().getFullYear()} AI-Driven Crime Analytics Platform. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-2 font-extrabold text-xs tracking-wider uppercase text-white">
            <span className="w-2 h-2 rounded-full bg-[#D49A00] animate-pulse" />
            SECURE GOVERNMENT NETWORK CONNECTION
          </div>
        </div>

      </div>
    </footer>
  );
}
