import React, { useEffect } from 'react';
import { ChevronRight, Home, LayoutDashboard } from 'lucide-react';
import Navbar from '../../../components/shared/navigation/Navbar';
import Footer from '../../../components/shared/navigation/Footer';

export default function InfoPageLayout({
  title,
  category = 'Resources',
  description,
  activeRoute,
  lastUpdated,
  onNavigate,
  onLoginClick,
  role = null,
  children,
}) {
  useEffect(() => {
    document.title = `CrimeIntel | ${title}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [title]);

  const handleRootClick = (e) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate(role ? '/dashboard' : '/');
    }
  };

  const handleDashboardOrLogin = () => {
    if (role && onNavigate) {
      onNavigate('/dashboard');
    } else if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-[#0F172A] flex flex-col selection:bg-[#0B1F4D]/10 selection:text-[#0B1F4D]">
      {/* Existing Global Navbar */}
      <Navbar
        onLoginClick={handleDashboardOrLogin}
        onHomeClick={handleRootClick}
        role={role}
      />

      {/* Hero / Header Section with spacing for fixed navbar */}
      <header className="pt-24 sm:pt-28 pb-8 sm:pb-10 bg-white border-b border-[#E7ECF3] shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-4 flex-wrap">
            <button
              onClick={handleRootClick}
              className="inline-flex items-center gap-1 hover:text-[#0B1F4D] transition-colors cursor-pointer"
            >
              {role ? (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Dashboard</span>
                </>
              ) : (
                <>
                  <Home className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Home</span>
                </>
              )}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-[#64748B] font-medium">{category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-bold text-[#0B1F4D] truncate">{title}</span>
          </nav>

          {/* Category Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 text-[#0B1F4D] font-extrabold text-[11px] uppercase tracking-wider mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C79A2B]" />
            {category}
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
            {title}
          </h1>

          {description && (
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-3xl font-normal">
              {description}
            </p>
          )}

          {lastUpdated && (
            <p className="text-xs font-semibold text-[#94A3B8] mt-3">
              Last Updated: <span className="text-[#64748B] font-bold">{lastUpdated}</span>
            </p>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          {children}
        </div>
      </main>

      {/* Existing Global Footer */}
      <Footer
        onLoginClick={handleDashboardOrLogin}
        onNavigate={onNavigate}
        role={role}
        activeRoute={activeRoute}
      />
    </div>
  );
}
