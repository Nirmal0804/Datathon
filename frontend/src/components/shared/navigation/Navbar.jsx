import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';

export default function Navbar({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass-panel py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">KARNATAKA POLICE</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Crime Analytics Platform</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</a>
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Workflow</a>
            <a href="#modules" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Modules</a>
            <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
            <button onClick={onLoginClick} className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-[0_0_15px_rgba(180,83,9,0.4)]">
              Login Portal
            </button>
          </div>

          <button className="md:hidden text-slate-300" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden glass-panel absolute w-full px-4 py-4 space-y-4">
          <a href="#home" className="block text-sm font-medium text-slate-300" onClick={() => setIsOpen(false)}>Home</a>
          <a href="#features" className="block text-sm font-medium text-slate-300" onClick={() => setIsOpen(false)}>Features</a>
          <a href="#workflow" className="block text-sm font-medium text-slate-300" onClick={() => setIsOpen(false)}>Workflow</a>
          <a href="#modules" className="block text-sm font-medium text-slate-300" onClick={() => setIsOpen(false)}>Modules</a>
          <a href="#about" className="block text-sm font-medium text-slate-300" onClick={() => setIsOpen(false)}>About</a>
          <button onClick={() => { setIsOpen(false); onLoginClick(); }} className="w-full px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg">Login Portal</button>
        </div>
      )}
    </nav>
  );
}
