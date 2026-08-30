import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable BackToTop floating button.
 * Automatically appears after scrolling down ~350px and provides a smooth scroll back to the top.
 * Visual Theme: Red (#E00000) button with Gold (#D49A00 / #F5E7C1) arrow accent.
 */
export default function BackToTop({ threshold = 350 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setIsVisible(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (document.body) {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const mainEl = document.querySelector('main');
    if (mainEl && mainEl.scrollTop > 0) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E00000] hover:bg-[#C90000] text-[#F5E7C1] hover:text-white flex items-center justify-center shadow-[0_6px_20px_rgba(224,0,0,0.35)] border border-[#D49A00]/40 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D49A00] focus-visible:ring-offset-2 cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
