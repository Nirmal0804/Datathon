import React from 'react';
import kspLogo from '../../../assets/ksp-logo.jpg';

export default function Footer() {
  return (
    <footer className="bg-[#F7F8FA] py-14 md:py-16 border-t border-[#E8EEF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src={kspLogo} 
              alt="Karnataka State Police Emblem" 
              className="h-8 w-auto object-contain" 
            />
            <span className="text-[#142B45] font-extrabold tracking-widest text-sm flex items-center gap-2">
              KARNATAKA POLICE
              <span className="text-[9px] bg-[#D49A00]/20 text-[#D49A00] border border-[#D49A00]/40 font-bold px-1.5 py-0.5 rounded uppercase">KSP</span>
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-[#142B45]/70">
            <a href="#" className="hover:text-[#E00000] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#E00000] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#E00000] transition-colors">Security Audit</a>
            <a href="#" className="hover:text-[#E00000] transition-colors">Support</a>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-[#E8EEF5] flex flex-col md:flex-row justify-between items-center text-xs text-[#142B45]/60">
          <p>&copy; {new Date().getFullYear()} AI-Driven Crime Analytics Platform. All rights reserved.</p>
          <div className="mt-3 md:mt-0 flex items-center gap-2 font-mono uppercase tracking-widest text-[10px] text-[#E00000] bg-[#FFF1F1] px-3 py-1 rounded-full border border-[#E00000]/20">
            <span className="w-2 h-2 rounded-full bg-[#E00000] animate-pulse" />
            Secure Government Network Connection
          </div>
        </div>
      </div>
    </footer>
  );
}
