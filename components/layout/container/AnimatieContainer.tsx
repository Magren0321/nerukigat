'use client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import React from 'react';

export const AnimateContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={shouldReduceMotion ? false : { y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={shouldReduceMotion ? undefined : { y: -30, opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
