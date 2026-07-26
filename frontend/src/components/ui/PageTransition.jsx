import React from 'react';
import { motion } from 'framer-motion';

const PAGE_VARIANTS = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0  },
  exit:     { opacity: 0, y: -6 },
};

const PAGE_TRANSITION = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],
  duration: 0.22,
};

/**
 * Wraps page-level content with a subtle fade+slide animation.
 * Use as the outermost wrapper inside each module layout.
 */
export function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={PAGE_TRANSITION}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list animation — wrap a list container.
 * Children must use <ListItem> or set their own variants.
 */
export const LIST_CONTAINER = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

export const LIST_ITEM = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x:  0 },
};

export function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.4,0,0.2,1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay, ease: [0.4,0,0.2,1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
