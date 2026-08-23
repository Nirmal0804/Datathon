import React from 'react';
import kspLogo from '../../../assets/ksp-logo.jpg';

export default function Footer() {
  return (
    <footer className="bg-[#F8F9FB] py-14 md:py-16 border-t border-[#E6E8EC]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src={kspLogo} 
              alt="Karnataka State Police Emblem" 
              className="h-8 w-auto object-contain" 
            />
            <span className="text-[#111827] font-extrabold tracking-widest text-sm flex items-center gap-2">
              KARNATAKA POLICE
              <span className="text-[9px] bg-[#C79A2B]/15 text-[#C79A2B] font-bold px-1.5 py-0.5 rounded uppercase">KSP</span>
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-[#6B7280]">
            <a href="#" className="hover:text-[#153E75] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#153E75] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#153E75] transition-colors">Security Audit</a>
            <a href="#" className="hover:text-[#153E75] transition-colors">Support</a>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-[#E6E8EC] flex flex-col md:flex-row justify-between items-center text-xs text-[#6B7280]">
          <p>&copy; {new Date().getFullYear()} AI-Driven Crime Analytics Platform. All rights reserved.</p>
          <div className="mt-3 md:mt-0 flex items-center gap-2 font-mono uppercase tracking-widest text-[10px] text-[#153E75] bg-[#153E75]/5 px-3 py-1 rounded-full border border-[#153E75]/10">
            <span className="w-2 h-2 rounded-full bg-[#2E8B57] animate-pulse" />
            Secure Government Network Connection
          </div>
        </div>
      </div>
    </footer>
  );
}
