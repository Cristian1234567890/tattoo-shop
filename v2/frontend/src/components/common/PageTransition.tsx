import React from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';

const defaultPageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const reducedPageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.15,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? reducedPageVariants : defaultPageVariants;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'transform, opacity' }}
      className={`w-full flex-1 flex flex-col min-h-0 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
