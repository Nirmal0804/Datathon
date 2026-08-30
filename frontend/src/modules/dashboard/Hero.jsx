import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import kspLogo from '../../assets/ksp-official-logo.webp';
import vidhanSoudha from '../../assets/vidhan-soudha-exact.webp';
import { useTranslation } from '../../i18n';

export default function Hero({ onLoginClick }) {
  const { t } = useTranslation();

  const handleReadDocumentation = () => {
    window.open('./crimeintel-architecture-documentation.pdf', '_blank');
  };

  return (
    <section 
      id="home" 
      className="relative w-full min-h-[540px] lg:min-h-[600px] pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-200/60 bg-white"
    >
      {/* High-res Vidhan Soudha Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-[position:90%_center] lg:bg-[position:95%_center] bg-no-repeat opacity-100 z-0"
        style={{ backgroundImage: `url(${vidhanSoudha})`, imageRendering: '-webkit-optimize-contrast' }}
      />

      {/* Smooth left white gradient backdrop (covers only left text column, leaving center & right side 100% crisp & untouched) */}
      <div className="absolute inset-y-0 left-0 w-full max-w-xl lg:max-w-2xl bg-gradient-to-r from-white via-white/80 via-50% to-transparent z-[1] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-2xl text-left">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 bg-white/90 text-slate-800 text-xs font-bold shadow-sm mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-[#142B45]" />
            <span className="tracking-wider uppercase">{t('home.heroBadge', 'STATE INTELLIGENCE NETWORK')}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E00000] ml-0.5 animate-pulse" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-2"
          >
            <span className="text-[#142B45] block">{t('home.heroTitle1', 'Predict. Prevent.')}</span>
            <span className="text-[#D49A00] block mt-1">{t('home.heroTitle2', 'Protect Karnataka.')}</span>
          </motion.h1>

          {/* Red Underline */}
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 56 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="h-1 bg-[#E00000] rounded-full my-5" 
          />

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
            className="text-base sm:text-lg text-[#142B45]/80 max-w-xl font-normal leading-relaxed mb-8"
          >
            {t('home.heroDesc', 'An AI-driven crime analytics and visualization platform providing real-time intelligence, geospatial mapping, and predictive modeling for law enforcement.')}
          </motion.p>

          {/* Buttons on same row */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24, ease: "easeOut" }}
            className="flex flex-row items-center gap-4 flex-wrap"
          >
            <button 
              onClick={onLoginClick} 
              className="px-6 py-3.5 text-sm font-semibold text-white bg-[#E00000] hover:bg-[#C90000] rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 active:translate-y-0 cursor-pointer"
            >
              {t('home.heroCta', 'Access Dashboard')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleReadDocumentation}
              className="px-6 py-3.5 text-sm font-semibold text-[#E00000] bg-white border border-[#E00000] hover:bg-[#FFF1F1] rounded-xl transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 flex items-center gap-2 active:translate-y-0 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#E00000]" />
              {t('home.heroReadDocs', 'Read Documentation')}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
