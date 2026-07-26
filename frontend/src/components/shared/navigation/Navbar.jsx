import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import kspLogo from '../../../assets/ksp-logo.png';

export default function Navbar({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 bg-[#0B2341] ${scrolled ? 'py-3 shadow-md border-b border-[#0B2341]/40' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
            <img 
              src={kspLogo} 
              alt="Karnataka State Police Emblem" 
              className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]" 
            />
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight flex items-center gap-1.5">
                KARNATAKA POLICE
                <span className="text-[10px] bg-[#C79A2B]/20 text-[#C79A2B] border border-[#C79A2B]/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">KSP</span>
              </h1>
              <p className="text-[11px] text-slate-200 font-medium tracking-wide">Crime Analytics Platform</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-sm font-semibold text-slate-200 hover:text-[#C79A2B] transition-colors">Home</a>
            <a href="#features" className="text-sm font-semibold text-slate-200 hover:text-[#C79A2B] transition-colors">Features</a>
            <a href="#workflow" className="text-sm font-semibold text-slate-200 hover:text-[#C79A2B] transition-colors">Workflow</a>
            <a href="#modules" className="text-sm font-semibold text-slate-200 hover:text-[#C79A2B] transition-colors">Modules</a>
            <a href="#about" className="text-sm font-semibold text-slate-200 hover:text-[#C79A2B] transition-colors">About</a>
            <button onClick={onLoginClick} className="px-5 py-2.5 text-sm font-extrabold text-[#0B2341] bg-white hover:bg-slate-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              Login Portal
            </button>
          </div>

          <button className="md:hidden text-white p-2 hover:text-[#C79A2B]" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-[#0B2341] border-b border-[#0B2341]/60 shadow-lg absolute w-full px-4 py-5 space-y-4">
          <a href="#home" className="block text-sm font-semibold text-slate-200 hover:text-[#C79A2B]" onClick={() => setIsOpen(false)}>Home</a>
          <a href="#features" className="block text-sm font-semibold text-slate-200 hover:text-[#C79A2B]" onClick={() => setIsOpen(false)}>Features</a>
          <a href="#workflow" className="block text-sm font-semibold text-slate-200 hover:text-[#C79A2B]" onClick={() => setIsOpen(false)}>Workflow</a>
          <a href="#modules" className="block text-sm font-semibold text-slate-200 hover:text-[#C79A2B]" onClick={() => setIsOpen(false)}>Modules</a>
          <a href="#about" className="block text-sm font-semibold text-slate-200 hover:text-[#C79A2B]" onClick={() => setIsOpen(false)}>About</a>
          <button onClick={() => { setIsOpen(false); onLoginClick(); }} className="w-full px-5 py-2.5 text-sm font-extrabold text-[#0B2341] bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-sm cursor-pointer">Login Portal</button>
        </div>
      )}
    </nav>
  );
}
