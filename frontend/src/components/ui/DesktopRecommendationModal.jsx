import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'crimeintel_desktop_notice_dismissed';
const BREAKPOINT = 1024; // Mobile and tablet screens below 1024px

export default function DesktopRecommendationModal() {
  const [isOpen, setIsOpen] = useState(false);

  const checkViewport = useCallback(() => {
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY);
      const isSmallScreen = window.innerWidth < BREAKPOINT;

      if (!isDismissed && isSmallScreen) {
        setIsOpen(true);
      } else if (!isSmallScreen) {
        // Automatically hide if resized to full desktop screen
        setIsOpen(false);
      }
    } catch {
      // Safe fallback
      if (window.innerWidth < BREAKPOINT) {
        setIsOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    // Initial check on mount
    checkViewport();

    // Listen for resize and orientation change events
    window.addEventListener('resize', checkViewport, { passive: true });
    window.addEventListener('orientationchange', checkViewport, { passive: true });

    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, [checkViewport]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Safe fallback
    }
  }, []);

  // Keyboard accessibility: Close dialog on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container — White and Red Theme */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-modal-title"
            aria-describedby="desktop-modal-desc"
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-sm sm:max-w-md bg-white border border-[#FEE2E2] rounded-[24px] shadow-[0_20px_50px_rgba(224,0,0,0.12),0_10px_30px_rgba(15,23,42,0.08)] p-6 sm:p-8 text-center z-10 overflow-hidden"
          >
            {/* Close Button "×" */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full text-[#94A3B8] hover:text-[#E00000] hover:bg-[#FFF1F1] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Red Desktop / Monitor Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1F1] text-[#E00000] border border-[#FECACA] flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Monitor className="w-7 h-7 text-[#E00000]" />
            </div>

            {/* Title */}
            <h2 id="desktop-modal-title" className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
              Better on Desktop
            </h2>

            {/* Supporting Message */}
            <p id="desktop-modal-desc" className="text-xs sm:text-sm text-[#64748B] leading-relaxed mt-2.5 max-w-sm mx-auto font-normal">
              CrimeIntel is currently optimized for desktop and larger screens for the best experience. For the full interface and analytics experience, we recommend using a desktop or laptop.
            </p>

            {/* Primary Action Button — Red Theme */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-[#E00000] hover:bg-[#C90000] active:bg-[#B30000] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E00000] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Continue Anyway
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
