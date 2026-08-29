import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import kspLogo from '../../../assets/ksp-official-logo.webp';
import LazyImage from '../../ui/LazyImage';

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'modules', label: 'Modules' },
  { id: 'about', label: 'About' },
];

export default function Navbar({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['home', 'features', 'workflow', 'modules', 'about'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(sections[i]);
        if (sectionEl && sectionEl.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-md ${scrolled ? 'bg-[#C90000] py-2.5' : 'bg-[#E00000] py-3.5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Brand */}
          <div className="-ml-1 sm:-ml-2 lg:-ml-3 flex items-center gap-3 cursor-pointer group" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveSection('home'); }}>
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-1 shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-[1.02] overflow-hidden">
              <LazyImage
                src={kspLogo}
                alt="Karnataka State Police Emblem"
                className="h-full w-auto object-contain"
                containerClassName="w-full h-full"
                loading="eager"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-none flex items-center gap-1.5">
                KARNATAKA POLICE
                <span className="text-[10px] bg-[#D49A00] text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">KSP</span>
              </h1>
              <p className="text-[11px] text-[#F5E7C1] font-medium tracking-wide mt-0.5">Crime Analytics Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setActiveSection(link.id)}
                  className={`relative text-sm transition-colors duration-200 ${
                    isActive ? 'font-bold text-white' : 'font-semibold text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-0 w-full h-[3px] bg-[#D49A00] rounded-full transition-all duration-300" />
                  )}
                </a>
              );
            })}
            <button onClick={onLoginClick} className="px-5 py-2 text-sm font-extrabold text-[#E00000] bg-white hover:bg-[#FFF1F1] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ml-2">
              Login Portal
            </button>
          </div>

          <button className="md:hidden text-white p-2 hover:text-[#F5E7C1]" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#C90000] border-t border-[#E00000] shadow-lg px-4 py-5 space-y-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`block text-sm transition-colors ${
                activeSection === link.id ? 'font-bold text-[#F5E7C1]' : 'font-semibold text-white hover:text-[#F5E7C1]'
              }`}
              onClick={() => { setIsOpen(false); setActiveSection(link.id); }}
            >
              {link.label}
            </a>
          ))}
          <button onClick={() => { setIsOpen(false); onLoginClick(); }} className="w-full px-5 py-2.5 text-sm font-extrabold text-[#E00000] bg-white hover:bg-[#FFF1F1] rounded-xl transition-colors shadow-sm cursor-pointer">Login Portal</button>
        </div>
      )}
    </nav>
  );
}
